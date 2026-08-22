import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { VideoGeneratorForm } from "./components/VideoGeneratorForm";
import { VideoPlayer } from "./components/VideoPlayer";
import { StoryboardCreator } from "./components/StoryboardCreator";
import { ProjectGallery } from "./components/ProjectGallery";
import { AndroidGuideModal } from "./components/AndroidGuideModal";
import { RapidApiModal } from "./components/RapidApiModal";
import { ColabIntegrationModal } from "./components/ColabIntegrationModal";
import { AspectRatio, CameraMotion, ColabServerConfig, SceneScript, VideoProject, VideoStyle } from "./types";
import { renderColabVideo } from "./services/videoService";
import { PRESET_TEMPLATES } from "./data/presets";
import { Smartphone, Sparkles, Film, ArrowRight } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"generator" | "storyboard" | "gallery">("generator");
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [isAndroidPreview, setIsAndroidPreview] = useState<boolean>(false);
  const [isAndroidGuideOpen, setIsAndroidGuideOpen] = useState<boolean>(false);
  const [isRapidApiModalOpen, setIsRapidApiModalOpen] = useState<boolean>(false);
  const [isColabModalOpen, setIsColabModalOpen] = useState<boolean>(false);
  const [rapidApiKey, setRapidApiKey] = useState<string>("");
  const [colabConfig, setColabConfig] = useState<ColabServerConfig>({
    url: "",
    isConnected: false,
    modelName: "Wan2.1-T2V-1.3B",
  });

  // Load initial projects & colab settings from localStorage
  useEffect(() => {
    try {
      const savedColab = localStorage.getItem("ai_colab_config");
      if (savedColab) {
        setColabConfig(JSON.parse(savedColab));
      }

      const saved = localStorage.getItem("ai_video_projects");
      if (saved) {
        const parsed = JSON.parse(saved);
        setProjects(parsed);
        if (parsed.length > 0) {
          setCurrentProject(parsed[0]);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }

    // Default starter project
    const defaultProj: VideoProject = {
      id: "proj_initial_cyberpunk",
      title: "Cyberpunk Tokyo Rain",
      prompt: "Futuristic neon-lit street in Tokyo at midnight, heavy rain with reflections on asphalt, flying holographic vehicles zooming past, moody atmosphere",
      enhancedPrompt: "Futuristic neon-lit street in Tokyo at midnight, volumetric heavy rain with reflections on asphalt, anamorphic blue and magenta lens flares, flying holographic vehicles zooming past, 8k cinematic masterpiece",
      style: "Cyberpunk Neon",
      cameraMotion: "Slow Push-In (Zoom In)",
      aspectRatio: "9:16",
      duration: 6,
      fps: 30,
      motionIntensity: 8,
      createdAt: Date.now(),
      status: "completed",
      progress: 100,
      cameraNotes: "Slow Push-In with 35mm f/1.4 lens depth of field",
      lightingNotes: "Vibrant high-contrast neon lighting with asphalt reflections",
      keywords: ["cyberpunk", "tokyo", "neon", "rain", "cinematic"],
    };

    setProjects([defaultProj]);
    setCurrentProject(defaultProj);
  }, []);

  // Save projects to localStorage on update
  const saveProjects = (updatedProjects: VideoProject[]) => {
    setProjects(updatedProjects);
    try {
      localStorage.setItem("ai_video_projects", JSON.stringify(updatedProjects));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  };

  // Generate Video Handler
  const handleGenerateVideo = async (config: {
    prompt: string;
    enhancedPrompt?: string;
    style: VideoStyle;
    cameraMotion: CameraMotion;
    aspectRatio: AspectRatio;
    duration: number;
    motionIntensity: number;
    imageUrl?: string;
    cameraNotes?: string;
    lightingNotes?: string;
    keywords?: string[];
  }) => {
    setIsGenerating(true);
    setGenerationProgress(10);

    const isColabActive = colabConfig.isConnected && colabConfig.url;
    const newProjId = `proj_${Date.now()}`;
    const newProj: VideoProject = {
      id: newProjId,
      title: config.prompt.slice(0, 36) + (config.prompt.length > 36 ? "..." : ""),
      prompt: config.prompt,
      enhancedPrompt: config.enhancedPrompt,
      style: config.style,
      cameraMotion: config.cameraMotion,
      aspectRatio: config.aspectRatio,
      duration: config.duration,
      fps: 30,
      motionIntensity: config.motionIntensity,
      imageUrl: config.imageUrl,
      createdAt: Date.now(),
      status: "rendering",
      progress: 10,
      source: isColabActive ? "colab_wan" : "local_engine",
      cameraNotes: config.cameraNotes,
      lightingNotes: config.lightingNotes,
      keywords: config.keywords,
    };

    setCurrentProject(newProj);

    // If Colab GPU is active, trigger real Wan2.2 video generation via Colab Tunnel Proxy
    if (isColabActive) {
      const interval = setInterval(() => {
        setGenerationProgress((prev) => (prev < 90 ? prev + 8 : 90));
      }, 700);

      try {
        const result = await renderColabVideo({
          colabUrl: colabConfig.url,
          prompt: config.enhancedPrompt || config.prompt,
          aspectRatio: config.aspectRatio,
          duration: config.duration,
          guidanceScale: 6.0,
        });

        clearInterval(interval);

        if (result.success && result.videoBlobUrl) {
          setGenerationProgress(100);
          const completedProj: VideoProject = {
            ...newProj,
            status: "completed",
            progress: 100,
            videoBlobUrl: result.videoBlobUrl,
          };
          const updated = [completedProj, ...projects.filter((p) => p.id !== newProjId)];
          saveProjects(updated);
          setCurrentProject(completedProj);
          setIsGenerating(false);
          return;
        } else {
          console.warn("Colab rendering returned error, falling back to real-time canvas:", result.error);
        }
      } catch (colabErr) {
        clearInterval(interval);
        console.warn("Colab request failed, falling back to local canvas:", colabErr);
      }
    }

    // Call Backend endpoint for tracking / Runway fallback
    try {
      await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: config.prompt,
          style: config.style,
          cameraMotion: config.cameraMotion,
          aspectRatio: config.aspectRatio,
          duration: config.duration,
          imageUrl: config.imageUrl,
          rapidApiKey: rapidApiKey || undefined,
        }),
      });
    } catch (err) {
      console.warn("Backend API notice, continuing with local engine:", err);
    }

    // Step-by-step rendering progression
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 15;
      });
    }, 450);

    setTimeout(() => {
      clearInterval(interval);
      setGenerationProgress(100);

      const completedProj: VideoProject = {
        ...newProj,
        status: "completed",
        progress: 100,
      };

      const updated = [completedProj, ...projects.filter((p) => p.id !== newProjId)];
      saveProjects(updated);
      setCurrentProject(completedProj);
      setIsGenerating(false);
    }, 3200);
  };

  // Multi-Scene Storyboard Batch Render Handler
  const handleBatchStoryboardGenerate = async (
    scenes: SceneScript[],
    style: VideoStyle,
    topic: string
  ) => {
    setIsGenerating(true);
    setGenerationProgress(15);
    setActiveTab("generator");

    const totalDuration = scenes.reduce((a, b) => a + b.duration, 0);
    const combinedPrompt = scenes.map((s) => s.description).join(" -> ");

    const batchProject: VideoProject = {
      id: `storyboard_${Date.now()}`,
      title: topic,
      prompt: combinedPrompt,
      style,
      cameraMotion: "360 Orbital Rotation",
      aspectRatio: "9:16",
      duration: Math.min(totalDuration, 16),
      fps: 30,
      motionIntensity: 7,
      createdAt: Date.now(),
      status: "rendering",
      progress: 20,
      scenes,
      cameraNotes: "Multi-shot cinematic sequence with dynamic transitions",
    };

    setCurrentProject(batchProject);

    setTimeout(() => {
      setGenerationProgress(100);
      const completed: VideoProject = {
        ...batchProject,
        status: "completed",
        progress: 100,
      };
      const updated = [completed, ...projects];
      saveProjects(updated);
      setCurrentProject(completed);
      setIsGenerating(false);
    }, 3600);
  };

  // Delete Project Handler
  const handleDeleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    saveProjects(updated);
    if (currentProject?.id === id) {
      setCurrentProject(updated.length > 0 ? updated[0] : null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectCount={projects.length}
        onOpenAndroidGuide={() => setIsAndroidGuideOpen(true)}
        onOpenRapidApiModal={() => setIsRapidApiModalOpen(true)}
        onOpenColabModal={() => setIsColabModalOpen(true)}
        isColabConnected={colabConfig.isConnected}
        isAndroidPreview={isAndroidPreview}
        setIsAndroidPreview={setIsAndroidPreview}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Android Frame Mockup Container (if toggled) */}
        {isAndroidPreview ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-center mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/40">
                <Smartphone className="w-3.5 h-3.5" />
                Android Mobile Screen Simulator (Samsung Galaxy / Pixel Viewport)
              </span>
            </div>

            {/* Android Device Mockup Shell */}
            <div className="w-[390px] h-[820px] bg-slate-900 border-[10px] border-slate-800 rounded-[44px] shadow-2xl shadow-sky-500/10 overflow-hidden flex flex-col relative ring-1 ring-slate-700">
              {/* Speaker & Camera Notch */}
              <div className="h-6 bg-slate-900 flex items-center justify-center relative shrink-0">
                <div className="w-16 h-3.5 bg-black rounded-full flex items-center justify-end pr-1.5">
                  <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                </div>
              </div>

              {/* Mobile Scrollable Viewport */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
                {activeTab === "generator" && (
                  <div className="space-y-4">
                    <VideoPlayer
                      currentProject={currentProject}
                      isGenerating={isGenerating}
                      generationProgress={generationProgress}
                    />
                    <VideoGeneratorForm
                      onGenerate={handleGenerateVideo}
                      isGenerating={isGenerating}
                      generationProgress={generationProgress}
                      colabConfig={colabConfig}
                      onOpenColabModal={() => setIsColabModalOpen(true)}
                    />
                  </div>
                )}
                {activeTab === "storyboard" && (
                  <StoryboardCreator
                    onBatchGenerate={handleBatchStoryboardGenerate}
                    isGenerating={isGenerating}
                  />
                )}
                {activeTab === "gallery" && (
                  <ProjectGallery
                    projects={projects}
                    onSelectProject={(proj) => {
                      setCurrentProject(proj);
                      setActiveTab("generator");
                    }}
                    onDeleteProject={handleDeleteProject}
                    selectedProjectId={currentProject?.id}
                  />
                )}
              </div>

              {/* Android Home Navigation Bar Pill */}
              <div className="h-4 bg-slate-900 flex items-center justify-center shrink-0">
                <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Responsive Studio Layout */
          <div>
            {activeTab === "generator" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Form Controls & AI Prompts */}
                <div className="lg:col-span-7 space-y-6">
                  <VideoGeneratorForm
                    onGenerate={handleGenerateVideo}
                    isGenerating={isGenerating}
                    generationProgress={generationProgress}
                    colabConfig={colabConfig}
                    onOpenColabModal={() => setIsColabModalOpen(true)}
                  />
                </div>

                {/* Right Column: Live Player & Export Studio */}
                <div className="lg:col-span-5 sticky top-20 space-y-6">
                  <VideoPlayer
                    currentProject={currentProject}
                    isGenerating={isGenerating}
                    generationProgress={generationProgress}
                  />
                </div>
              </div>
            )}

            {activeTab === "storyboard" && (
              <StoryboardCreator
                onBatchGenerate={handleBatchStoryboardGenerate}
                isGenerating={isGenerating}
              />
            )}

            {activeTab === "gallery" && (
              <ProjectGallery
                projects={projects}
                onSelectProject={(proj) => {
                  setCurrentProject(proj);
                  setActiveTab("generator");
                }}
                onDeleteProject={handleDeleteProject}
                selectedProjectId={currentProject?.id}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>AI Video Generator Studio • Powered by Google Gemini 3.7, Wan2.2 & Runway Core Architecture</span>
          <button
            onClick={() => setIsAndroidGuideOpen(true)}
            className="text-sky-400 hover:text-sky-300 underline font-medium"
          >
            Pelajari Cara Export Menjadi File APK Android
          </button>
        </div>
      </footer>

      {/* Modals */}
      <AndroidGuideModal
        isOpen={isAndroidGuideOpen}
        onClose={() => setIsAndroidGuideOpen(false)}
      />
      <RapidApiModal
        isOpen={isRapidApiModalOpen}
        onClose={() => setIsRapidApiModalOpen(false)}
        rapidApiKey={rapidApiKey}
        setRapidApiKey={setRapidApiKey}
      />
      <ColabIntegrationModal
        isOpen={isColabModalOpen}
        onClose={() => setIsColabModalOpen(false)}
        colabConfig={colabConfig}
        setColabConfig={(cfg) => {
          setColabConfig(cfg);
          try {
            localStorage.setItem("ai_colab_config", JSON.stringify(cfg));
          } catch (e) {
            console.warn("Colab config save warning:", e);
          }
        }}
      />
    </div>
  );
}

