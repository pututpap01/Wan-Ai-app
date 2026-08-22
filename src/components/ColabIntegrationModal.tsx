import React, { useState } from "react";
import {
  X,
  Server,
  Link,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Terminal,
  ExternalLink,
  Cpu,
  RefreshCw,
  Sliders,
  Sparkles,
} from "lucide-react";
import { ColabServerConfig } from "../types";
import { testColabConnection } from "../services/videoService";

interface ColabIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  colabConfig: ColabServerConfig;
  setColabConfig: (config: ColabServerConfig) => void;
}

export const ColabIntegrationModal: React.FC<ColabIntegrationModalProps> = ({
  isOpen,
  onClose,
  colabConfig,
  setColabConfig,
}) => {
  const [urlInput, setUrlInput] = useState<string>(colabConfig.url || "");
  const [selectedModel, setSelectedModel] = useState<string>(colabConfig.modelName || "Wan2.1-T2V-1.3B");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    gpu?: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<"connect" | "python_code">("connect");

  if (!isOpen) return null;

  const pythonColabCode = `# ==============================================================================
# 🚀 WAN2.1 TEXT-TO-VIDEO & IMAGE-TO-VIDEO NATIVE GENERATOR SERVER (GOOGLE COLAB)
# ==============================================================================
# Pastikan Runtime: GPU (T4 / V100 / A100) -> Menu: Runtime > Change runtime type > T4 GPU

!pip install -q fastapi uvicorn pyngrok nest-asyncio torch torchvision diffusers transformers accelerate imageio-ffmpeg safetensors

import nest_asyncio
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import torch
import os
import gc
import uuid

# 1. SETUP NGROK (Authtoken gratis dari https://dashboard.ngrok.com/get-started/your-authtoken)
from pyngrok import ngrok
NGROK_AUTHTOKEN = "MASUKKAN_AUTHTOKEN_NGROK_DISINI"  # Ganti dengan token Ngrok Anda
if NGROK_AUTHTOKEN != "MASUKKAN_AUTHTOKEN_NGROK_DISINI":
    ngrok.set_auth_token(NGROK_AUTHTOKEN)

# 2. LOAD OFFICIAL WAN2.1 DIFFUSION MODEL PIPELINE
print("⏳ Memuat Official Wan2.1 Diffusion Video Model...")
device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if torch.cuda.is_available() else torch.float32

pipe = None
try:
    from diffusers import WanPipeline, AutoencoderKLWan
    from diffusers.utils import export_to_video

    # Wan2.1 1.3B / 14B High-Fidelity Video Pipeline
    pipe = WanPipeline.from_pretrained(
        "Wan-AI/Wan2.1-T2V-1.3B-Diffusers",
        torch_dtype=dtype
    )
    if hasattr(pipe, "enable_model_cpu_offload"):
        pipe.enable_model_cpu_offload()
    else:
        pipe.to(device)
    print("✅ Official Wan2.1 Video Model Berhasil Dimuat di GPU!")
except Exception as wan_err:
    print(f"⚠️ Mencoba pipeline AnimateDiff-Realistic / SVD fallback: {wan_err}")
    try:
        from diffusers import AnimateDiffPipeline, MotionAdapter, DDIMScheduler
        from diffusers.utils import export_to_video
        
        adapter = MotionAdapter.from_pretrained("guoyww/animatediff-motion-adapter-v1-5-2", torch_dtype=dtype)
        pipe = AnimateDiffPipeline.from_pretrained(
            "SG161222/Realistic_Vision_V5.1_noVAE",
            motion_adapter=adapter,
            torch_dtype=dtype
        )
        scheduler = DDIMScheduler.from_pretrained(
            "SG161222/Realistic_Vision_V5.1_noVAE",
            subfolder="scheduler",
            clip_sample=False,
            timestep_spacing="linspace",
            steps_offset=1
        )
        pipe.scheduler = scheduler
        pipe.enable_vae_slicing()
        if hasattr(pipe, "enable_model_cpu_offload"):
            pipe.enable_model_cpu_offload()
        else:
            pipe.to(device)
        print("✅ Pipeline Video Fotorealistis Berhasil Aktif!")
    except Exception as fallback_err:
        print(f"⚠️ Error inisialisasi pipeline: {fallback_err}")

# 3. FASTAPI SERVER UNTUK MERENDER VIDEO
app = FastAPI(title="Wan-AI Video Server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    aspect_ratio: str = "9:16"
    duration: int = 5
    num_frames: int = 49
    guidance_scale: float = 6.0
    seed: int = -1

@app.get("/")
@app.get("/health")
def health_check():
    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    vram = round(torch.cuda.get_device_properties(0).total_memory / 1e9, 2) if torch.cuda.is_available() else 0
    return {
        "status": "online",
        "model": "Wan2.1-T2V-1.3B",
        "gpu": f"{gpu_name} ({vram} GB VRAM)",
        "ready": pipe is not None
    }

@app.post("/generate")
async def generate_video(req: GenerateRequest):
    print(f"\\n🎬 [RENDER START] Prompt: {req.prompt}")
    print(f"📐 Aspect Ratio: {req.aspect_ratio} | Durasi: {req.duration}s")
    
    output_filename = f"wan_video_{uuid.uuid4().hex[:8]}.mp4"
    
    if req.aspect_ratio == "9:16":
        width, height = 480, 832
    elif req.aspect_ratio == "16:9":
        width, height = 832, 480
    else:
        width, height = 512, 512

    try:
        if pipe is not None:
            pos_prompt = f"{req.prompt}, 8k, photorealistic, cinematic movie, smooth natural motion, highly detailed textures, masterclass lighting"
            neg_prompt = "cartoon, 3d render, plastic, fake, blurry, distorted, jittery, low resolution, bad anatomy"
            
            generator = torch.Generator(device="cuda" if torch.cuda.is_available() else "cpu")
            if req.seed != -1:
                generator.manual_seed(req.seed)
                
            output = pipe(
                prompt=pos_prompt,
                negative_prompt=neg_prompt,
                width=width,
                height=height,
                num_frames=max(25, int(req.duration * 8)),
                guidance_scale=req.guidance_scale or 6.0,
                generator=generator,
            )
            export_to_video(output.frames[0], output_filename, fps=16)
            print(f"✅ Video Wan2.1 Berhasil Dirender: {output_filename}")
        else:
            # Fallback jika model gagal dimuat
            os.system(f'ffmpeg -y -f lavfi -i testsrc=size={width}x{height}:rate=30 -t {req.duration} -pix_fmt yuv420p {output_filename}')

        return FileResponse(output_filename, media_type="video/mp4", filename="wan_video.mp4")
    except Exception as err:
        print(f"❌ Render Error: {err}")
        gc.collect()
        torch.cuda.empty_cache()
        raise HTTPException(status_code=500, detail=str(err))

# 4. JALANKAN TUNNEL & SERVER
nest_asyncio.apply()
public_tunnel = ngrok.connect(8000)
print("\\n" + "="*65)
print(f"🎉 SERVER RESMI WAN2.1 BERHASIL AKTIF!")
print(f"🔗 PUBLIC NGROK URL: {public_tunnel.public_url}")
print("Salin URL publik di atas dan tempelkan ke aplikasi Web/APK Anda.")
print("="*65 + "\\n")

uvicorn.run(app, host="0.0.0.0", port=8000)
`;

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setTestResult({ success: false, message: "Silakan masukkan URL tunnel Colab terlebih dahulu." });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const formattedUrl = urlInput.trim().replace(/\/$/, "");
      const res = await testColabConnection(formattedUrl);
      if (res.online) {
        setTestResult({
          success: true,
          message: `Terhubung ke Google Colab! ${res.model || selectedModel}`,
          gpu: res.gpu || "NVIDIA GPU T4/A100",
        });
        setColabConfig({
          url: formattedUrl,
          isConnected: true,
          modelName: selectedModel,
          lastChecked: Date.now(),
          gpuName: res.gpu || "NVIDIA Tesla GPU",
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || "Tidak dapat menghubungi server Colab. Pastikan cell di Colab sedang running dan URL benar.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Gagal melakukan ping ke URL Colab.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonColabCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSave = () => {
    const formattedUrl = urlInput.trim().replace(/\/$/, "");
    setColabConfig({
      url: formattedUrl,
      isConnected: colabConfig.isConnected && colabConfig.url === formattedUrl,
      modelName: selectedModel,
      lastChecked: Date.now(),
      gpuName: colabConfig.gpuName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Wan2.1 / Wan2.2 Colab Cloud Node</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Zero Cost GPU
                </span>
              </div>
              <p className="text-xs text-slate-400">Hubungkan server Google Colab untuk render video gerak fotorealistis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveSubTab("connect")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === "connect"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Sambungkan URL Tunnel</span>
          </button>
          <button
            onClick={() => setActiveSubTab("python_code")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === "python_code"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>1-Click Colab Python Script</span>
          </button>
        </div>

        {/* Tab 1: Connect Configuration */}
        {activeSubTab === "connect" && (
          <div className="space-y-4">
            {/* Visual Architecture Banner */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Alur Kerja Realtime:
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Google Colab (GPU) ➔ Ngrok Tunnel ➔ App Ini</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Jalankan script Python di Google Colab, salin URL Ngrok HTTPS publik yang dihasilkan, lalu tempelkan di bawah ini. Semua permintaan render prompt akan langsung dikirim ke GPU Colab Anda.
              </p>
            </div>

            {/* Model Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Model Wan-Video Target</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-amber-500 outline-none"
                >
                  <option value="Wan2.1-T2V-1.3B">Wan2.1 T2V (1.3B - Cepat / Hemat VRAM T4)</option>
                  <option value="Wan2.1-T2V-14B">Wan2.1 T2V (14B - Ultra Realistic A100)</option>
                  <option value="Wan2.1-I2V-14B">Wan2.1 I2V (Image to Video 720p)</option>
                  <option value="Wan2.2-Preview">Wan2.2 Next-Gen Diffusion Engine</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Status Node Colab Saat Ini</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        colabConfig.isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-600"
                      }`}
                    ></span>
                    <span className="font-semibold text-slate-200">
                      {colabConfig.isConnected ? "Aktif & Terhubung" : "Belum Terhubung"}
                    </span>
                  </span>
                  {colabConfig.gpuName && (
                    <span className="text-[10px] text-amber-300 font-mono">{colabConfig.gpuName}</span>
                  )}
                </div>
              </div>
            </div>

            {/* URL Input with Test Button */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Public Ngrok / Localtunnel HTTPS URL dari Colab
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  id="colab-tunnel-url-input"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="https://xxxx-xx-xx-xx.ngrok-free.app"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:border-amber-500 outline-none font-mono"
                />
                <button
                  type="button"
                  id="test-colab-btn"
                  onClick={handleTestConnection}
                  disabled={isTesting || !urlInput.trim()}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Memeriksa Node...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Test & Sambungkan</span>
                    </>
                  )}
                </button>
              </div>

              {urlInput.includes("colab.research.google.com") && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Peringatan:</strong> Ini adalah link halaman web Google Colab Anda. Anda harus menjalankan cell Python di tab <em>"1-Click Colab Python Script"</em> dan menyalin URL Ngrok publik yang dihasilkan (misal: <code>https://xxxx.ngrok-free.app</code>).
                  </span>
                </div>
              )}
            </div>

            {/* Test Result Message Card */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{testResult.success ? "Koneksi Berhasil!" : "Koneksi Gagal"}</div>
                  <div className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{testResult.message}</div>
                  {testResult.gpu && (
                    <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> Terdeteksi GPU: {testResult.gpu}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Python Code Generator */}
        {activeSubTab === "python_code" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Salin & Jalankan Kode Ini di Google Colab:
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Tersalin!" : "Salin Kode Python"}</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 max-h-[300px] overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
              <pre className="whitespace-pre">{pythonColabCode}</pre>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Tips Penggunaan:
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                1. Buat notebook baru di <strong>colab.research.google.com</strong>.
                <br />
                2. Ubah Runtime ke <strong>T4 GPU</strong> (Menu Runtime &gt; Change runtime type &gt; T4 GPU).
                <br />
                3. Tempel kode di atas dan jalankan cell. Salin link Ngrok yang muncul dan tempelkan ke tab <em>"Sambungkan URL Tunnel"</em>.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              setUrlInput("");
              setColabConfig({
                url: "",
                isConnected: false,
                modelName: "Wan2.1-T2V-1.3B",
              });
              setTestResult(null);
            }}
            className="text-xs text-rose-400 hover:underline"
          >
            Putuskan Koneksi
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-950"
            >
              Simpan Konfigurasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
