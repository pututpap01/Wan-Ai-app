import React from "react";
import { Sparkles, Smartphone, Key, History, Clapperboard, Layers } from "lucide-react";

interface HeaderProps {
  activeTab: "generator" | "storyboard" | "gallery";
  setActiveTab: (tab: "generator" | "storyboard" | "gallery") => void;
  projectCount: number;
  onOpenAndroidGuide: () => void;
  onOpenRapidApiModal: () => void;
  onOpenColabModal: () => void;
  isColabConnected: boolean;
  isAndroidPreview: boolean;
  setIsAndroidPreview: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  projectCount,
  onOpenAndroidGuide,
  onOpenRapidApiModal,
  onOpenColabModal,
  isColabConnected,
  isAndroidPreview,
  setIsAndroidPreview,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">AI Video Studio</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Runway & Veo Core
              </span>
            </div>
            <p className="text-xs text-slate-400">Text-to-Video, Image-to-Video & Storyboards</p>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            id="tab-generator-btn"
            onClick={() => setActiveTab("generator")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "generator"
                ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-950"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          <button
            id="tab-storyboard-btn"
            onClick={() => setActiveTab("storyboard")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "storyboard"
                ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-950"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AI Storyboard</span>
          </button>

          <button
            id="tab-gallery-btn"
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "gallery"
                ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-950"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Library</span>
            {projectCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                {projectCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Tools & Android Guide */}
        <div className="flex items-center gap-2">
          {/* Toggle Android Mobile Frame */}
          <button
            id="toggle-android-view-btn"
            onClick={() => setIsAndroidPreview((prev) => !prev)}
            title="Preview inside Android Mobile Phone Frame"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isAndroidPreview
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android Frame</span>
          </button>

          {/* Wan2.2 Colab Server Tunnel Connection */}
          <button
            id="colab-server-config-btn"
            onClick={onOpenColabModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isColabConnected
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-950"
                : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800"
            }`}
            title="Google Colab Wan2.2 GPU Tunnel Server"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isColabConnected ? "bg-amber-400 animate-ping" : "bg-slate-500"
              }`}
            ></span>
            <span>Wan2.2 Colab</span>
            {isColabConnected && (
              <span className="hidden lg:inline text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                ON
              </span>
            )}
          </button>

          {/* Android APK Integration Guide */}
          <button
            id="android-guide-modal-btn"
            onClick={onOpenAndroidGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/60 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>APK Guide</span>
          </button>

          {/* RapidAPI / Runway config */}
          <button
            id="rapidapi-config-btn"
            onClick={onOpenRapidApiModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors"
            title="Runway & RapidAPI Settings"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">RapidAPI</span>
          </button>
        </div>
      </div>
    </header>
  );
};

