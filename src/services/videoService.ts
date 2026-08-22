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
  const res = await fetch("/api/rapidapi/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });
  return await res.json();
}

export async function testColabConnection(colabUrl: string): Promise<{
  online: boolean;
  gpu?: string;
  model?: string;
  vram_gb?: number;
  error?: string;
}> {
  const res = await fetch("/api/colab/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: colabUrl }),
  });
  return await res.json();
}

export async function renderColabVideo(params: {
  colabUrl: string;
  prompt: string;
  aspectRatio: string;
  duration: number;
  guidanceScale?: number;
}): Promise<{ success: boolean; videoBlobUrl?: string; error?: string }> {
  const res = await fetch("/api/colab/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Colab render failed" }));
    return { success: false, error: err.error || "Gagal render video dari Colab" };
  }

  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  return { success: true, videoBlobUrl: blobUrl };
}
