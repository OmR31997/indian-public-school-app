"use client";

import React from "react";
import {
  CheckCircle2,
  LoaderCircle,
  AlertTriangle,
} from "lucide-react";

export type UploadStep = "preparing" | "uploading" | "processing" | "done" | "error";

export interface FileUploadStatus {
  isUploading: boolean;
  field?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  previewUrl?: string;
  progress: number; // 0 to 100
  step: UploadStep;
  errorMessage?: string;
  stageMessage?: string;
}

export function FileUploadProgressLoader({ status, onClose }: { status: FileUploadStatus; onClose?: () => void }) {
  if (!status.isUploading && status.step !== "done" && status.step !== "error") return null;

  const { fileName, fileSize, fileType, previewUrl, progress, step, errorMessage, stageMessage } = status;
  const isImage = fileType?.startsWith("image/");
  const isError = step === "error";
  const isDone = step === "done";

  // Simple, clean user-facing status message without behind-the-scenes technical details
  const displayMessage = stageMessage || (
    isError
      ? (errorMessage || "Upload failed. Please try again.")
      : isDone
      ? "Upload complete!"
      : step === "processing"
      ? "Processing…"
      : `Uploading… ${progress > 0 ? `${progress}%` : ""}`
  );

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        {/* Thumbnail or Upload Status Icon */}
        {previewUrl && isImage ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              isError
                ? "bg-red-50 text-red-600"
                : isDone
                ? "bg-emerald-50 text-emerald-600"
                : "bg-blue-50 text-[#1a5d9c]"
            }`}
          >
            {isError ? (
              <AlertTriangle className="h-5 w-5" />
            ) : isDone ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            )}
          </div>
        )}

        {/* File info, status, and clean progress bar */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-800 text-xs truncate">
              {fileName || "Uploading file…"}
            </span>
            {fileSize && (
              <span className="shrink-0 text-[10px] font-medium text-slate-400">
                {fileSize}
              </span>
            )}
          </div>

          <div className="mt-0.5 flex items-center justify-between gap-2 text-xs">
            <span
              className={`truncate text-[11px] font-medium ${
                isError
                  ? "text-red-600 font-semibold"
                  : isDone
                  ? "text-emerald-600 font-semibold"
                  : "text-slate-500"
              }`}
            >
              {displayMessage}
            </span>
            {!isError && (
              <span className="font-mono text-[11px] font-bold text-slate-600 shrink-0">
                {isDone ? "100%" : `${Math.max(0, Math.min(100, progress))}%`}
              </span>
            )}
          </div>

          {/* Simple Clean Progress Bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isError
                  ? "bg-red-500"
                  : isDone
                  ? "bg-emerald-500"
                  : "bg-[#1a5d9c]"
              }`}
              style={{ width: `${isDone ? 100 : Math.max(progress, 5)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
