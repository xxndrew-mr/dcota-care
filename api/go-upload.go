package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

const MaxFileSize = 100 * 1024 * 1024

type PresignRequest struct {
	FileName string `json:"fileName"`
	FileType string `json:"fileType"`
	FileSize int64  `json:"fileSize"`
}

var s3PresignClient *s3.PresignClient

// init() berjalan otomatis saat cold start di Vercel
func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("auto"),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			os.Getenv("R2_ACCESS_KEY_ID"),
			os.Getenv("R2_SECRET_ACCESS_KEY"),
			"",
		)),
	)
	if err != nil {
		fmt.Println("Gagal load config AWS:", err)
		return
	}

	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		// FALLBACK 1: Pastikan Endpoint R2 tidak kosong
		endpoint := os.Getenv("R2_ENDPOINT")
		if endpoint == "" {
			endpoint = "https://39dc800083509340221b51e53ecca4c7.r2.cloudflarestorage.com"
		}
		o.BaseEndpoint = aws.String(endpoint)
	})

	s3PresignClient = s3.NewPresignClient(s3Client)
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"message": message})
}

// Handler adalah fungsi utama yang dibaca oleh Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	// SETUP CORS (Sangat krusial untuk Vercel Serverless)
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Tangkap preflight request dari browser
	if r.Method == http.MethodOptions {
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

	// FALLBACK 2: Pastikan nama bucket tidak kosong
	bucketName := os.Getenv("R2_BUCKET_NAME")
	if bucketName == "" {
		bucketName = "dcota-care"
	}

	presignReq, err := s3PresignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(key),
		ContentType: aws.String(req.FileType),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = 5 * time.Minute
	})

	if err != nil {
		fmt.Println("R2 Presign Error:", err)
		respondWithError(w, http.StatusInternalServerError, "Gagal membuat upload URL")
		return
	}

	// FALLBACK 3: Pastikan Public URL tidak kosong
	publicBaseUrl := os.Getenv("R2_PUBLIC_URL")
	if publicBaseUrl == "" {
		publicBaseUrl = "https://dcota.ondasystem.work"
	} else if !strings.HasPrefix(publicBaseUrl, "http") {
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