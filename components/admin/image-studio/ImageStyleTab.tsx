"use client";

import React from "react";

interface ImageStyleTabProps {
  borderRadius: number;
  setBorderRadius: (val: number) => void;
  borderWidth: number;
  setBorderWidth: (val: number) => void;
  borderColor: string;
  setBorderColor: (val: string) => void;
  shadowStyle: "none" | "soft" | "medium" | "elevated" | "glow";
  setShadowStyle: (val: "none" | "soft" | "medium" | "elevated" | "glow") => void;
}

export function ImageStyleTab({
  borderRadius,
  setBorderRadius,
  borderWidth,
  setBorderWidth,
  borderColor,
  setBorderColor,
  shadowStyle,
  setShadowStyle,
}: ImageStyleTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div>
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
          <span>Corner Rounded Radius</span>
          <span>{borderRadius}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="48"
          value={borderRadius}
          onChange={(e) => setBorderRadius(parseInt(e.target.value) || 0)}
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      <div>
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
          <span>Border Stroke Width</span>
          <span>{borderWidth}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="12"
          value={borderWidth}
          onChange={(e) => setBorderWidth(parseInt(e.target.value) || 0)}
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      {borderWidth > 0 && (
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
            Border Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="h-8 w-12 cursor-pointer rounded-lg border border-slate-700 bg-slate-950 p-1"
            />
            <input
              type="text"
              value={borderColor}
              onChange={(e) => setBorderColor(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-mono text-slate-200 outline-none"
            />
          </div>
        </div>
      )}

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          Drop Shadow Effect
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "none", name: "Flat (No Shadow)" },
            { id: "soft", name: "Soft Subtle" },
            { id: "medium", name: "Medium Card" },
            { id: "elevated", name: "High Elevated" },
            { id: "glow", name: "IPS Blue Glow" },
          ].map((sh) => (
            <button
              key={sh.id}
              type="button"
              onClick={() => setShadowStyle(sh.id as any)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold text-left transition cursor-pointer ${
                shadowStyle === sh.id
                  ? "border-purple-500 bg-purple-600/20 text-purple-300 font-bold"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
              }`}
            >
              {sh.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
