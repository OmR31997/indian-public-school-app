"use client";

import React from "react";
import { Zap } from "lucide-react";

interface ImageCompressTabProps {
  outputFormat: "webp" | "jpeg" | "png";
  setOutputFormat: (fmt: "webp" | "jpeg" | "png") => void;
  quality: number;
  setQuality: (q: number) => void;
  originalByteEstimate: number;
  compressedByteEstimate: number;
}

export function ImageCompressTab({
  outputFormat,
  setOutputFormat,
  quality,
  setQuality,
  originalByteEstimate,
  compressedByteEstimate,
}: ImageCompressTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          Output File Format
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "webp", name: "WEBP", desc: "Best Compression" },
            { id: "jpeg", name: "JPEG", desc: "Photo Standard" },
            { id: "png", name: "PNG", desc: "Lossless / Alpha" },
          ].map((fmt) => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => setOutputFormat(fmt.id as any)}
              className={`flex flex-col p-2.5 rounded-xl border text-left transition cursor-pointer ${
                outputFormat === fmt.id
                  ? "border-emerald-500 bg-emerald-600/20 text-white font-bold"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
              }`}
            >
              <span className="text-xs font-extrabold text-slate-100">{fmt.name}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{fmt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {outputFormat !== "png" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Compression Quality Level
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400">{quality}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value) || 85)}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
      )}

      {/* Compression Estimate Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Zap size={14} className="text-emerald-400" /> Image Size Optimization
          </span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            {originalByteEstimate > 0
              ? `-${Math.max(0, Math.round((1 - compressedByteEstimate / originalByteEstimate) * 100))}%`
              : "Optimized"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">Original Estimate</span>
            <span className="font-mono font-bold text-slate-400">~{originalByteEstimate} KB</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">Optimized Estimate</span>
            <span className="font-mono font-extrabold text-emerald-400">~{compressedByteEstimate} KB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
