"use client";

import React from "react";
import { Info, Check } from "lucide-react";

interface ImageCropTabProps {
  ASPECT_RATIOS: Array<{ label: string; value: number }>;
  aspectRatio: number;
  setAspectRatio: (val: number) => void;
  cropRect: { x: number; y: number; width: number; height: number };
  setCropRect: React.Dispatch<React.SetStateAction<{ x: number; y: number; width: number; height: number }>>;
  naturalSize: { width: number; height: number };
  commitCrop: () => void;
}

export function ImageCropTab({
  ASPECT_RATIOS,
  aspectRatio,
  setAspectRatio,
  cropRect,
  setCropRect,
  naturalSize,
  commitCrop,
}: ImageCropTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          Aspect Ratio Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ASPECT_RATIOS.map((ar) => (
            <button
              key={ar.label}
              type="button"
              onClick={() => setAspectRatio(ar.value)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold text-left transition cursor-pointer ${
                aspectRatio === ar.value
                  ? "border-blue-500 bg-blue-600/20 text-blue-300 font-bold"
                  : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
              }`}
            >
              {ar.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Crop Coordinates Inputs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
          Custom Crop Region Box
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">
              Left X ({Math.round((cropRect.x / 100) * naturalSize.width)}px)
            </span>
            <input
              type="number"
              min="0"
              max="95"
              value={Math.round(cropRect.x)}
              onChange={(e) => {
                const val = Math.max(0, Math.min(95, parseInt(e.target.value) || 0));
                setCropRect((prev) => ({ ...prev, x: val }));
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">
              Top Y ({Math.round((cropRect.y / 100) * naturalSize.height)}px)
            </span>
            <input
              type="number"
              min="0"
              max="95"
              value={Math.round(cropRect.y)}
              onChange={(e) => {
                const val = Math.max(0, Math.min(95, parseInt(e.target.value) || 0));
                setCropRect((prev) => ({ ...prev, y: val }));
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">
              Width ({Math.round((cropRect.width / 100) * naturalSize.width)}px)
            </span>
            <input
              type="number"
              min="5"
              max="100"
              value={Math.round(cropRect.width)}
              onChange={(e) => {
                const val = Math.max(5, Math.min(100 - cropRect.x, parseInt(e.target.value) || 10));
                setCropRect((prev) => ({ ...prev, width: val }));
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">
              Height ({Math.round((cropRect.height / 100) * naturalSize.height)}px)
            </span>
            <input
              type="number"
              min="5"
              max="100"
              value={Math.round(cropRect.height)}
              onChange={(e) => {
                const val = Math.max(5, Math.min(100 - cropRect.y, parseInt(e.target.value) || 10));
                setCropRect((prev) => ({ ...prev, height: val }));
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-2">
        <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Info size={14} className="text-blue-400" /> Interactive Custom Drag
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Drag any of the 8 blue handles around the image box to stretch, shrink, or custom crop any portion of the image.
        </p>
      </div>

      <button
        type="button"
        onClick={commitCrop}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg hover:bg-blue-500 transition cursor-pointer"
      >
        <Check size={14} />
        <span>Apply & Commit Crop Selection</span>
      </button>
    </div>
  );
}
