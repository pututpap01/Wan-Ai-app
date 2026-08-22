import React, { useRef, useEffect, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Copy,
  Check,
  Maximize2,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  Film,
  Camera,
  Layers,
} from "lucide-react";
import { VideoProject } from "../types";
import { VideoRendererEngine } from "../utils/canvasRenderer";

interface VideoPlayerProps {
  currentProject: VideoProject | null;
  isGenerating: boolean;
  generationProgress: number;
  onReRender?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentProject,
  isGenerating,
  generationProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<VideoRendererEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [resolution, setResolution] = useState<"720p" | "1080p" | "4K">("1080p");
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Initialize Canvas Renderer Engine (Only if not direct video blob)
  useEffect(() => {
    if (!canvasRef.current || !currentProject || currentProject.videoBlobUrl) return;

    const engine = new VideoRendererEngine(canvasRef.current);
    engineRef.current = engine;

    engine.setDimensions(currentProject.aspectRatio, 720);

    if (currentProject.imageUrl) {
      engine.loadImage(currentProject.imageUrl).then(() => {
        if (isPlaying) {
          engine.startPreview({
            prompt: currentProject.prompt,
            style: currentProject.style,
            cameraMotion: currentProject.cameraMotion,
            aspectRatio: currentProject.aspectRatio,
            duration: currentProject.duration,
            motionIntensity: currentProject.motionIntensity,
            imageUrl: currentProject.imageUrl,
            subtitles: currentProject.scenes?.[0]?.title || currentProject.title,
          });
        }
      });
    } else {
      if (isPlaying) {
        engine.startPreview({
          prompt: currentProject.prompt,
          style: currentProject.style,
          cameraMotion: currentProject.cameraMotion,
          aspectRatio: currentProject.aspectRatio,
          duration: currentProject.duration,
          motionIntensity: currentProject.motionIntensity,
          subtitles: currentProject.scenes?.[0]?.title || currentProject.title,
        });
      }
    }

    return () => {
      engine.stopPreview();
    };
  }, [currentProject, currentProject?.id, currentProject?.videoBlobUrl]);

  // Handle Play/Pause Toggle
  const togglePlay = () => {
    if (!engineRef.current || !currentProject) return;
    if (isPlaying) {
      engineRef.current.stopPreview();
      setIsPlaying(false);
    } else {
      engineRef.current.startPreview({
        prompt: currentProject.prompt,
        style: currentProject.style,
        cameraMotion: currentProject.cameraMotion,
        aspectRatio: currentProject.aspectRatio,
        duration: currentProject.duration,
        motionIntensity: currentProject.motionIntensity,
        imageUrl: currentProject.imageUrl,
        subtitles: currentProject.scenes?.[0]?.title || currentProject.title,
      });
      setIsPlaying(true);
    }
  };

  // Replay from start
  const handleReplay = () => {
    if (!engineRef.current || !currentProject) return;
    engineRef.current.stopPreview();
    engineRef.current.startPreview({
      prompt: currentProject.prompt,
      style: currentProject.style,
      cameraMotion: currentProject.cameraMotion,
      aspectRatio: currentProject.aspectRatio,
      duration: currentProject.duration,
      motionIntensity: currentProject.motionIntensity,
      imageUrl: currentProject.imageUrl,
      subtitles: currentProject.scenes?.[0]?.title || currentProject.title,
    });
    setIsPlaying(true);
  };

  // Copy Prompt
  const handleCopyPrompt = () => {
    if (!currentProject) return;
    const textToCopy = currentProject.enhancedPrompt || currentProject.prompt;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Video Render
  const handleDownloadVideo = async () => {
    if (!currentProject || isDownloading) return;
    setIsDownloading(true);
    try {
      if (currentProject.videoBlobUrl) {
        const a = document.createElement("a");
        a.href = currentProject.videoBlobUrl;
        a.download = `wan2-video-${Date.now()}-${currentProject.aspectRatio.replace(":", "x")}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      if (!engineRef.current) return;
      const { blobUrl } = await engineRef.current.renderVideoBlob(
        {
          prompt: currentProject.prompt,
          style: currentProject.style,
          cameraMotion: currentProject.cameraMotion,
          aspectRatio: currentProject.aspectRatio,
          duration: currentProject.duration,
          motionIntensity: currentProject.motionIntensity,
          imageUrl: currentProject.imageUrl,
          subtitles: currentProject.scenes?.[0]?.title || currentProject.title,
        },
        (progress) => {
          // Progress feedback
        }
      );

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `ai-video-${Date.now()}-${currentProject.aspectRatio.replace(":", "x")}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Resume preview playback
      engineRef.current.startPreview({
        prompt: currentProject.prompt,
        style: currentProject.style,
        cameraMotion: currentProject.cameraMotion,
        aspectRatio: currentProject.aspectRatio,
        duration: currentProject.duration,
        motionIntensity: currentProject.motionIntensity,
        imageUrl: currentProject.imageUrl,
        subtitles: currentProject.scenes?.[0]?.title || currentProject.title,
      });
      setIsPlaying(true);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Determine Aspect Ratio Frame styling
  const getAspectRatioClasses = () => {
    const ratio = currentProject?.aspectRatio || "9:16";
    if (ratio === "9:16") return "aspect-[9/16] max-h-[520px] w-auto mx-auto";
    if (ratio === "16:9") return "aspect-[16/9] w-full max-w-[640px] mx-auto";
    return "aspect-square max-h-[460px] w-auto mx-auto";
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-950/40 flex flex-col justify-between">
      {/* Player Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-white tracking-tight">
            {currentProject ? currentProject.title : "Live Video Preview Stage"}
          </h2>
        </div>

        {currentProject && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-sky-950 border border-sky-800/60 text-sky-300 font-semibold px-2 py-0.5 rounded-full">
              {currentProject.aspectRatio}
            </span>
            <span className="text-[11px] bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
              {currentProject.style}
            </span>
          </div>
        )}
      </div>

      {/* Main Canvas Viewport / Screen */}
      <div className="relative flex-1 flex items-center justify-center min-h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 p-2">
        {isGenerating ? (
          /* Generating State */
          <div className="text-center p-6 space-y-4 max-w-sm">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-sky-400 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-sky-400">
                {generationProgress}%
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rendering AI Video</h3>
              <p className="text-xs text-slate-400 mt-1">
                Applying motion dynamics, camera trajectories, and volumetric lighting...
              </p>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
          </div>
        ) : currentProject ? (
          /* Active Project Render Canvas or Real Video Tag */
          <div className={`relative rounded-lg overflow-hidden shadow-2xl ${getAspectRatioClasses()}`}>
            {currentProject.videoBlobUrl ? (
              <video
                src={currentProject.videoBlobUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-contain rounded-lg bg-black"
                controls
              />
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain rounded-lg bg-black cursor-pointer"
                  onClick={togglePlay}
                />

                {/* Play/Pause Overlay indicator on click */}
                {!isPlaying && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-opacity"
                  >
                    <div className="w-14 h-14 rounded-full bg-sky-500/90 text-slate-950 flex items-center justify-center shadow-lg shadow-sky-500/30 hover:scale-105 transition-transform">
                      <Play className="w-6 h-6 fill-slate-950 ml-1" />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Overlay Status Badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-slate-200 border border-slate-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                {currentProject.source === "colab_wan"
                  ? "Wan2.2 Colab MP4"
                  : `${resolution} • ${currentProject.duration}s`}
              </span>
            </div>
          </div>
        ) : (
          /* Empty / Standby State */
          <div className="text-center p-6 text-slate-400 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <Film className="w-7 h-7" />
            </div>
            <p className="text-xs font-medium text-slate-300">No video generated yet</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Describe your scene in the prompt, choose your visual style, and hit "Generate AI Video".
            </p>
          </div>
        )}
      </div>

      {/* Control Bar & Export Actions */}
      {currentProject && (
        <div className="mt-4 space-y-3">
          {/* Timeline & Playback Controls */}
          <div className="flex items-center justify-between gap-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                id="player-toggle-play-btn"
                onClick={togglePlay}
                className="w-8 h-8 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
              </button>

              <button
                id="player-replay-btn"
                onClick={handleReplay}
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors"
                title="Replay from start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="text-[11px] font-mono text-slate-400 pl-1">
                <span>00:{String(currentProject.duration).padStart(2, "0")}</span>
              </div>
            </div>

            {/* Resolution Selector */}
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {(["720p", "1080p", "4K"] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                    resolution === res ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>

            {/* Details Drawer Trigger */}
            <button
              id="player-toggle-details-btn"
              onClick={() => setShowDetails((prev) => !prev)}
              className={`p-2 rounded-lg text-xs flex items-center gap-1 border transition-colors ${
                showDetails
                  ? "bg-indigo-950 border-indigo-700 text-indigo-300"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              title="View Video Metadata"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Specs</span>
            </button>
          </div>

          {/* Action Row: Download MP4/WebM, Copy Prompt, Share */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="download-video-btn"
              onClick={handleDownloadVideo}
              disabled={isDownloading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "Rendering File..." : "Download Video (.WebM / .MP4)"}</span>
            </button>

            <button
              id="copy-prompt-btn"
              onClick={handleCopyPrompt}
              className="py-2.5 px-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Prompt"}</span>
            </button>
          </div>

          {/* Collapsible Cinematography Drawer */}
          {showDetails && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  Video Details & Generation Specs
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ID: {currentProject.id}</span>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 font-semibold mb-0.5">Full Prompt:</p>
                <p className="text-slate-200 bg-slate-900 p-2 rounded-lg border border-slate-800/80 leading-relaxed font-mono text-[11px]">
                  {currentProject.enhancedPrompt || currentProject.prompt}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block font-semibold">Generation Mode:</span>
                  <span className="text-sky-300">
                    {currentProject.imageUrl ? "Image-to-Video (Direct)" : "Text-to-Video"}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block font-semibold">Motion Dynamics:</span>
                  <span className="text-amber-300">{currentProject.motionIntensity} / 10</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
