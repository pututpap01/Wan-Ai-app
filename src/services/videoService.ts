import { AspectRatio, CameraMotion, StoryboardProject, VideoStyle } from "../types";

export interface EnhancePromptResponse {
  enhancedPrompt: string;
  visualStyle?: string;
  cameraNotes?: string;
  lightingNotes?: string;
  keywords?: string[];
}

export async function enhancePromptWithAI(params: {
  prompt: string;
  style?: VideoStyle;
  cameraMotion?: CameraMotion;
  aspectRatio: AspectRatio;
}): Promise<EnhancePromptResponse> {
  try {
    const res = await fetch("/api/prompt/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn("Falling back to client prompt enhancer:", err);
    return {
      enhancedPrompt: `${params.prompt}, highly detailed scene, authentic lighting, fine textures, fluid physical motion`,
      visualStyle: "Model Native",
      cameraNotes: "Natural composition focusing directly on subject action",
      lightingNotes: "Volumetric atmospheric lighting and soft realistic highlights",
      keywords: ["photorealistic", "8k", "high-definition", "masterpiece"],
    };
  }
}

export async function generateStoryboardScript(params: {
  topic: string;
  targetDuration?: number;
  targetPlatform?: string;
  tone?: string;
}): Promise<StoryboardProject> {
  const res = await fetch("/api/script/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return await res.json();
}

export async function testRapidApiConnection(apiKey: string): Promise<{ valid: boolean; message: string }> {
  try {
    const res = await fetch("/api/rapidapi/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { valid: false, message: `Respon server tidak valid (${res.status})` };
    }
  } catch (err: any) {
    return { valid: false, message: err.message || "Gagal menghubungkan ke RapidAPI proxy" };
  }
}

export async function testColabConnection(colabUrl: string): Promise<{
  online: boolean;
  gpu?: string;
  model?: string;
  vram_gb?: number;
  error?: string;
}> {
  try {
    const res = await fetch("/api/colab/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: colabUrl }),
    });

    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      // If server returned non-JSON, attempt direct fetch if on client
      try {
        let cleanUrl = colabUrl.trim().replace(/\/$/, "");
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
          cleanUrl = `https://${cleanUrl}`;
        }
        const directRes = await fetch(`${cleanUrl}/health`, {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420",
            "Bypass-Tunnel-Reminder": "true",
          },
        });
        if (directRes.ok) {
          const directData = await directRes.json();
          return {
            online: true,
            gpu: directData.gpu || "GPU Detected",
            model: directData.model || "Wan2.1 / Realistic Diffusion",
            vram_gb: directData.vram_gb || 15.0,
          };
        }
      } catch {
        // ignore fallback error
      }

      if (text.includes("<!DOCTYPE") || text.includes("<html") || text.includes("<!doctype")) {
        return {
          online: false,
          error: "URL mengembalikan halaman HTML. Pastikan cell script Python di Google Colab sedang 'Running' (aktif).",
        };
      }
      return {
        online: false,
        error: `Respon tidak valid dari server: ${text.slice(0, 100)}`,
      };
    }
  } catch (err: any) {
    return {
      online: false,
      error: `Gagal menghubungi server backend: ${err.message}`,
    };
  }
}

export async function renderColabVideo(params: {
  colabUrl: string;
  prompt: string;
  aspectRatio: string;
  duration: number;
  guidanceScale?: number;
  imageUrl?: string;
}): Promise<{ success: boolean; videoBlobUrl?: string; error?: string }> {
  try {
    const res = await fetch("/api/colab/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errText = await res.text();
      let msg = "Colab render failed";
      try {
        const json = JSON.parse(errText);
        msg = json.error || msg;
      } catch {
        msg = errText.slice(0, 150) || `HTTP error ${res.status}`;
      }
      return { success: false, error: msg };
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    return { success: true, videoBlobUrl: blobUrl };
  } catch (err: any) {
    return { success: false, error: `Gagal request render: ${err.message}` };
  }
}
