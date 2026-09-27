"use client";

import React from "react";
import { Plus, X, UploadCloud, Trash2 } from "lucide-react";

interface HomeHeroTabProps {
  homeObj: any;
  updateHome: (updater: (prev: any) => any) => void;
  uploadImage: (file: File) => Promise<string>;
}

export function HomeHeroTab({ homeObj, updateHome, uploadImage }: HomeHeroTabProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
          <i className="bi bi-person-standing text-[#1a5d9c]" /> Hero Main Poster & Content Settings
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-bold text-slate-500">Session Badge Text</label>
            <input
              type="text"
              value={homeObj.hero?.content?.[0]?.session || ""}
              onChange={(e) => {
                const content = [...(homeObj.hero?.content || [{}])];
                content[0] = { ...content[0], session: e.target.value };
                updateHome((prev) => ({ ...prev, hero: { ...prev.hero, content } }));
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500">Main Hero Title</label>
            <input
              type="text"
              value={homeObj.hero?.content?.[0]?.title || ""}
              onChange={(e) => {
                const content = [...(homeObj.hero?.content || [{}])];
                content[0] = { ...content[0], title: e.target.value };
                updateHome((prev) => ({ ...prev, hero: { ...prev.hero, content } }));
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500">Hero Subtitle / Description</label>
          <textarea
            rows={2}
            value={homeObj.hero?.content?.[0]?.description || ""}
            onChange={(e) => {
              const content = [...(homeObj.hero?.content || [{}])];
              content[0] = { ...content[0], description: e.target.value };
              updateHome((prev) => ({ ...prev, hero: { ...prev.hero, content } }));
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
          />
        </div>

        {/* Feature Badges */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500">Feature Badges (e.g. CBSE Affiliated)</label>
            <button
              type="button"
              onClick={() => {
                const content = [...(homeObj.hero?.content || [{}])];
                const icoBtn = [...(content[0].icoBtn || [])];
                icoBtn.push({ text: "New Badge", icoUrl: "" });
                content[0] = { ...content[0], icoBtn };
                updateHome((prev) => ({ ...prev, hero: { ...prev.hero, content } }));
              }}
              className="flex items-center gap-1 text-xs font-bold text-[#1a5d9c] hover:underline"
            >
              <Plus size={13} /> Add Badge
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Array.isArray(homeObj.hero?.content?.[0]?.icoBtn) ? homeObj.hero.content[0].icoBtn : []).map((badge: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1">
                <input
                  type="text"
                  value={badge.text || ""}
                  onChange={(e) => {
                    const content = [...(homeObj.hero?.content || [{}])];
                    const icoBtn = [...(content[0].icoBtn || [])];
                    icoBtn[idx] = { ...icoBtn[idx], text: e.target.value };
                    content[0] = { ...content[0], icoBtn };
                    updateHome((prev) => ({ ...prev, hero: { ...prev.hero, content } }));
                  }}
                  className="w-full text-xs font-semibold outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    const content = [...(homeObj.hero?.content || [{}])];
                    const icoBtn = (content[0].icoBtn || []).filter((_: any, i: number) => i !== idx);
                    content[0] = { ...content[0], icoBtn };
                    updateHome((prev) => ({ ...prev, hero: { ...prev.hero, content } }));
                  }}
                  className="text-slate-400 hover:text-red-600"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Posters Upload */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500">Hero Background Posters ({(homeObj.hero?.fileUrls || []).length})</label>
          <div className="grid gap-3 sm:grid-cols-4">
            {(Array.isArray(homeObj.hero?.fileUrls) ? homeObj.hero.fileUrls : []).map((url: string, idx: number) => (
              <div key={idx} className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Hero ${idx}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    const fileUrls = (homeObj.hero?.fileUrls || []).filter((_: any, i: number) => i !== idx);
                    updateHome((prev) => ({ ...prev, hero: { ...prev.hero, fileUrls } }));
                  }}
                  className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-3 text-center transition hover:bg-slate-50">
              <UploadCloud className="text-[#1a5d9c]" size={20} />
              <span className="mt-1 text-[11px] font-bold text-[#1a5d9c]">Upload Poster</span>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await uploadImage(file);
                    if (url) {
                      const fileUrls = [...(homeObj.hero?.fileUrls || []), url];
                      updateHome((prev) => ({ ...prev, hero: { ...prev.hero, fileUrls } }));
                    }
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
