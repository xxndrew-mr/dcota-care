package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/joho/godotenv"
)

const MaxFileSize = 100 * 1024 * 1024

type PresignRequest struct {
	FileName string `json:"fileName"`
	FileType string `json:"fileType"`
	FileSize int64  `json:"fileSize"`
}

var s3PresignClient *s3.PresignClient

func initEnv() {
	if err := godotenv.Load(); err != nil {
		log.Println("Peringatan: File .env tidak ditemukan, menggunakan env system")
	}
}

func initR2() {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("auto"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			os.Getenv("R2_ACCESS_KEY_ID"),
			os.Getenv("R2_SECRET_ACCESS_KEY"),
			"",
		)),
	)
	if err != nil {
		log.Fatalf("Gagal load config AWS: %v", err)
	}

	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(os.Getenv("R2_ENDPOINT"))
	})

	s3PresignClient = s3.NewPresignClient(s3Client)
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"message": message})
}

func presignHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		respondWithError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan")
		return
	}

	var req PresignRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Format request body tidak valid")
		return
	}

	if req.FileName == "" || req.FileType == "" || req.FileSize == 0 {
		respondWithError(w, http.StatusBadRequest, "fileName, fileType, dan fileSize wajib diisi")
		return
	}

	isAllowed := strings.HasPrefix(req.FileType, "image/") ||
		strings.HasPrefix(req.FileType, "video/") ||
		req.FileType == "application/pdf"

	if !isAllowed {
		respondWithError(w, http.StatusBadRequest, "File harus berupa gambar, video, atau PDF")
		return
	}

	if req.FileSize > MaxFileSize {
		respondWithError(w, http.StatusRequestEntityTooLarge, "Ukuran file maksimal 100MB")
		return
	}

	re := regexp.MustCompile(`[^a-zA-Z0-9._-]`)
	safeName := re.ReplaceAllString(req.FileName, "_")
	key := fmt.Sprintf("attachments/%d-%s", time.Now().UnixMilli(), safeName)

	presignReq, err := s3PresignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(os.Getenv("R2_BUCKET_NAME")),
		Key:         aws.String(key),
		ContentType: aws.String(req.FileType),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = 5 * time.Minute
	})

	if err != nil {
		log.Println("R2 Presign Error:", err)
		respondWithError(w, http.StatusInternalServerError, "Gagal membuat upload URL")
		return
	}

	publicBaseUrl := os.Getenv("R2_PUBLIC_URL")
	if !strings.HasPrefix(publicBaseUrl, "http") {
		publicBaseUrl = "https://" + publicBaseUrl
	}
	fileUrl := fmt.Sprintf("%s/%s", publicBaseUrl, key)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"uploadUrl": presignReq.URL,
		"fileUrl":   fileUrl,
		"key":       key,
	})
}

func main() {
	initEnv()
	initR2()

	http.HandleFunc("/api/upload/presign", presignHandler)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server Golang berjalan di port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}