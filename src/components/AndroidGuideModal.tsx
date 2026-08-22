import React, { useState } from "react";
import {
  X,
  Smartphone,
  Server,
  GitBranch,
  Terminal,
  Download,
  Copy,
  Check,
  Zap,
  Code2,
  Workflow,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight,
  GitCommit,
  GitPullRequest,
  RefreshCw,
} from "lucide-react";

interface AndroidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"git_commands" | "workflow_pipeline" | "build_apk" | "github_actions">("git_commands");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Dynamic commit message builder
  const [commitType, setCommitType] = useState<string>("feat");
  const [commitScope, setCommitScope] = useState<string>("video-engine");
  const [commitDesc, setCommitDesc] = useState<string>("implement Wan2.2 Colab GPU integration and APK pipeline");

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const generatedCommitCmd = `git add .
git commit -m "${commitType}${commitScope ? `(${commitScope})` : ""}: ${commitDesc}"
git push origin main`;

  const firstTimePushScript = `# 1. Masuk ke folder proyek lokal Anda
cd ai-video-generator

# 2. Inisialisasi Git repository
git init

# 3. Masukkan semua file ke staging
git add .

# 4. Buat initial commit
git commit -m "feat: initial commit AI Video Studio with Wan2.2 Colab integration"

# 5. Atur default branch menjadi main
git branch -M main

# 6. Hubungkan ke repository GitHub Anda (ganti USERNAME dan REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# 7. Push ke GitHub
git push -u origin main`;

  const dailyUpdateScript = `# 1. Cek status perubahan file
git status

# 2. Tambahkan semua perubahan
git add .

# 3. Commit dengan pesan deskriptif
git commit -m "update: improve video generation parameters and UI"

# 4. Push langsung ke GitHub
git push origin main`;

  const branchWorkflowScript = `# 1. Buat branch baru untuk fitur baru
git checkout -b feature/wan2-enhancement

# 2. Lakukan perubahan kode, lalu commit
git add .
git commit -m "feat: enhance Wan2.2 prompt parsing"

# 3. Push branch ke GitHub
git push -u origin feature/wan2-enhancement

# 4. Gabungkan kembali ke main setelah selesai
git checkout main
git merge feature/wan2-enhancement
git push origin main`;

  const apkBuildScript = `# 1. Compile bundle web React & Vite
npm run build

# 2. Tambahkan & sinkronisasikan Capacitor Android
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "AI Video Studio" com.aivideo.generator --web-dir dist
npx cap add android
npx cap sync

# 3. Buka Android Studio untuk build APK
npx cap open android`;

  const githubActionsYaml = `name: Auto Build Android APK

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-android-apk:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install Dependencies
        run: |
          npm install --legacy-peer-deps
          npm install -D @capacitor/cli @capacitor/core @capacitor/android

      - name: Build Web Application
        run: npm run build

      - name: Setup Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Setup Android SDK Environment
        uses: android-actions/setup-android@v3

      - name: Sync Capacitor Android Platform
        run: |
          npx cap add android || true
          npx cap sync android

      - name: Build APK with Gradle
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug --no-daemon --stacktrace

      - name: Upload APK as Release Artifact
        uses: actions/upload-artifact@v4
        with:
          name: AI-Video-Studio-Android-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Git & Android APK Workflow Center</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-xs text-slate-400">Panduan perintah Git commit, push, serta workflow pembuatan APK Android</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2.5">
          <button
            onClick={() => setActiveTab("git_commands")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "git_commands"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Perintah Git (Push & Commit)</span>
          </button>

          <button
            onClick={() => setActiveTab("workflow_pipeline")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "workflow_pipeline"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Alur Sistem (Workflow)</span>
          </button>

          <button
            onClick={() => setActiveTab("build_apk")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "build_apk"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Build APK Android</span>
          </button>

          <button
            onClick={() => setActiveTab("github_actions")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "github_actions"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>CI/CD Auto-Build (GitHub Actions)</span>
          </button>
        </div>

        {/* TAB 1: PERINTAH GIT (PUSH & COMMIT) */}
        {activeTab === "git_commands" && (
          <div className="space-y-4">
            {/* Interactive 1-Click Commit Generator */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <GitCommit className="w-4 h-4" />
                  Generator Perintah Commit Otomatis:
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Conventional Commits Format</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tipe Commit</label>
                  <select
                    value={commitType}
                    onChange={(e) => setCommitType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:border-sky-500 outline-none"
                  >
                    <option value="feat">feat (Fitur baru)</option>
                    <option value="fix">fix (Perbaikan bug)</option>
                    <option value="update">update (Pembaruan UI/logic)</option>
                    <option value="refactor">refactor (Optimasi kode)</option>
                    <option value="build">build (Capacitor/APK build)</option>
                    <option value="docs">docs (Dokumentasi/README)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Scope / Modul</label>
                  <input
                    type="text"
                    value={commitScope}
                    onChange={(e) => setCommitScope(e.target.value)}
                    placeholder="misal: colab, player, apk"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Deskripsi Singkat</label>
                  <input
                    type="text"
                    value={commitDesc}
                    onChange={(e) => setCommitDesc(e.target.value)}
                    placeholder="misal: add Wan2.2 Colab endpoint"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              {/* Output Command with Copy */}
              <div className="relative bg-slate-900 rounded-lg p-3 border border-slate-800 font-mono text-[11px] text-emerald-400">
                <button
                  onClick={() => handleCopy(generatedCommitCmd, "custom_commit")}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-sans font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedKey === "custom_commit" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "custom_commit" ? "Tersalin!" : "Salin Perintah"}</span>
                </button>
                <pre className="whitespace-pre overflow-x-auto pr-24">{generatedCommitCmd}</pre>
              </div>
            </div>

            {/* Standard Scenarios */}
            <div className="space-y-3">
              {/* Scenario 1: First Time Push */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold">1</span>
                    Push Pertama Kali (Repository Baru di GitHub)
                  </span>
                  <button
                    onClick={() => handleCopy(firstTimePushScript, "first_push")}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === "first_push" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "first_push" ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 max-h-32 overflow-y-auto">
                  <pre className="whitespace-pre">{firstTimePushScript}</pre>
                </div>
              </div>

              {/* Scenario 2: Daily Update Push */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">2</span>
                    Push Harian (Setelah Mengubah Kode)
                  </span>
                  <button
                    onClick={() => handleCopy(dailyUpdateScript, "daily_push")}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === "daily_push" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "daily_push" ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                  <pre className="whitespace-pre">{dailyUpdateScript}</pre>
                </div>
              </div>

              {/* Scenario 3: Feature Branch */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">3</span>
                    Workflow Branch Fitur (Aman & Terisolasi)
                  </span>
                  <button
                    onClick={() => handleCopy(branchWorkflowScript, "branch_push")}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === "branch_push" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "branch_push" ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                  <pre className="whitespace-pre">{branchWorkflowScript}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALUR SISTEM (WORKFLOW PIPELINE) */}
        {activeTab === "workflow_pipeline" && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Workflow className="w-4 h-4" />
                <span>Arsitektur End-to-End (Dari Kode Hingga Jalan di HP):</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Step 1 */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div>
                    <div className="text-slate-200 font-bold font-sans">Coding & Git Versioning</div>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Pengembangan fitur studio AI Video di Google AI Studio atau VS Code lokal ➔ simpan versi ke repository GitHub via <code>git push</code>.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div>
                    <div className="text-slate-200 font-bold font-sans">Google Colab Wan2.2 Node (Zero-Cost GPU)</div>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Jalankan notebook Colab dengan GPU T4/A100 ➔ FastAPI menerima prompt ➔ merender video MP4 realistis ➔ membuka jembatan Ngrok HTTPS publik.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div>
                    <div className="text-slate-200 font-bold font-sans">Capacitor Android Packaging</div>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Vite mengompilasi aset web ke folder <code>dist/</code> ➔ Capacitor membungkus web app ke dalam project Android Native ➔ di-compile menjadi <code>app-debug.apk</code>.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">4</div>
                  <div>
                    <div className="text-slate-200 font-bold font-sans">Eksekusi di HP Android Pengguna</div>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Aplikasi ter-install di smartphone ➔ pengguna tinggal mengetik prompt ➔ video selesai dirender &amp; otomatis tersimpan ke Galeri HP.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BUILD APK ANDROID */}
        {activeTab === "build_apk" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                Langkah Cepat Compile APK dengan Capacitor:
              </span>
              <button
                onClick={() => handleCopy(apkBuildScript, "apk_script")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === "apk_script" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "apk_script" ? "Tersalin!" : "Salin Semua Perintah"}</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block font-semibold">Langkah 1: Compile Web Bundle</span>
                <code className="text-amber-300 font-mono text-xs block select-all">npm run build</code>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block font-semibold">Langkah 2: Pasang & Inisialisasi Capacitor</span>
                <code className="text-amber-300 font-mono text-xs block select-all">
                  npm install @capacitor/core @capacitor/cli @capacitor/android && npx cap init "AI Video Studio" com.aivideo.generator --web-dir dist && npx cap add android
                </code>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block font-semibold">Langkah 3: Sinkronkan Perubahan Terbaru</span>
                <code className="text-amber-300 font-mono text-xs block select-all">npx cap sync</code>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block font-semibold">Langkah 4: Buka di Android Studio & Generate APK</span>
                <code className="text-amber-300 font-mono text-xs block select-all">npx cap open android</code>
                <p className="text-[11px] text-slate-400 pt-1">
                  Di Android Studio: Pilih menu <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GITHUB ACTIONS CI/CD */}
        {activeTab === "github_actions" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Otomatisasi Build APK di Cloud (Setiap git push):
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  File ini sudah disimpan di <code>.github/workflows/build-apk.yml</code>
                </p>
              </div>

              <button
                onClick={() => handleCopy(githubActionsYaml, "gh_actions")}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === "gh_actions" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "gh_actions" ? "Tersalin!" : "Salin YAML"}</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 max-h-[280px] overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed">
              <pre className="whitespace-pre">{githubActionsYaml}</pre>
            </div>

            <div className="p-3 bg-sky-950/20 border border-sky-500/30 rounded-xl text-xs text-sky-300 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cara Menggunakannya:
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Setiap kali Anda menjalankan <code>git push origin main</code> ke repository GitHub, GitHub Actions di tab <strong>Actions</strong> repository Anda akan secara otomatis mengompilasi APK dan menyediakan link unduhan file <code>app-debug.apk</code> tanpa perlu membuka Android Studio di laptop!
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            AI Video Studio • Push, Commit &amp; APK Deployment Hub
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-sky-950"
          >
            Selesai &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
