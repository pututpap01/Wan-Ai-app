import React from "react";
import { X, Smartphone, Server, CheckCircle2, ShieldCheck, Terminal, Download, Cpu } from "lucide-react";

interface AndroidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Panduan Konversi ke Aplikasi Android (APK)</h2>
              <p className="text-xs text-slate-400">Cara mengubah aplikasi AI Video Generator ini menjadi APK Android</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Arsitektur Penjelasan */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Server className="w-4 h-4" />
            <span>1. Arsitektur Client-Server (Wajib untuk AI Video)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Karena rendering AI Video (Runway / Veo / FFmpeg) sangat berat dan membutuhkan API Key rahasia, arsitektur terbaik adalah:
          </p>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
            <div className="text-sky-400">[ Aplikasi Android (.APK di HP Pengguna) ]</div>
            <div className="text-slate-500">  │  (Kirim prompt & opsi durasi via REST API)</div>
            <div className="text-indigo-400">[ Server Backend (Cloud Run / Node.js Express) ]</div>
            <div className="text-slate-500">  │  (Panggil Runway API via RapidAPI & Gemini AI)</div>
            <div className="text-emerald-400">[ Video MP4 Jadi ] ──&gt; Dikirim &amp; Disimpan di Galeri HP</div>
          </div>
        </div>

        {/* 2. Langkah Cepat menggunakan Capacitor */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
            <Terminal className="w-4 h-4" />
            <span>2. Langkah Praktis Membuat APK dengan Capacitor</span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 block font-sans">Langkah A: Install Capacitor CLI di proyek ini</span>
              <code className="text-amber-300 font-mono text-xs block select-all">
                npm install @capacitor/core @capacitor/cli @capacitor/android
              </code>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 block font-sans">Langkah B: Inisialisasi Android Package</span>
              <code className="text-amber-300 font-mono text-xs block select-all">
                npx cap init "AI Video Studio" com.aivideo.generator
              </code>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 block font-sans">Langkah C: Build dan Tambahkan Platform Android</span>
              <code className="text-amber-300 font-mono text-xs block select-all">
                npm run build && npx cap add android
              </code>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 block font-sans">Langkah D: Buka di Android Studio & Generate APK</span>
              <code className="text-amber-300 font-mono text-xs block select-all">
                npx cap open android
              </code>
              <p className="text-[11px] text-slate-400 pt-1">
                Di Android Studio: Pilih menu <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Keamanan & Tips */}
        <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl space-y-1.5 text-xs text-amber-200">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Penting untuk Keamanan API Key</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Jangan menaruh RapidAPI Key atau Gemini API Key langsung di dalam file kode APK Android. Gunakan backend Express ini sebagai proxy agar key Anda tidak bisa diekstrak oleh orang lain.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
