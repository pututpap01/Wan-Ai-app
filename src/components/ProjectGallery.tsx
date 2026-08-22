import React from "react";
import { Film, Play, Download, Trash2, Copy, Sparkles, Clock, Layers } from "lucide-react";
import { VideoProject } from "../types";

interface ProjectGalleryProps {
  projects: VideoProject[];
  onSelectProject: (project: VideoProject) => void;
  onDeleteProject: (id: string) => void;
  selectedProjectId?: string;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({
  projects,
  onSelectProject,
  onDeleteProject,
  selectedProjectId,
}) => {
  if (projects.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
          <Film className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Your Video Library is Empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Videos you generate in Studio or Storyboard will be saved here so you can replay, export, and manage them anytime.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Film className="w-4 h-4 text-sky-400" />
          <span>Saved Projects ({projects.length})</span>
        </h3>
        <span className="text-xs text-slate-400">Stored in browser local session</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isSelected = proj.id === selectedProjectId;
          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj)}
              className={`bg-slate-900/90 border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                isSelected
                  ? "border-sky-500 ring-2 ring-sky-500/20 bg-slate-900 shadow-lg shadow-sky-950"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800/80">
                    {proj.aspectRatio} • {proj.duration}s
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(proj.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Delete video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">{proj.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{proj.prompt}</p>
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-indigo-300 font-semibold">{proj.style}</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3 h-3" />
                  {new Date(proj.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
