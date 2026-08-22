import React, { useState } from "react";
import { X, Key, CheckCircle, AlertCircle, RefreshCw, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import { testRapidApiConnection } from "../services/videoService";

interface RapidApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  rapidApiKey: string;
  setRapidApiKey: (key: string) => void;
}

export const RapidApiModal: React.FC<RapidApiModalProps> = ({
  isOpen,
  onClose,
  rapidApiKey,
  setRapidApiKey,
}) => {
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const res = await testRapidApiConnection(rapidApiKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ valid: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">RapidAPI & RunwayML Settings</h2>
              <p className="text-xs text-slate-400">Hubungkan RapidAPI Key untuk integrasi Runway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Zap className="w-4 h-4" />
            <span>Tentang Integrasi Runway di RapidAPI</span>
          </div>
          <p className="leading-relaxed">
            Repositori GitHub tersebut menggunakan Runway Gen-2/Gen-3 API yang di-host di marketplace RapidAPI.
            Jika Anda memiliki RapidAPI Key berbayar, Anda dapat memasukkannya di sini. Jika dikosongkan, aplikasi akan
            menggunakan <strong>High-Performance AI Render Engine</strong> bawaan.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">RapidAPI Key (Opsional)</label>
          <div className="flex gap-2">
            <input
              type="password"
              value={rapidApiKey}
              onChange={(e) => {
                setRapidApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="Masukkan RapidAPI Key (contoh: 8e5f...)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 outline-none font-mono"
            />
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Test Key"}
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.valid
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-amber-950/40 border-amber-500/40 text-amber-300"
            }`}
          >
            {testResult.valid ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Simpan & Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
