import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  Play,
  Film,
  Plus,
  Trash2,
  Clock,
  Video,
  ArrowRight,
  RefreshCw,
  Wand2,
} from "lucide-react";
import { SceneScript, StoryboardProject, VideoStyle } from "../types";
import { generateStoryboardScript } from "../services/videoService";

interface StoryboardCreatorProps {
  onBatchGenerate: (scenes: SceneScript[], style: VideoStyle, topic: string) => Promise<void>;
  isGenerating: boolean;
}

export const StoryboardCreator: React.FC<StoryboardCreatorProps> = ({
  onBatchGenerate,
  isGenerating,
}) => {
  const [topic, setTopic] = useState<string>("5 Mind-Blowing Facts About Deep Ocean Creatures");
  const [targetDuration, setTargetDuration] = useState<number>(15);
  const [platform, setPlatform] = useState<string>("tiktok/shorts");
  const [style, setStyle] = useState<VideoStyle>("Cinematic");
  const [isScriptLoading, setIsScriptLoading] = useState<boolean>(false);
  const [storyboard, setStoryboard] = useState<StoryboardProject | null>({
    title: "Deep Ocean Secrets",
    summary: "A thrilling 15-second TikTok journey into the Mariana Trench.",
    scenes: [
      {
        sceneNumber: 1,
        title: "The Abyss Hook",
        duration: 4,
        description: "Dark ocean abyss illuminated by a sudden bioluminescent anglerfish glowing in high contrast.",
        camera: "Fast zoom-in with macro lens focus",
        visualCue: "Deep blue and neon green glowing particles in dark waters",
        voiceover: "Down in the Mariana trench, creatures create their own light...",
      },
      {
        sceneNumber: 2,
        title: "Giant Squid Reveal",
        duration: 6,
        description: "Colossal squid glides past underwater submarine camera with glowing eyes.",
        camera: "360 orbital camera rotation",
        visualCue: "Volumetric light beams from submarine headlamps",
        voiceover: "Some have eyes the size of basketballs to spot predators in total darkness.",
      },
      {
        sceneNumber: 3,
        title: "Mystery Climax",
        duration: 5,
        description: "Camera rises rapidly towards ocean surface as golden sun rays break through the water.",
        camera: "Tilt up and dynamic high-speed ascending drone shot",
        visualCue: "Sunlight caustic patterns breaking through surface",
        voiceover: "And we have only explored 5% of what lives down there. Follow for part 2!",
      },
    ],
  });

  // Generate Script using Gemini AI
  const handleGenerateScript = async () => {
    if (!topic.trim() || isScriptLoading) return;
    setIsScriptLoading(true);
    try {
      const data = await generateStoryboardScript({
        topic,
        targetDuration,
        targetPlatform: platform,
      });
      setStoryboard(data);
    } catch (err) {
      console.error("Storyboard script generation error:", err);
    } finally {
      setIsScriptLoading(false);
    }
  };

  // Add new scene
  const handleAddScene = () => {
    if (!storyboard) return;
    const newNum = storyboard.scenes.length + 1;
    const newScene: SceneScript = {
      sceneNumber: newNum,
      title: `Scene ${newNum}`,
      duration: 4,
      description: "Describe the next sequence of visual action...",
      camera: "Slow Push-In (Zoom In)",
      visualCue: "Cinematic atmospheric lighting",
    };
    setStoryboard({
      ...storyboard,
      scenes: [...storyboard.scenes, newScene],
    });
  };

  // Delete scene
  const handleDeleteScene = (index: number) => {
    if (!storyboard) return;
    const updated = storyboard.scenes.filter((_, idx) => idx !== index);
    setStoryboard({
      ...storyboard,
      scenes: updated.map((s, i) => ({ ...s, sceneNumber: i + 1 })),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Generator Input Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Multi-Scene Storyboard & Scriptwriter</h2>
              <p className="text-xs text-slate-400">
                Transform any idea into a sequenced, ready-to-render viral short video
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-full font-semibold border border-indigo-800">
            Gemini 3.7 Pro Script Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Video Topic or Story Outline</label>
            <input
              type="text"
              id="storyboard-topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 3 Reasons Why Quantum Computers Will Change The World"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Target Duration</label>
            <div className="flex gap-1">
              {[15, 30, 60].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  id={`storyboard-dur-${dur}s-btn`}
                  onClick={() => setTargetDuration(dur)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                    targetDuration === dur
                      ? "bg-indigo-600 border-indigo-400 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Visual Style:</span>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as VideoStyle)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 outline-none"
            >
              <option value="Cinematic">Cinematic 8K</option>
              <option value="Cyberpunk Neon">Cyberpunk Neon</option>
              <option value="Anime & Manga">Anime Makoto</option>
              <option value="Photorealistic">Photorealistic</option>
              <option value="3D Pixar Animation">3D Animation</option>
              <option value="Vintage 35mm Film">Vintage Film</option>
            </select>
          </div>

          <button
            type="button"
            id="generate-ai-script-btn"
            onClick={handleGenerateScript}
            disabled={isScriptLoading || !topic.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-950 transition-all disabled:opacity-50"
          >
            {isScriptLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Writing Storyboard...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Auto-Generate Storyboard</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Scenes Timeline Cards */}
      {storyboard && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-indigo-400" />
              <span>Storyboard Sequence ({storyboard.scenes.length} Scenes)</span>
            </h3>
            <button
              onClick={handleAddScene}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Scene</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {storyboard.scenes.map((scene, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 relative group hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                      Shot #{scene.sceneNumber} • {scene.duration}s
                    </span>
                    <button
                      onClick={() => handleDeleteScene(idx)}
                      className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1">{scene.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{scene.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Camera:</span>
                    <span className="text-sky-300 font-medium truncate max-w-[150px]">{scene.camera}</span>
                  </div>
                  {scene.voiceover && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 italic text-[11px]">
                      "{scene.voiceover}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Render All Scenes Button */}
          <div className="pt-2">
            <button
              onClick={() => onBatchGenerate(storyboard.scenes, style, topic)}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-950 hover:opacity-95 transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Render Complete Multi-Scene Short ({storyboard.scenes.reduce((a, b) => a + b.duration, 0)}s)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
