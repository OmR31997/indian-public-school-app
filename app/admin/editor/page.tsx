"use client";

import React, { useState, useEffect, useRef } from "react";
import { RichTextBox } from "@/components/ui/RichTextBox";
import { ArrowLeft, Save, Check, Sparkles, Monitor } from "lucide-react";

export default function FullscreenEditorPage() {
  const [content, setContent] = useState<string>("");
  const [key, setKey] = useState<string>("rte_standalone_content");
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const storageKey = params.get("key") || "rte_standalone_content";
    setKey(storageKey);

    const initialData = localStorage.getItem(storageKey) || "";
    setContent(initialData);

    try {
      const channel = new BroadcastChannel("rte_sync_channel");
      channelRef.current = channel;
      channel.onmessage = (event) => {
        if (event.data?.key === storageKey && event.data?.value !== undefined) {
          setContent(event.data.value);
        }
      };
    } catch (e) {
      console.warn("BroadcastChannel not supported in this browser environment", e);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, []);

  const handleContentChange = (newVal: string) => {
    setContent(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, newVal);
      try {
        if (channelRef.current) {
          channelRef.current.postMessage({ key, value: newVal });
        }
      } catch (e) {
        // Fallback
      }
    }
  };

  const handleSaveExplicit = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, content);
      try {
        if (channelRef.current) {
          channelRef.current.postMessage({ key, value: content, isExplicitSave: true });
        }
      } catch (e) {}
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header Navigation & Sync Bar */}
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-3 shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.close()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            title="Close editor tab"
          >
            <ArrowLeft size={14} /> Close Editor Tab
          </button>
          <div className="h-5 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Monitor size={15} />
            </div>
            <div>
              <h1 className="text-xs font-extrabold tracking-wide text-slate-100 flex items-center gap-1.5">
                Full Page Interactive CMS Editor Workspace
              </h1>
              <p className="text-[11px] font-medium text-slate-400">
                All editing tools enabled &bull; Real-time auto-syncing with main admin tab
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 animate-in fade-in">
              <Check size={14} /> Changes Synced &amp; Saved!
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveExplicit}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:brightness-110 transition cursor-pointer"
          >
            <Save size={14} /> Save &amp; Sync Back
          </button>
        </div>
      </header>

      {/* Main Full Page Rich Text Editor Canvas */}
      <main className="flex-1 overflow-hidden p-3 bg-slate-950/40">
        <div className="h-full w-full rounded-2xl border border-slate-800 bg-white overflow-hidden shadow-2xl">
          <RichTextBox
            value={content}
            onChange={handleContentChange}
            placeholder="Build, edit, or format full page content here..."
          />
        </div>
      </main>
    </div>
  );
}
