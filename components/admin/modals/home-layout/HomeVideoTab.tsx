"use client";

import React from "react";

interface HomeVideoTabProps {
  homeObj: any;
  updateHome: (updater: (prev: any) => any) => void;
}

export function HomeVideoTab({ homeObj, updateHome }: HomeVideoTabProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
          <i className="bi bi-camera-video-fill text-[#1a5d9c]" /> Featured Intro Video Settings
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-bold text-slate-500">Video Heading Title</label>
            <input
              type="text"
              value={homeObj.video?.heading || ""}
              onChange={(e) => {
                updateHome((prev) => ({ ...prev, video: { ...prev.video, heading: e.target.value } }));
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500">YouTube Embed Link / Video URL</label>
            <input
              type="text"
              value={homeObj.video?.videoUrl || ""}
              onChange={(e) => {
                updateHome((prev) => ({ ...prev, video: { ...prev.video, videoUrl: e.target.value } }));
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500">Video Description</label>
          <textarea
            rows={2}
            value={homeObj.video?.description || ""}
            onChange={(e) => {
              updateHome((prev) => ({ ...prev, video: { ...prev.video, description: e.target.value } }));
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
          />
        </div>
      </div>
    </div>
  );
}
