"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { FileViewerModal } from "./FileViewerModal";
import { isPdfFile } from "@/lib/file-preview";

interface FileViewerContextType {
  openFileViewer: (url: string, title?: string, mode?: "picture" | "reader") => void;
  closeFileViewer: () => void;
}

const FileViewerContext = createContext<FileViewerContextType | null>(null);

export function FileViewerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<"picture" | "reader">("picture");

  const openFileViewer = useCallback((fileUrl: string, fileTitle?: string, initialMode?: "picture" | "reader") => {
    setUrl(fileUrl);
    setTitle(fileTitle);
    setMode(initialMode || (isPdfFile(fileUrl) ? "picture" : "picture"));
    setIsOpen(true);
  }, []);

  const closeFileViewer = useCallback(() => {
    setIsOpen(false);
    setUrl(null);
  }, []);

  return (
    <FileViewerContext.Provider value={{ openFileViewer, closeFileViewer }}>
      {children}
      <FileViewerModal
        isOpen={isOpen}
        onClose={closeFileViewer}
        url={url}
        title={title}
        initialMode={mode}
      />
    </FileViewerContext.Provider>
  );
}

export function useFileViewer() {
  const ctx = useContext(FileViewerContext);
  if (!ctx) {
    // Return a fallback that opens in window if provider is not present
    return {
      openFileViewer: (fileUrl: string) => {
        window.open(fileUrl, "_blank");
      },
      closeFileViewer: () => {}
    };
  }
  return ctx;
}
