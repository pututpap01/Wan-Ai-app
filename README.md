# 🎬 AI Video Generator Studio (Wan2.2 & Runway Core)

A modern full-stack AI Video Generation application featuring:
- **Wan2.1 / Wan2.2 Text-to-Video Engine** powered by Google Colab (Zero-Cost GPU via Ngrok tunnel).
- **RapidAPI / Runway ML Proxy** for cloud video rendering.
- **Local Real-Time Motion Canvas** for instant offline preview and export.
- **Android APK Ready** with Capacitor and automated GitHub Actions CI/CD.

---

## 🚀 Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# 2. Start development server (Port 3000)
npm run dev

# 3. Build for production
npm run build
```

---

## 📦 Git Push & Commit Workflow

### A. Initial Setup (First Time Push to GitHub)
```bash
# Inisialisasi Git (jika belum ada)
git init

# Tambahkan semua file
git add .

# Buat initial commit
git commit -m "feat: initial commit of AI Video Studio with Wan2.2 Colab integration"

# Ubah branch ke main
git branch -M main

# Hubungkan repository GitHub Anda
git remote add origin https://github.com/USERNAME/ai-video-studio.git

# Push ke GitHub
git push -u origin main
```

### B. Daily Development Workflow (Update & Push)
```bash
# 1. Cek perubahan file
git status

# 2. Stage file yang diubah
git add .

# 3. Commit dengan pesan standar
git commit -m "feat: enhance prompt styling and optimize Colab GPU pipeline"

# 4. Push ke GitHub
git push origin main
```

---

## 📱 Android APK Compilation Workflow

```bash
# 1. Build aset web React/Vite
npm run build

# 2. Inisialisasi Capacitor Android (jika pertama kali)
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "AI Video Studio" com.aivideo.generator --web-dir dist
npx cap add android

# 3. Sinkronisasikan perubahan terbaru
npx cap sync

# 4. Buka di Android Studio
npx cap open android
```

Di Android Studio:
1. Klik menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
2. File output berada di `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🤖 Wan2.2 Colab Cloud Node Setup

1. Buka [Google Colab](https://colab.research.google.com).
2. Pilih Runtime **T4 GPU** (*Runtime > Change runtime type > T4 GPU*).
3. Jalankan script FastAPI + Ngrok yang disediakan di tombol **Wan2.2 Colab** aplikasi.
4. Salin URL publik Ngrok (contoh: `https://xxxx.ngrok-free.app`) dan tempelkan ke aplikasi.
