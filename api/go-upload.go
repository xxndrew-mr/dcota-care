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

	// Tanpa R2_ENDPOINT client dibiarkan nil — Handler membalas error konfigurasi
	// yang jelas alih-alih diam-diam memakai endpoint milik akun lain.
	endpoint := os.Getenv("R2_ENDPOINT")
	if endpoint == "" {
		fmt.Println("R2_ENDPOINT belum diset — endpoint upload dinonaktifkan")
		return
	}

	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
	})

	s3PresignClient = s3.NewPresignClient(s3Client)
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"message": message})
}

// requestBaseURL menentukan origin deployment ini (untuk validasi session & CORS).
func requestBaseURL(r *http.Request) string {
	if base := os.Getenv("NEXTAUTH_URL"); base != "" {
		return strings.TrimSuffix(base, "/")
	}
	host := r.Header.Get("X-Forwarded-Host")
	if host == "" {
		host = r.Host
	}
	proto := r.Header.Get("X-Forwarded-Proto")
	if proto == "" {
		proto = "https"
	}
	return proto + "://" + host
}

// isAuthenticated memvalidasi cookie session NextAuth dengan meneruskannya
// ke endpoint /api/auth/session pada deployment yang sama — validasi JWT
// tetap sepenuhnya dilakukan oleh NextAuth, bukan diduplikasi di Go.
func isAuthenticated(r *http.Request) bool {
	cookie := r.Header.Get("Cookie")
	if cookie == "" {
		return false
	}

	req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, requestBaseURL(r)+"/api/auth/session", nil)
	if err != nil {
		return false
	}
	req.Header.Set("Cookie", cookie)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Gagal validasi session:", err)
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false
	}

	// Saat tidak login, NextAuth membalas 200 dengan objek kosong {}.
	var session struct {
		User *struct {
			Name string `json:"name"`
		} `json:"user"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&session); err != nil {
		return false
	}
	return session.User != nil
}

// allowedOrigin hanya mengizinkan origin deployment ini sendiri (plus
// localhost untuk pengembangan) — bukan wildcard.
func allowedOrigin(r *http.Request) string {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return ""
	}
	if origin == requestBaseURL(r) || strings.HasPrefix(origin, "http://localhost:") {
		return origin
	}
	host := r.Header.Get("X-Forwarded-Host")
	if host == "" {
		host = r.Host
	}
	if origin == "https://"+host || origin == "http://"+host {
		return origin
	}
	return ""
}

func Handler(w http.ResponseWriter, r *http.Request) {
	if origin := allowedOrigin(r); origin != "" {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
	}
	w.Header().Set("Vary", "Origin")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		respondWithError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan")
		return
	}

	if !isAuthenticated(r) {
		respondWithError(w, http.StatusUnauthorized, "Anda harus login untuk mengunggah file")
		return
	}

	if s3PresignClient == nil {
		respondWithError(w, http.StatusInternalServerError, "Konfigurasi R2 belum lengkap (R2_ENDPOINT). Hubungi Admin.")
		return
	}

	if os.Getenv("R2_PUBLIC_URL") == "" {
		respondWithError(w, http.StatusInternalServerError, "Konfigurasi R2 belum lengkap (R2_PUBLIC_URL). Hubungi Admin.")
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

	bucketName := os.Getenv("R2_BUCKET_NAME")
	if bucketName == "" {
		bucketName = "dcota-care"
	}

	presignReq, err := s3PresignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(key),
		ContentType: aws.String(req.FileType),
		// Ukuran ikut ditandatangani — upload dengan ukuran berbeda dari yang
		// diklaim akan ditolak R2, sehingga batas 100MB benar-benar ditegakkan.
		ContentLength: aws.Int64(req.FileSize),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = 5 * time.Minute
	})

	if err != nil {
		fmt.Println("R2 Presign Error:", err)
		respondWithError(w, http.StatusInternalServerError, "Gagal membuat upload URL")
		return
	}

	publicBaseUrl := os.Getenv("R2_PUBLIC_URL")
	if !strings.HasPrefix(publicBaseUrl, "http") {
		publicBaseUrl = "https://" + publicBaseUrl
	}

	publicBaseUrl = strings.TrimSuffix(publicBaseUrl, "/")
	fileUrl := fmt.Sprintf("%s/%s", publicBaseUrl, key)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"uploadUrl": presignReq.URL,
		"fileUrl":   fileUrl,
		"key":       key,
	})
}
