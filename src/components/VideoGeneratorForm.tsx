import React, { useState, useRef } from "react";
import {
  Sparkles,
  Wand2,
  Video,
  Image as ImageIcon,
  Play,
  Sliders,
  RefreshCw,
  Film,
  Clock,
  Upload,
} from "lucide-react";
import { AspectRatio, CameraMotion, VideoStyle } from "../types";
import { PRESET_TEMPLATES } from "../data/presets";
import { enhancePromptWithAI } from "../services/videoService";

interface VideoGeneratorFormProps {
  onGenerate: (config: {
    prompt: string;
    enhancedPrompt?: string;
    style?: VideoStyle;
    cameraMotion?: CameraMotion;
    aspectRatio: AspectRatio;
    duration: number;
    motionIntensity: number;
    imageUrl?: string;
    cameraNotes?: string;
    lightingNotes?: string;
    keywords?: string[];
  }) => Promise<void>;
  isGenerating: boolean;
  generationProgress: number;
  colabConfig?: {
    isConnected: boolean;
    url: string;
    modelName: string;
    gpuName?: string;
  };
  onOpenColabModal?: () => void;
}

export const VideoGeneratorForm: React.FC<VideoGeneratorFormProps> = ({
  onGenerate,
  isGenerating,
  generationProgress,
  colabConfig,
  onOpenColabModal,
}) => {
  const [mode, setMode] = useState<"text" | "image">("text");
  const [prompt, setPrompt] = useState<string>(
    "A neon-lit cyberpunk alleyway in Tokyo at midnight during rain, reflections on asphalt, flying car passing by"
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [duration, setDuration] = useState<number>(6);
  const [motionIntensity, setMotionIntensity] = useState<number>(7);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFileName, setImageFileName] = useState<string>("");

  // AI Prompt Enhancement States
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhancedData, setEnhancedData] = useState<{
    enhancedPrompt?: string;
    lightingNotes?: string;
    keywords?: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Preset Loader
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_TEMPLATES.find((p) => p.id === presetId);
    if (!preset) return;
    setPrompt(preset.prompt);
    setAspectRatio(preset.aspectRatio);
    setDuration(preset.duration);
    setMotionIntensity(preset.motionIntensity);
    setEnhancedData(null);
  };

  // Enhance Prompt via Gemini API
  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const res = await enhancePromptWithAI({
        prompt,
        aspectRatio,
      });
      setEnhancedData({
        enhancedPrompt: res.enhancedPrompt,
        lightingNotes: res.lightingNotes,
        keywords: res.keywords,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          setMode("image");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Generation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    await onGenerate({
      prompt,
      enhancedPrompt: enhancedData?.enhancedPrompt,
      aspectRatio,
      duration,
      motionIntensity,
      imageUrl: mode === "image" ? imageUrl : undefined,
      lightingNotes: enhancedData?.lightingNotes,
      keywords: enhancedData?.keywords,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-950/40">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between mb-5 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/60">
          <button
            type="button"
            id="mode-text-to-video-btn"
            onClick={() => setMode("text")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === "text"
                ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Text to Video</span>
          </button>

          <button
            type="button"
            id="mode-image-to-video-btn"
            onClick={() => setMode("image")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === "image"
                ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image to Video</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Engine: Wan2.1 & Photorealistic Ready</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Preset Quick Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspiration Presets</span>
            </label>
            <span className="text-[11px] text-slate-500">1-click setup</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
            {PRESET_TEMPLATES.map((p) => (
              <button
                key={p.id}
                type="button"
                id={`preset-btn-${p.id}`}
                onClick={() => handleSelectPreset(p.id)}
                className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400"></span>
                <span>{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* If Image to Video Mode -> Upload Area */}
        {mode === "image" && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Starting Frame Image</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-sky-500/60 bg-slate-950/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imageUrl ? (
                <div className="relative group/img w-full flex items-center gap-4">
                  <img
                    src={imageUrl}
                    alt="Upload preview"
                    className="w-24 h-24 object-cover rounded-lg border border-slate-700 shadow-md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{imageFileName || "Selected Image"}</p>
                    <p className="text-[11px] text-emerald-400 mt-0.5">Image loaded for motion synthesis</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrl("");
                        setImageFileName("");
                      }}
                      className="mt-2 text-[11px] text-rose-400 hover:text-rose-300 underline"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-sky-400 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-200 mt-2">
                    Click to upload starting image or photo
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Supports PNG, JPG, WebP up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prompt Input Box & AI Enhancer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="video-prompt-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-sky-400" />
              <span>{mode === "text" ? "Video Prompt & Scene Idea" : "Subject Motion & Scene Action"}</span>
            </label>

            {/* AI Magic Enhance Button */}
            <button
              type="button"
              id="gemini-enhance-prompt-btn"
              onClick={handleEnhancePrompt}
              disabled={isEnhancing || !prompt.trim()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-medium transition-all disabled:opacity-50"
            >
              <Wand2 className={`w-3 h-3 ${isEnhancing ? "animate-spin" : ""}`} />
              <span>{isEnhancing ? "Enhancing Prompt..." : "AI Magic Enhance"}</span>
            </button>
          </div>

          <textarea
            id="video-prompt-input"
            rows={mode === "text" ? 3 : 2}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setEnhancedData(null);
            }}
            placeholder={
              mode === "text"
                ? "Describe your scene in detail (e.g., An astronaut walking on a crystalline alien planet with purple aurora borealis in the sky...)"
                : "Describe subject motion and physics (e.g., Natural facial smile, flowing hair in gentle breeze, warm cinematic light...)"
            }
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none resize-none transition-colors"
          />

          {/* Enhanced Prompt Preview Card if available */}
          {enhancedData?.enhancedPrompt && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center justify-between text-amber-300 font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Enhanced Video Prompt
                </span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">Gemini 3.7</span>
              </div>
              <p className="text-slate-200 leading-relaxed italic">"{enhancedData.enhancedPrompt}"</p>
              {enhancedData.lightingNotes && (
                <p className="text-[11px] text-amber-200/80">
                  <strong>Atmosphere & Lighting:</strong> {enhancedData.lightingNotes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Aspect Ratio & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                id="aspect-ratio-9-16-btn"
                onClick={() => setAspectRatio("9:16")}
                className={`py-1.5 text-center text-xs font-medium rounded-lg transition-colors ${
                  aspectRatio === "9:16" ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                9:16 (Shorts)
              </button>
              <button
                type="button"
                id="aspect-ratio-16-9-btn"
                onClick={() => setAspectRatio("16:9")}
                className={`py-1.5 text-center text-xs font-medium rounded-lg transition-colors ${
                  aspectRatio === "16:9" ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                16:9 (Landscape)
              </button>
              <button
                type="button"
                id="aspect-ratio-1-1-btn"
                onClick={() => setAspectRatio("1:1")}
                className={`py-1.5 text-center text-xs font-medium rounded-lg transition-colors ${
                  aspectRatio === "1:1" ? "bg-sky-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                1:1 (Square)
              </button>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Duration
              </span>
              <span className="text-xs font-bold text-sky-400">{duration}s</span>
            </label>
            <div className="flex gap-1.5">
              {[4, 6, 8, 12, 16].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  id={`duration-${sec}s-btn`}
                  onClick={() => setDuration(sec)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    duration === sec
                      ? "bg-slate-800 border-sky-500 text-sky-300 font-bold"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Motion Intensity Slider */}
        <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Prompt Motion Dynamics</span>
            <span className="text-sky-400 font-bold">Level {motionIntensity} / 10</span>
          </div>
          <input
            id="motion-intensity-slider"
            type="range"
            min="1"
            max="10"
            value={motionIntensity}
            onChange={(e) => setMotionIntensity(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Subtle Fluidity</span>
            <span>Natural Physical Motion</span>
            <span>Dynamic High Action</span>
          </div>
        </div>

        {/* Engine Source Badge */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                colabConfig?.isConnected ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}
            ></span>
            <span className="text-[11px] text-slate-300">
              Active Engine:{" "}
              <strong className={colabConfig?.isConnected ? "text-amber-300" : "text-sky-300"}>
                {colabConfig?.isConnected
                  ? `Google Colab GPU (${colabConfig.modelName})`
                  : "Local AI Motion Canvas Engine"}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenColabModal}
            className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
          >
            {colabConfig?.isConnected ? "Ubah Node" : "Pakai Colab GPU"}
          </button>
        </div>

        {/* Generate Action Button */}
        <button
          type="submit"
          id="generate-video-action-btn"
          disabled={isGenerating || !prompt.trim()}
          className={`w-full relative overflow-hidden py-3.5 px-6 rounded-xl font-bold text-sm shadow-xl hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            colabConfig?.isConnected
              ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-amber-950"
              : "bg-gradient-to-r from-sky-500 via-indigo-600 to-cyan-500 text-white shadow-sky-600/20"
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>
                {colabConfig?.isConnected
                  ? `GPU Colab Rendering Video (${generationProgress}%)...`
                  : `Generating AI Video (${generationProgress}%)...`}
              </span>
            </>
          ) : (
            <>
              <Play className={`w-4 h-4 ${colabConfig?.isConnected ? "fill-slate-950" : "fill-white"}`} />
              <span>
                {colabConfig?.isConnected
                  ? `Render dengan GPU Colab (${duration}s • ${aspectRatio})`
                  : `Generate AI Video (${duration}s • ${aspectRatio})`}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
