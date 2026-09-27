"use client";

import React from "react";
import { Lock, Unlock } from "lucide-react";

interface ImageResizeTabProps {
  targetWidth: number;
  targetHeight: number;
  handleWidthChange: (w: number) => void;
  handleHeightChange: (h: number) => void;
  lockAspectRatio: boolean;
  setLockAspectRatio: (lock: boolean) => void;
  handleQuickScale: (pct: number) => void;
  handlePresetWidth: (w: number) => void;
}

export function ImageResizeTab({
  targetWidth,
  targetHeight,
  handleWidthChange,
  handleHeightChange,
  lockAspectRatio,
  setLockAspectRatio,
  handleQuickScale,
  handlePresetWidth,
}: ImageResizeTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Target Canvas Dimensions (px)
          </label>
          <button
            type="button"
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            className={`flex items-center gap-1 text-[11px] font-bold transition cursor-pointer ${
              lockAspectRatio ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {lockAspectRatio ? <Lock size={12} /> : <Unlock size={12} />}
            <span>{lockAspectRatio ? "Lock Ratio" : "Unlock Ratio"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">Width (px)</span>
            <input
              type="number"
              min="50"
              max="4000"
              value={targetWidth}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 100)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">Height (px)</span>
            <input
              type="number"
              min="50"
              max="4000"
              value={targetHeight}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 100)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          Quick Scale Percentages
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handleQuickScale(pct)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-2 py-2 text-xs font-bold text-slate-300 hover:border-slate-700 hover:text-white transition cursor-pointer"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          Common Width Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "1200px (Full Banner)", w: 1200 },
            { label: "800px (Content Main)", w: 800 },
            { label: "500px (Card Medium)", w: 500 },
            { label: "300px (Sidebar Small)", w: 300 },
          ].map((pw) => (
            <button
              key={pw.w}
              type="button"
              onClick={() => handlePresetWidth(pw.w)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-[11px] font-semibold text-left text-slate-300 hover:border-slate-700 hover:text-white transition cursor-pointer"
            >
              {pw.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
