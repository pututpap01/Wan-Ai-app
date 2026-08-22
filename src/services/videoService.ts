import { AspectRatio, CameraMotion, StoryboardProject, VideoStyle } from "../types";

export interface EnhancePromptResponse {
  enhancedPrompt: string;
  visualStyle: string;
  cameraNotes: string;
  lightingNotes: string;
  keywords: string[];
}

export async function enhancePromptWithAI(params: {
  prompt: string;
  style: VideoStyle;
  cameraMotion: CameraMotion;
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
      enhancedPrompt: `${params.prompt}, ultra-cinematic 8k octane render, ${params.style} aesthetic, ${params.cameraMotion}, volumetric light rays, fine textures, photorealistic color grading`,
      visualStyle: params.style,
      cameraNotes: `${params.cameraMotion} with 35mm prime lens`,
      lightingNotes: "Volumetric rim lighting and soft atmospheric haze",
      keywords: ["cinematic", "photorealistic", "8k", "masterpiece"],
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
      return JSON.parse(text);
    } catch (parseErr) {
      if (text.includes("<!DOCTYPE") || text.includes("<html") || text.includes("<!doctype")) {
        return {
          online: false,
          error: "URL mengembalikan halaman HTML. Pastikan Anda memasukkan URL Ngrok dari Colab (https://xxxx.ngrok-free.app), bukan link browser Google Colab.",
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
