"use client";

import React from "react";
import { AlignLeft, AlignCenter, AlignRight, Maximize } from "lucide-react";

interface ImageSeoTabProps {
  altText: string;
  setAltText: (val: string) => void;
  titleText: string;
  setTitleText: (val: string) => void;
  captionText: string;
  setCaptionText: (val: string) => void;
  alignment: "left" | "center" | "right" | "full";
  setAlignment: (val: "left" | "center" | "right" | "full") => void;
  linkUrl: string;
  setLinkUrl: (val: string) => void;
}

export function ImageSeoTab({
  altText,
  setAltText,
  titleText,
  setTitleText,
  captionText,
  setCaptionText,
  alignment,
  setAlignment,
  linkUrl,
  setLinkUrl,
}: ImageSeoTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
          Alt Text <span className="text-rose-400">* (SEO & Accessibility)</span>
        </label>
        <input
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe image for search engines..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
          Image Title / Tooltip
        </label>
        <input
          type="text"
          value={titleText}
          onChange={(e) => setTitleText(e.target.value)}
          placeholder="Tooltip hover text..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
          Visible Figure Caption
        </label>
        <input
          type="text"
          value={captionText}
          onChange={(e) => setCaptionText(e.target.value)}
          placeholder="Caption under image..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          Page Layout Alignment
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "left", label: "Left Float", icon: AlignLeft },
            { id: "center", label: "Center Block", icon: AlignCenter },
            { id: "right", label: "Right Float", icon: AlignRight },
            { id: "full", label: "Full Width", icon: Maximize },
          ].map((align) => {
            const IconComp = align.icon;
            return (
              <button
                key={align.id}
                type="button"
                onClick={() => setAlignment(align.id as any)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition cursor-pointer ${
                  alignment === align.id
                    ? "border-blue-500 bg-blue-600/20 text-blue-300 font-bold"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                }`}
              >
                <IconComp size={15} />
                <span className="text-[10px] mt-1 font-semibold">{align.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
          Hyperlink Destination URL
        </label>
        <input
          type="text"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="e.g. /admission or https://..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-mono text-blue-400 outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}
