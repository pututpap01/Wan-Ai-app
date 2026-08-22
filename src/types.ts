export type AspectRatio = "9:16" | "16:9" | "1:1";

export type VideoStyle =
  | "Cinematic"
  | "Photorealistic"
  | "Anime & Manga"
  | "Cyberpunk Neon"
  | "3D Pixar Animation"
  | "Vintage 35mm Film"
  | "FPV Drone Aerial"
  | "Hyperlapse Night"
  | "Surreal Dreamscape";

export type CameraMotion =
  | "Static Shot"
  | "Slow Push-In (Zoom In)"
  | "Dolly Pull-Out (Zoom Out)"
  | "Pan Left to Right"
  | "Pan Right to Left"
  | "Tilt Up to Sky"
  | "360 Orbital Rotation"
  | "FPV Drone Flight"
  | "Handheld Shake";

export interface SceneScript {
  sceneNumber: number;
  title: string;
  duration: number;
  description: string;
  camera: string;
  visualCue: string;
  voiceover?: string;
}

export interface StoryboardProject {
  title: string;
  summary: string;
  scenes: SceneScript[];
}

export interface VideoProject {
  id: string;
  title: string;
  prompt: string;
  enhancedPrompt?: string;
  style: VideoStyle;
  cameraMotion: CameraMotion;
  aspectRatio: AspectRatio;
  duration: number; // in seconds (e.g. 4, 6, 8, 12, 16)
  fps: number;
  motionIntensity: number; // 1 to 10
  imageUrl?: string;
  videoBlobUrl?: string;
  source?: "colab_wan" | "rapidapi_runway" | "local_engine";
  remoteVideoUrl?: string;
  createdAt: number;
  status: "idle" | "enhancing" | "rendering" | "completed" | "failed";
  progress: number;
  scenes?: SceneScript[];
  cameraNotes?: string;
  lightingNotes?: string;
  keywords?: string[];
}

export interface ColabServerConfig {
  url: string;
  isConnected: boolean;
  modelName: string;
  lastChecked?: number;
  gpuName?: string;
}

export interface PresetIdea {
  id: string;
  title: string;
  category: "Nature" | "Cyberpunk" | "Anime" | "Cinematic" | "Abstract" | "Drone";
  prompt: string;
  style: VideoStyle;
  cameraMotion: CameraMotion;
  aspectRatio: AspectRatio;
  duration: number;
  motionIntensity: number;
  thumbnailColor: string;
  accentGradient: string;
}
