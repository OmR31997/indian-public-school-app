"use client";

import React from "react";
import { GraduationCap, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  message?: string;
  variant?: "full" | "inline" | "skeleton";
  className?: string;
}

export function PageLoader({
  message = "Loading Indian Public School content...",
  variant = "full",
  className,
}: PageLoaderProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center justify-center gap-3 py-8 text-[#102a4c]", className)}>
        <div className="relative flex size-10 items-center justify-center rounded-full bg-[#102a4c] text-[#f4bd4f] shadow-md">
          <div className="absolute inset-0 rounded-full border-2 border-gold/40 border-t-gold animate-spin" />
          <GraduationCap className="size-5 text-[#f4bd4f]" />
        </div>
        <span className="text-xs font-semibold text-slate-700">{message}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-[65vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50/70",
        variant === "full" && "w-full flex-1",
        className
      )}
    >
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer glowing pulsing aura */}
        <div className="absolute size-24 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
        
        {/* Rotating golden accent ring */}
        <div className="absolute size-20 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-500 animate-spin" style={{ animationDuration: "1.2s" }} />
        
        {/* Counter-rotating inner ring */}
        <div className="absolute size-16 rounded-full border-2 border-transparent border-b-[#1a5d9c] border-l-[#102a4c] animate-spin" style={{ animationDuration: "1.8s", animationDirection: "reverse" }} />

        {/* Center School Badge Container */}
        <div className="relative z-10 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#102a4c] to-[#1a5d9c] text-white shadow-lg border border-amber-400/40">
          <GraduationCap className="size-6 text-[#f4bd4f] animate-bounce" style={{ animationDuration: "2s" }} />
        </div>
      </div>

      {/* School Name Tag */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#102a4c] shadow-xs mb-2">
        <Sparkles className="size-3 text-amber-500" />
        Indian Public School
      </div>

      <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
        {message}
      </h3>
      <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
        Preparing official school documents, schedules, and academic information...
      </p>

      {/* Progress Dots */}
      <div className="mt-4 flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-[#102a4c] animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="size-2 rounded-full bg-[#1a5d9c] animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="size-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

// Education Page Skeleton placeholder component
export function EducationPageSkeleton() {
  return (
    <div className="w-full flex-1 animate-pulse">
      {/* Banner Skeleton */}
      <div className="relative overflow-hidden bg-slate-900 py-12 text-white">
        <div className="container-page max-w-5xl space-y-4">
          <div className="h-7 w-48 rounded-full bg-slate-800" />
          <div className="h-10 w-3/4 max-w-md rounded-xl bg-slate-800" />
          <div className="h-4 w-1/2 rounded-lg bg-slate-800/60" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container-page py-12 max-w-5xl space-y-8">
        {/* Info Grid Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs">
              <div className="size-10 rounded-xl bg-slate-200" />
              <div className="h-5 w-1/2 rounded-lg bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-4/5 rounded bg-slate-100" />
            </div>
          ))}
        </div>

        {/* Main Content Body Skeleton */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 space-y-6 shadow-sm">
          <div className="h-8 w-1/3 rounded-xl bg-slate-200" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-11/12 rounded bg-slate-100" />
            <div className="h-4 w-4/5 rounded bg-slate-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="h-48 rounded-2xl bg-slate-100" />
            <div className="h-48 rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
