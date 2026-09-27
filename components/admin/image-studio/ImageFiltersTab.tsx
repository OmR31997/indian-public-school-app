"use client";

import React from "react";
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from "lucide-react";

interface ImageFiltersTabProps {
  rotation: number;
  setRotation: (val: number | ((prev: number) => number)) => void;
  flipH: boolean;
  setFlipH: (val: boolean | ((prev: boolean) => boolean)) => void;
  flipV: boolean;
  setFlipV: (val: boolean | ((prev: boolean) => boolean)) => void;
  brightness: number;
  setBrightness: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  saturation: number;
  setSaturation: (val: number) => void;
  grayscale: number;
  setGrayscale: (val: number) => void;
  sepia: number;
  setSepia: (val: number) => void;
  blur: number;
  setBlur: (val: number) => void;
}

export function ImageFiltersTab({
  rotation,
  setRotation,
  flipH,
  setFlipH,
  flipV,
  setFlipV,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturation,
  setSaturation,
  grayscale,
  setGrayscale,
  sepia,
  setSepia,
  blur,
  setBlur,
}: ImageFiltersTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Rotation & Flip */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          Rotation & Orientation
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 transition cursor-pointer"
            title="Rotate 90 Left"
          >
            <RotateCcw size={16} />
            <span className="text-[10px] mt-1 font-semibold">-90°</span>
          </button>
          <button
            type="button"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 transition cursor-pointer"
            title="Rotate 90 Right"
          >
            <RotateCw size={16} />
            <span className="text-[10px] mt-1 font-semibold">+90°</span>
          </button>
          <button
            type="button"
            onClick={() => setFlipH((f) => !f)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-slate-300 transition cursor-pointer ${
              flipH ? "border-blue-500 bg-blue-600/20 text-blue-300 font-bold" : "border-slate-800 bg-slate-950 hover:border-slate-700"
            }`}
            title="Flip Horizontal"
          >
            <FlipHorizontal size={16} />
            <span className="text-[10px] mt-1 font-semibold">Flip H</span>
          </button>
          <button
            type="button"
            onClick={() => setFlipV((f) => !f)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-slate-300 transition cursor-pointer ${
              flipV ? "border-blue-500 bg-blue-600/20 text-blue-300 font-bold" : "border-slate-800 bg-slate-950 hover:border-slate-700"
            }`}
            title="Flip Vertical"
          >
            <FlipVertical size={16} />
            <span className="text-[10px] mt-1 font-semibold">Flip V</span>
          </button>
        </div>
      </div>

      {/* Color Sliders */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Brightness</span>
            <span>{brightness}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="180"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value) || 100)}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Contrast</span>
            <span>{contrast}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="180"
            value={contrast}
            onChange={(e) => setContrast(parseInt(e.target.value) || 100)}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Saturation</span>
            <span>{saturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={saturation}
            onChange={(e) => setSaturation(parseInt(e.target.value) || 100)}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Grayscale</span>
            <span>{grayscale}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={grayscale}
            onChange={(e) => setGrayscale(parseInt(e.target.value) || 0)}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Sepia Tone</span>
            <span>{sepia}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sepia}
            onChange={(e) => setSepia(parseInt(e.target.value) || 0)}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Gaussian Blur</span>
            <span>{blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={blur}
            onChange={(e) => setBlur(parseFloat(e.target.value) || 0)}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
