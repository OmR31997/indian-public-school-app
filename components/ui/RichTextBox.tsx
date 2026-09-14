"use client";

import React, { useRef, useState, useEffect } from "react";
import { CloudinaryGalleryModal } from "@/components/admin/CloudinaryGalleryModal";
import { ImageStudioModal, ImageStudioData } from "@/components/admin/ImageStudioModal";
import {
  normalizePdfUrl,
  getCloudinaryPdfThumbnailUrl,
  getCloudinaryInlineViewerUrl,
  isPdfFile,
  isCloudinaryUrl
} from "@/lib/file-preview";
import { Crop, Trash2, Sparkles as SparklesIcon, RefreshCw, Scissors } from "lucide-react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  RotateCcw,
  Eye,
  Pencil,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Undo,
  Redo,
  FileCode,
  Minus,
  Palette,
  Highlighter,
  Shapes,
  Table,
  LayoutGrid,
  ChevronDown,
  Sparkles,
  Square,
  Badge,
  LayoutTemplate,
  Sliders,
  Award,
  PhoneCall,
  MessageSquareQuote,
  FileSpreadsheet,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight,
  Plus,
  ExternalLink,
  Link2,
  Globe,
  ArrowRight,
  FileText,
  Phone,
  Mail,
  Check,
  X,
  MousePointerClick,
} from "lucide-react";

interface RichTextBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TEXT_COLORS = [
  { name: "Dark Slate", value: "#1e293b" },
  { name: "School Blue", value: "#1a5d9c" },
  { name: "Sky Blue", value: "#0284c7" },
  { name: "Emerald Green", value: "#059669" },
  { name: "Amber Gold", value: "#d97706" },
  { name: "Crimson Red", value: "#dc2626" },
  { name: "Royal Purple", value: "#7c3aed" },
  { name: "Muted Gray", value: "#64748b" },
];

const HIGHLIGHT_COLORS = [
  { name: "Clear / Transparent", value: "transparent" },
  { name: "Yellow Highlight", value: "#fef08a" },
  { name: "Green Highlight", value: "#bbf7d0" },
  { name: "Blue Highlight", value: "#bfdbfe" },
  { name: "Pink Highlight", value: "#fbcfe8" },
  { name: "Orange Highlight", value: "#fed7aa" },
  { name: "Light Gray", value: "#e2e8f0" },
];

export function generatePdfCardHtml(data: {
  url: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  theme?: "light" | "dark" | "banner" | "badge";
  maxHeight?: number;
}): string {
  const cleanUrl = normalizePdfUrl(data.url);
  const inlineUrl = getCloudinaryInlineViewerUrl(cleanUrl);
  const pdfPicUrl = getCloudinaryPdfThumbnailUrl(cleanUrl, 1, 1000);
  const title = data.title?.trim() || "Official PDF Document";
  const subtitle = data.subtitle?.trim() || "";
  const buttonText = data.buttonText?.trim() || "Open Document";
  const theme = data.theme || "light";
  const maxHeight = data.maxHeight || 420;

  if (theme === "badge") {
    return `<a href="${inlineUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #fee2e2; color: #dc2626; border: 1px solid #fecaca; font-weight: 700; padding: 0.55rem 1.25rem; border-radius: 9999px; font-size: 0.875rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; margin: 8px 0; box-shadow: 0 2px 6px rgba(220, 38, 38, 0.15);">📄 ${title} &rarr;</a><p><br></p>`;
  }

  if (theme === "banner") {
    return `<div style="margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 20px; background: #ffffff; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.06); flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 14px; min-width: 0;">
        <div style="width: 44px; height: 44px; border-radius: 12px; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: bold; flex-shrink: 0;">📄</div>
        <div style="min-width: 0;">
          <div style="font-weight: 700; color: #0f172a; font-size: 0.95rem; line-height: 1.3;">${title}</div>
          ${subtitle ? `<div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">${subtitle}</div>` : `<div style="font-size: 0.75rem; color: #dc2626; font-weight: 600; margin-top: 2px;">PDF Document &bull; Click to View / Download</div>`}
        </div>
      </div>
      <a href="${inlineUrl}" target="_blank" rel="noopener noreferrer" style="background: #1a5d9c; color: #ffffff; padding: 8px 18px; border-radius: 10px; font-size: 0.825rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(26, 93, 156, 0.25); white-space: nowrap;">${buttonText} &rarr;</a>
    </div><p><br></p>`;
  }

  if (theme === "dark") {
    return `<div style="margin: 20px 0; border: 1px solid #334155; border-radius: 20px; overflow: hidden; background: #0f172a; box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.3);">
      <div style="padding: 14px 20px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="background: #ef4444; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">📄 PDF Document</span>
          <span style="color: #f8fafc; font-weight: 700; font-size: 0.9rem;">${title}</span>
        </div>
        <a href="${inlineUrl}" target="_blank" rel="noopener noreferrer" style="background: #38bdf8; color: #0f172a; padding: 8px 18px; border-radius: 10px; font-size: 0.825rem; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(56, 189, 248, 0.3);">${buttonText} &rarr;</a>
      </div>
      ${subtitle ? `<div style="padding: 10px 20px; background: #020617; color: #94a3b8; font-size: 0.8rem; border-bottom: 1px solid #1e293b;">${subtitle}</div>` : ""}
      <div style="padding: 20px; text-align: center; background: #020617; display: flex; justify-content: center; align-items: center;">
        <img src="${pdfPicUrl}" alt="${title}" style="max-height: ${maxHeight}px; width: auto; max-width: 100%; border-radius: 8px; border: 1px solid #334155; box-shadow: 0 8px 24px -4px rgba(0,0,0,0.5); display: block; margin: 0 auto;" />
      </div>
    </div><p><br></p>`;
  }

  // Default: Light Card
  return `<div style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.08);">
    <div style="padding: 14px 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">📄 PDF Document</span>
        <span style="color: #0f172a; font-weight: 700; font-size: 0.9rem;">${title}</span>
      </div>
      <a href="${inlineUrl}" target="_blank" rel="noopener noreferrer" style="background: #1a5d9c; color: #ffffff; padding: 8px 18px; border-radius: 10px; font-size: 0.825rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(26, 93, 156, 0.25);">${buttonText} &rarr;</a>
    </div>
    ${subtitle ? `<div style="padding: 10px 20px; background: #ffffff; color: #64748b; font-size: 0.8rem; border-bottom: 1px solid #f1f5f9;">${subtitle}</div>` : ""}
    <div style="padding: 20px; text-align: center; background: #f1f5f9; display: flex; justify-content: center; align-items: center;">
      <img src="${pdfPicUrl}" alt="${title}" style="max-height: ${maxHeight}px; width: auto; max-width: 100%; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 8px 24px -4px rgba(0,0,0,0.12); display: block; margin: 0 auto;" />
    </div>
  </div><p><br></p>`;
}

export function RichTextBox({
  value,
  onChange,
  placeholder = "Write or build your dynamic page content here...",
}: RichTextBoxProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "preview" | "html">("visual");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbox, setShowToolbox] = useState(true);

  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Image & Component Selection States
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioInitialData, setStudioInitialData] = useState<ImageStudioData | string | null>(null);
  const [selectedImageEl, setSelectedImageEl] = useState<HTMLImageElement | null>(null);
  const [selectedBlockEl, setSelectedBlockEl] = useState<HTMLElement | null>(null);

  // PDF Studio Customizer States
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  const [pdfStudioUrl, setPdfStudioUrl] = useState("");
  const [pdfStudioTitle, setPdfStudioTitle] = useState("Official Document Preview");
  const [pdfStudioSubtitle, setPdfStudioSubtitle] = useState("Click to view or download the document");
  const [pdfStudioButtonText, setPdfStudioButtonText] = useState("Open Document");
  const [pdfStudioTheme, setPdfStudioTheme] = useState<"light" | "dark" | "banner" | "badge">("light");
  const [pdfStudioMaxHeight, setPdfStudioMaxHeight] = useState(420);

  const openPdfStudio = (url = "") => {
    if (url) {
      setPdfStudioUrl(url);
      const cleanName = url.split("/").pop()?.replace(/\.pdf$/i, "").replace(/[-_]/g, " ") || "Official Document";
      setPdfStudioTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
    setIsPdfStudioOpen(true);
  };

  // Link Creator / Hyperlink Modal States
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkTarget, setLinkTarget] = useState<"_blank" | "_self">("_self");
  const [linkStyle, setLinkStyle] = useState<"text" | "gold-button" | "navy-button" | "outline-button" | "pill-badge">("text");
  const [editingAnchorEl, setEditingAnchorEl] = useState<HTMLAnchorElement | null>(null);
  const [selectedAnchorEl, setSelectedAnchorEl] = useState<HTMLAnchorElement | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isInternalChangeRef = useRef(false);
  const valueOnTabSwitchRef = useRef(value);

  // Update valueOnTabSwitchRef when value changes externally while not editing
  useEffect(() => {
    if (!isInternalChangeRef.current) {
      valueOnTabSwitchRef.current = value;
    }
  }, [value]);

  // Initialize iframe document ONLY when switching tabs to "visual" mode
  useEffect(() => {
    if (activeTab !== "visual") return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const timer = setTimeout(() => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      doc.designMode = "on";

      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                font-size: 15px;
                line-height: 1.7;
                color: #1e293b;
                padding: 24px;
                margin: 0;
                min-height: 380px;
                outline: none;
              }
              body:empty:before, body[data-empty="true"]:before {
                content: attr(data-placeholder);
                color: #94a3b8;
                font-style: italic;
                position: absolute;
                pointer-events: none;
              }
              h1 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-top: 1.25rem; margin-bottom: 0.75rem; line-height: 1.2; }
              h2 { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin-top: 1.25rem; margin-bottom: 0.5rem; }
              h3 { font-size: 1.35rem; font-weight: 600; color: #334155; margin-top: 1rem; margin-bottom: 0.375rem; }
              p { margin-top: 0; margin-bottom: 1rem; }
              ul, ol { padding-left: 1.5rem; margin-top: 0; margin-bottom: 1rem; }
              li { margin-bottom: 0.35rem; }
              blockquote {
                border-left: 4px solid #1a5d9c;
                background: #f0f7ff;
                padding: 14px 20px;
                margin: 1.25rem 0;
                border-radius: 0 14px 14px 0;
                color: #1e3a8a;
                font-style: italic;
              }
              a { color: #1a5d9c; text-decoration: underline; font-weight: 600; cursor: pointer; }
              a.wysiwyg-selected-link { outline: 2px dashed #1a5d9c !important; outline-offset: 3px !important; background-color: rgba(26, 93, 156, 0.08) !important; border-radius: 4px; }
              img { max-width: 100%; height: auto; border-radius: 12px; margin: 12px 0; box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.1); cursor: pointer; transition: all 0.2s ease; }
              img.wysiwyg-selected-img { outline: 3px solid #2563eb !important; outline-offset: 3px !important; box-shadow: 0 0 20px rgba(37, 99, 235, 0.35) !important; }
              .wysiwyg-selected-block { outline: 2px dashed #1a5d9c !important; outline-offset: 4px !important; box-shadow: 0 0 0 4px rgba(26, 93, 156, 0.12) !important; border-radius: 8px; }
              hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5rem 0; }
              pre { background: #0f172a; color: #38bdf8; padding: 16px; border-radius: 14px; font-family: monospace; overflow-x: auto; }
              table { width: 100%; border-collapse: collapse; margin: 1rem 0; border: 1px solid #cbd5e1; }
              th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
              th { background-color: #f1f5f9; font-weight: 700; color: #0f172a; }
            </style>
          </head>
          <body>${valueOnTabSwitchRef.current || ""}</body>
        </html>
      `;

      doc.open();
      doc.write(htmlTemplate);
      doc.close();

      const checkEmpty = () => {
        const bodyHtml = doc.body.innerHTML;
        const isEmpty = !bodyHtml || bodyHtml === "<br>" || bodyHtml.trim() === "";
        doc.body.setAttribute("data-empty", String(isEmpty));
        doc.body.setAttribute("data-placeholder", placeholder);
      };

      checkEmpty();

      const syncContent = () => {
        checkEmpty();
        const currentBodyHtml = doc.body.innerHTML;
        isInternalChangeRef.current = true;
        onChange(currentBodyHtml === "<br>" ? "" : currentBodyHtml);
      };

      // Image, Link & Component selection listener inside iframe
      const handleDocClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        doc.querySelectorAll(".wysiwyg-selected-block").forEach((el) => el.classList.remove("wysiwyg-selected-block"));
        doc.querySelectorAll("img").forEach((img) => img.classList.remove("wysiwyg-selected-img"));
        doc.querySelectorAll("a").forEach((a) => a.classList.remove("wysiwyg-selected-link"));

        if (!target || target === doc.body || target === doc.documentElement) {
          setSelectedBlockEl(null);
          setSelectedImageEl(null);
          setSelectedAnchorEl(null);
          return;
        }

        const imgEl = (target && target.tagName === "IMG" ? target : target?.closest?.("img")) as HTMLImageElement | null;
        const anchorEl = (target && target.tagName === "A" ? target : target?.closest?.("a")) as HTMLAnchorElement | null;

        let blockContainer: HTMLElement | null = null;
        const closestComp = target.closest("section, div, blockquote, table, figure, h1, h2, h3, p, pre") as HTMLElement | null;
        if (closestComp && closestComp !== doc.body) {
          blockContainer = closestComp;
        }

        if (imgEl) {
          imgEl.classList.add("wysiwyg-selected-img");
          setSelectedImageEl(imgEl);
        } else {
          setSelectedImageEl(null);
        }

        if (anchorEl) {
          anchorEl.classList.add("wysiwyg-selected-link");
          setSelectedAnchorEl(anchorEl);
        } else {
          setSelectedAnchorEl(null);
        }

        if (blockContainer) {
          blockContainer.classList.add("wysiwyg-selected-block");
          setSelectedBlockEl(blockContainer);
        } else {
          setSelectedBlockEl(null);
        }
      };

      // Drag & Drop handlers inside iframe
      const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "copy";
        }
      };

      const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        const compId = e.dataTransfer?.getData("text/plain");
        if (!compId) return;

        if (compId === "pdfCard") {
          openPdfStudio();
          return;
        }
        if (compId === "hyperlink") {
          openLinkModal();
          return;
        }

        const snippet = getComponentHtmlSnippet(compId);
        if (snippet) {
          const target = e.target as HTMLElement;
          if (target && target !== doc.body && target !== doc.documentElement) {
            target.insertAdjacentHTML("afterend", snippet);
          } else {
            doc.body.insertAdjacentHTML("beforeend", snippet);
          }
          syncContent();
        }
      };

      doc.addEventListener("click", handleDocClick);
      doc.addEventListener("mousedown", handleDocClick);
      doc.addEventListener("dragover", handleDragOver);
      doc.addEventListener("drop", handleDrop);
      doc.addEventListener("input", syncContent);
      doc.addEventListener("keyup", syncContent);
      doc.addEventListener("blur", syncContent);
    }, 40);

    return () => clearTimeout(timer);
  }, [activeTab]);

  const openStudioForTargetImage = (img?: HTMLImageElement | null) => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    const target =
      img ||
      selectedImageEl ||
      (doc?.querySelector("img.wysiwyg-selected-img") as HTMLImageElement) ||
      (doc?.querySelector("img") as HTMLImageElement);

    if (target) {
      setSelectedImageEl(target);
      setStudioInitialData({
        src: target.src,
        alt: target.alt || "",
        title: target.title || "",
        width: target.naturalWidth || target.width,
        height: target.naturalHeight || target.height,
      });
    } else {
      setStudioInitialData(null);
    }
    setIsStudioOpen(true);
  };

  const openStudioForSelectedImage = () => {
    openStudioForTargetImage();
  };

  const applyQuickImageResize = (widthPercent: number) => {
    if (!selectedImageEl) return;
    selectedImageEl.style.width = widthPercent === 100 ? "100%" : `${widthPercent}%`;
    selectedImageEl.style.height = "auto";
    syncIframeToState();
  };

  const applyImageAlignment = (alignment: "left" | "center" | "right" | "full") => {
    if (!selectedImageEl) return;
    selectedImageEl.style.float = "none";
    selectedImageEl.style.display = "inline-block";
    selectedImageEl.style.margin = "12px 0";

    if (alignment === "left") {
      selectedImageEl.style.float = "left";
      selectedImageEl.style.margin = "0 1.5rem 1rem 0";
    } else if (alignment === "right") {
      selectedImageEl.style.float = "right";
      selectedImageEl.style.margin = "0 0 1rem 1.5rem";
    } else if (alignment === "full") {
      selectedImageEl.style.width = "100%";
      selectedImageEl.style.display = "block";
    } else {
      selectedImageEl.style.display = "block";
      selectedImageEl.style.margin = "1.5rem auto";
    }
    syncIframeToState();
  };

  const deleteSelectedImage = () => {
    if (!selectedImageEl) return;
    selectedImageEl.remove();
    setSelectedImageEl(null);
    syncIframeToState();
  };

  const syncIframeToState = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    const currentBodyHtml = doc.body.innerHTML;
    isInternalChangeRef.current = true;
    onChange(currentBodyHtml === "<br>" ? "" : currentBodyHtml);
  };

  const execCommand = (command: string, arg?: string) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    iframe.contentWindow?.focus();
    doc.execCommand(command, false, arg);
    const updatedHtml = doc.body.innerHTML;
    isInternalChangeRef.current = true;
    onChange(updatedHtml);
  };

  const insertHTML = (htmlSnippet: string) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    iframe.contentWindow?.focus();
    doc.execCommand("insertHTML", false, htmlSnippet);
    const updatedHtml = doc.body.innerHTML;
    isInternalChangeRef.current = true;
    onChange(updatedHtml);
  };

  const handleFormatBlock = (formatTag: string) => {
    execCommand("formatBlock", formatTag);
  };

  const openLinkModal = (targetAnchor?: HTMLAnchorElement | null) => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    const win = iframe?.contentWindow;

    let anchorEl: HTMLAnchorElement | null = targetAnchor || selectedAnchorEl;
    let selectedText = "";

    if (win && doc) {
      const selection = win.getSelection();
      if (selection && selection.rangeCount > 0) {
        const text = selection.toString().trim();
        if (text) selectedText = text;
        const container = selection.anchorNode?.parentElement;
        if (container) {
          const closestA = container.closest("a") as HTMLAnchorElement | null;
          if (closestA) anchorEl = closestA;
        }
      }
    }

    if (anchorEl) {
      setEditingAnchorEl(anchorEl);
      setLinkText(anchorEl.innerText || anchorEl.textContent || selectedText);
      setLinkUrl(anchorEl.getAttribute("href") || "");
      setLinkTarget(anchorEl.getAttribute("target") === "_blank" ? "_blank" : "_self");

      const styleStr = (anchorEl.getAttribute("style") || "").toLowerCase();
      if (styleStr.includes("#f4bd4f") || styleStr.includes("gold")) {
        setLinkStyle("gold-button");
      } else if (styleStr.includes("#102a4c") || styleStr.includes("navy")) {
        setLinkStyle("navy-button");
      } else if (styleStr.includes("border:") || styleStr.includes("border-2")) {
        setLinkStyle("outline-button");
      } else if (styleStr.includes("9999px")) {
        setLinkStyle("pill-badge");
      } else {
        setLinkStyle("text");
      }
    } else {
      setEditingAnchorEl(null);
      setLinkText(selectedText || "");
      setLinkUrl("https://");
      setLinkTarget("_self");
      setLinkStyle("text");
    }

    setIsLinkModalOpen(true);
  };

  const applyHyperlink = () => {
    let url = linkUrl.trim();
    if (!url) return;
    if (isPdfFile(url) && isCloudinaryUrl(url)) {
      url = getCloudinaryInlineViewerUrl(url);
    }

    const text = linkText.trim() || url;
    const targetAttr = linkTarget === "_blank" ? `target="_blank" rel="noopener noreferrer"` : "";

    let htmlSnippet = "";
    if (linkStyle === "gold-button") {
      htmlSnippet = `<a href="${url}" ${targetAttr} style="background-color: #f4bd4f; color: #102a4c; font-weight: 700; padding: 0.65rem 1.35rem; border-radius: 0.75rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin: 4px 2px;">${text} &rarr;</a>`;
    } else if (linkStyle === "navy-button") {
      htmlSnippet = `<a href="${url}" ${targetAttr} style="background-color: #102a4c; color: #ffffff; font-weight: 700; padding: 0.65rem 1.35rem; border-radius: 0.75rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 2px 5px rgba(16,42,76,0.2); margin: 4px 2px;">${text} &rarr;</a>`;
    } else if (linkStyle === "outline-button") {
      htmlSnippet = `<a href="${url}" ${targetAttr} style="border: 2px solid #1a5d9c; color: #1a5d9c; background-color: #ffffff; font-weight: 700; padding: 0.6rem 1.25rem; border-radius: 0.75rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; margin: 4px 2px;">${text} &rarr;</a>`;
    } else if (linkStyle === "pill-badge") {
      htmlSnippet = `<a href="${url}" ${targetAttr} style="background-color: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; font-weight: 700; padding: 0.35rem 0.9rem; border-radius: 9999px; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem; margin: 4px 2px;">🔗 ${text}</a>`;
    } else {
      htmlSnippet = `<a href="${url}" ${targetAttr} style="color: #1a5d9c; text-decoration: underline; font-weight: 600;">${text}</a>`;
    }

    if (editingAnchorEl) {
      editingAnchorEl.insertAdjacentHTML("beforebegin", htmlSnippet);
      editingAnchorEl.remove();
      setEditingAnchorEl(null);
      setSelectedAnchorEl(null);
      syncIframeToState();
    } else {
      insertHTML(htmlSnippet);
    }

    setIsLinkModalOpen(false);
  };

  const removeHyperlink = () => {
    if (editingAnchorEl) {
      const textNode = editingAnchorEl.innerText || editingAnchorEl.textContent || "";
      editingAnchorEl.insertAdjacentText("beforebegin", textNode);
      editingAnchorEl.remove();
      setEditingAnchorEl(null);
      setSelectedAnchorEl(null);
      syncIframeToState();
    } else if (selectedAnchorEl) {
      const textNode = selectedAnchorEl.innerText || selectedAnchorEl.textContent || "";
      selectedAnchorEl.insertAdjacentText("beforebegin", textNode);
      selectedAnchorEl.remove();
      setSelectedAnchorEl(null);
      syncIframeToState();
    }
    setIsLinkModalOpen(false);
  };

  const handleAddLink = () => {
    openLinkModal();
  };

  const handleAddImage = () => {
    setIsGalleryOpen(true);
  };

  const deleteSelectedBlock = () => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;

    const targetEl =
      selectedBlockEl ||
      selectedImageEl ||
      selectedAnchorEl ||
      (doc?.querySelector(".wysiwyg-selected-block") as HTMLElement) ||
      (doc?.querySelector("img.wysiwyg-selected-img") as HTMLElement) ||
      (doc?.querySelector("a.wysiwyg-selected-link") as HTMLElement);

    if (!targetEl) return;

    targetEl.remove();
    setSelectedBlockEl(null);
    setSelectedImageEl(null);
    setSelectedAnchorEl(null);

    if (doc) {
      doc.querySelectorAll(".wysiwyg-selected-block").forEach((el) => el.classList.remove("wysiwyg-selected-block"));
      doc.querySelectorAll("img").forEach((img) => img.classList.remove("wysiwyg-selected-img"));
      doc.querySelectorAll("a").forEach((a) => a.classList.remove("wysiwyg-selected-link"));
    }
    syncIframeToState();
  };

  const getComponentHtmlSnippet = (type: string): string => {
    switch (type) {
      case "ctaBanner":
        return `<section style="background: linear-gradient(135deg, #102a4c 0%, #1a5d9c 100%); color: #ffffff; padding: 2rem; border-radius: 1.25rem; margin-bottom: 2rem; box-shadow: 0 10px 20px -5px rgba(16,42,76,0.25);">
  <h3 style="font-size: 1.5rem; font-weight: 800; margin-top: 0; margin-bottom: 0.5rem; color: #ffffff;">Need Assistance or Have Questions?</h3>
  <p style="font-size: 1rem; color: #e2e8f0; margin-bottom: 1.25rem; line-height: 1.6;">Our admissions & administrative team is ready to guide you through every step of the process.</p>
  <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
    <a href="/contact" style="background-color: #f4bd4f; color: #102a4c; font-weight: 700; padding: 0.65rem 1.35rem; border-radius: 0.75rem; text-decoration: none; display: inline-block;">Contact Us Now &rarr;</a>
    <a href="/admission" style="background-color: rgba(255,255,255,0.15); color: #ffffff; font-weight: 700; padding: 0.65rem 1.35rem; border-radius: 0.75rem; text-decoration: none; display: inline-block;">Apply Online &rarr;</a>
  </div>
</section><p><br></p>`;
      case "quickLinksGrid":
        return `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
  <div style="border: 1px solid #e2e8f0; background-color: #f8fafc; padding: 1.25rem; border-radius: 1rem;">
    <h4 style="font-size: 1.1rem; font-weight: 700; color: #102a4c; margin: 0 0 0.5rem 0;">Admissions 2026–27</h4>
    <p style="font-size: 0.875rem; color: #64748b; margin: 0 0 1rem 0;">Online application process and eligibility criteria.</p>
    <a href="/admission" style="color: #1a5d9c; font-weight: 700; text-decoration: none; font-size: 0.9rem;">Go to Admissions &rarr;</a>
  </div>
  <div style="border: 1px solid #e2e8f0; background-color: #f8fafc; padding: 1.25rem; border-radius: 1rem;">
    <h4 style="font-size: 1.1rem; font-weight: 700; color: #102a4c; margin: 0 0 0.5rem 0;">Curriculum & Academics</h4>
    <p style="font-size: 0.875rem; color: #64748b; margin: 0 0 1rem 0;">CBSE syllabus, examination structure & faculty.</p>
    <a href="/academics" style="color: #1a5d9c; font-weight: 700; text-decoration: none; font-size: 0.9rem;">View Academics &rarr;</a>
  </div>
  <div style="border: 1px solid #e2e8f0; background-color: #f8fafc; padding: 1.25rem; border-radius: 1rem;">
    <h4 style="font-size: 1.1rem; font-weight: 700; color: #102a4c; margin: 0 0 0.5rem 0;">Mandatory Disclosure</h4>
    <p style="font-size: 0.875rem; color: #64748b; margin: 0 0 1rem 0;">Official CBSE affiliation certificates & NOCs.</p>
    <a href="/mandatory-public-disclosure" style="color: #1a5d9c; font-weight: 700; text-decoration: none; font-size: 0.9rem;">View Disclosures &rarr;</a>
  </div>
</div><p><br></p>`;
      case "hero":
        return `<section style="background-color: #102a4c; color: #ffffff; padding: 2.5rem; border-radius: 1.5rem; margin-bottom: 2rem; box-shadow: 0 10px 25px -5px rgba(16,42,76,0.3);">
  <span style="background-color: rgba(255,255,255,0.15); color: #ffd983; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block;">
    CBSE ADMISSIONS OPEN 2026–27
  </span>
  <h1 style="font-size: 2.5rem; font-weight: 800; margin-top: 1rem; margin-bottom: 0.75rem; line-height: 1.2; color: #ffffff;">
    Where Curiosity Meets Excellence
  </h1>
  <p style="font-size: 1.125rem; color: #e2e8f0; margin-bottom: 1.5rem; max-width: 42rem; line-height: 1.6;">
    Empowering young minds with knowledge, character, creativity and confidence for a global future.
  </p>
  <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
    <a href="/about" style="background-color: #f4bd4f; color: #102a4c; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; display: inline-block;">Explore Our School &rarr;</a>
    <a href="/admission" style="background-color: rgba(255,255,255,0.15); color: #ffffff; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; display: inline-block;">Apply for Admission &rarr;</a>
  </div>
  <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; font-size: 0.875rem; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 1rem;">
    <span>&#10003; CBSE Affiliated</span>
    <span>&#10003; Smart Classrooms</span>
    <span>&#10003; 100% Individual Care</span>
  </div>
</section><p><br></p>`;
      case "slider":
        return `<section style="position: relative; overflow: hidden; border-radius: 1.5rem; margin-bottom: 2rem; background-color: #0f172a;">
  <img src="https://res.cloudinary.com/niefrrkx/image/upload/v1789163175/indian-public-school/assets/Home/hero-campus.jpg" alt="Campus Banner" style="width: 100%; height: 360px; object-fit: cover; opacity: 0.85; display: block;" />
  <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 2rem; background: linear-gradient(transparent, rgba(15,23,42,0.95)); color: #ffffff;">
    <h2 style="font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem 0; color: #ffffff;">Modern Campus Infrastructure</h2>
    <p style="margin: 0; font-size: 1rem; color: #e2e8f0; max-width: 36rem;">State-of-the-art science labs, digital libraries, and world-class athletic facilities.</p>
  </div>
</section><p><br></p>`;
      case "features":
        return `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
  <div style="border: 1px solid #e2e8f0; background-color: #ffffff; padding: 1.5rem; border-radius: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="width: 48px; height: 48px; background-color: #eff6ff; color: #1a5d9c; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 1rem;">🎓</div>
    <h3 style="font-size: 1.25rem; font-weight: 700; color: #102a4c; margin: 0 0 0.5rem 0;">Academic Rigour</h3>
    <p style="font-size: 0.95rem; color: #64748b; line-height: 1.6; margin: 0;">Comprehensive CBSE curriculum designed for interactive learning, critical thinking, and competitive excellence.</p>
  </div>
  <div style="border: 1px solid #e2e8f0; background-color: #ffffff; padding: 1.5rem; border-radius: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="width: 48px; height: 48px; background-color: #f0fdf4; color: #166534; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 1rem;">🏆</div>
    <h3 style="font-size: 1.25rem; font-weight: 700; color: #102a4c; margin: 0 0 0.5rem 0;">Sports & Co-Curricular</h3>
    <p style="font-size: 0.95rem; color: #64748b; line-height: 1.6; margin: 0;">Nurturing physical stamina, sportsmanship, performing arts, and leadership skills in every student.</p>
  </div>
  <div style="border: 1px solid #e2e8f0; background-color: #ffffff; padding: 1.5rem; border-radius: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <div style="width: 48px; height: 48px; background-color: #fffbeb; color: #b45309; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 1rem;">🛡️</div>
    <h3 style="font-size: 1.25rem; font-weight: 700; color: #102a4c; margin: 0 0 0.5rem 0;">Safe & Inclusive Campus</h3>
    <p style="font-size: 0.95rem; color: #64748b; line-height: 1.6; margin: 0;">24/7 CCTV surveillance, GPS-enabled transport, and dedicated student counseling support.</p>
  </div>
</div><p><br></p>`;
      case "principal":
        return `<section style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 1.5rem; padding: 2rem; margin-bottom: 2rem; display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center;">
  <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80" alt="Principal Profile" style="width: 130px; height: 130px; border-radius: 1rem; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
  <div style="flex: 1; min-width: 240px;">
    <span style="color: #1a5d9c; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Principal's Welcome</span>
    <h3 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0.25rem 0 0.75rem 0;">Building Leaders of Tomorrow</h3>
    <p style="font-size: 0.95rem; color: #475569; line-height: 1.7; font-style: italic; margin: 0 0 1rem 0;">
      "Our promise is simple yet profound: to nurture every student's potential in a safe, inspiring environment where curiosity is celebrated every day."
    </p>
    <p style="font-weight: 700; color: #1e293b; margin: 0;">Dr. S. K. Sharma — <span style="font-weight: 400; color: #64748b;">Principal, Indian Public School</span></p>
  </div>
</section><p><br></p>`;
      case "stats":
        return `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; background-color: #102a4c; color: #ffffff; padding: 1.75rem; border-radius: 1.25rem; text-align: center;">
  <div>
    <div style="font-size: 2.25rem; font-weight: 900; color: #f4bd4f;">1500+</div>
    <div style="font-size: 0.85rem; font-weight: 600; color: #cbd5e1;">Active Students</div>
  </div>
  <div>
    <div style="font-size: 2.25rem; font-weight: 900; color: #f4bd4f;">85+</div>
    <div style="font-size: 0.85rem; font-weight: 600; color: #cbd5e1;">Expert Teachers</div>
  </div>
  <div>
    <div style="font-size: 2.25rem; font-weight: 900; color: #f4bd4f;">100%</div>
    <div style="font-size: 0.85rem; font-weight: 600; color: #cbd5e1;">CBSE Board Result</div>
  </div>
  <div>
    <div style="font-size: 2.25rem; font-weight: 900; color: #f4bd4f;">25+</div>
    <div style="font-size: 0.85rem; font-weight: 600; color: #cbd5e1;">Years Experience</div>
  </div>
</div><p><br></p>`;
      case "contact":
        return `<div style="border: 1px solid #e2e8f0; background-color: #ffffff; padding: 1.75rem; border-radius: 1.25rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <h3 style="font-size: 1.35rem; font-weight: 800; color: #102a4c; margin: 0 0 1rem 0;">Get In Touch With Us</h3>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; color: #334155; font-size: 0.95rem;">
    <div><strong>📍 Address:</strong> Main Highway Road, IPS Campus, Knowledge City</div>
    <div><strong>📞 Phone:</strong> +91 98765 43210 / 011-2345678</div>
    <div><strong>✉️ Email:</strong> info@indianpublicschool.edu.in</div>
    <div><strong>⏰ Office Hours:</strong> Mon - Sat (8:00 AM - 4:00 PM)</div>
  </div>
</div><p><br></p>`;
      case "testimonials":
        return `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 1.5rem; border-radius: 1.25rem;">
    <div style="color: #f59e0b; font-size: 1.1rem; margin-bottom: 0.5rem;">★★★★★</div>
    <p style="font-size: 0.95rem; color: #334155; line-height: 1.6; font-style: italic; margin: 0 0 1rem 0;">"The teachers at Indian Public School genuinely care about each child. My daughter has blossomed into a confident public speaker."</p>
    <div style="font-size: 0.875rem; font-weight: 700; color: #0f172a;">Ramesh Verma — <span style="font-weight: 400; color: #64748b;">Parent (Class V)</span></div>
  </div>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 1.5rem; border-radius: 1.25rem;">
    <div style="color: #f59e0b; font-size: 1.1rem; margin-bottom: 0.5rem;">★★★★★</div>
    <p style="font-size: 0.95rem; color: #334155; line-height: 1.6; font-style: italic; margin: 0 0 1rem 0;">"State of the art labs and incredible sports facilities. IPS prepared me for top engineering college entrance exams!"</p>
    <div style="font-size: 0.875rem; font-weight: 700; color: #0f172a;">Ananya Roy — <span style="font-weight: 400; color: #64748b;">Alumni Batch 2024</span></div>
  </div>
</div><p><br></p>`;
      case "disclosureTable":
        return `<div style="margin-bottom: 2rem; overflow-x: auto;">
  <h3 style="font-size: 1.25rem; font-weight: 800; color: #102a4c; margin: 0 0 0.75rem 0;">Mandatory Public Disclosure Documents</h3>
  <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 0.9rem;">
    <thead>
      <tr style="background-color: #102a4c; color: #ffffff;">
        <th style="padding: 10px 14px; text-align: left;">S.No</th>
        <th style="padding: 10px 14px; text-align: left;">Document / Information</th>
        <th style="padding: 10px 14px; text-align: center;">Download Link</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 10px 14px; font-weight: bold;">1</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px 14px;">CBSE Affiliation Grant Letter</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px 14px; text-align: center;"><a href="#" style="background: #1a5d9c; color: #fff; padding: 4px 10px; border-radius: 6px; text-decoration: none; font-size: 0.8rem; font-weight: bold;">PDF View</a></td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="border: 1px solid #cbd5e1; padding: 10px 14px; font-weight: bold;">2</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px 14px;">Society / Trust Registration Certificate</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px 14px; text-align: center;"><a href="#" style="background: #1a5d9c; color: #fff; padding: 4px 10px; border-radius: 6px; text-decoration: none; font-size: 0.8rem; font-weight: bold;">PDF View</a></td>
      </tr>
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 10px 14px; font-weight: bold;">3</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px 14px;">No Objection Certificate (NOC)</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px 14px; text-align: center;"><a href="#" style="background: #1a5d9c; color: #fff; padding: 4px 10px; border-radius: 6px; text-decoration: none; font-size: 0.8rem; font-weight: bold;">PDF View</a></td>
      </tr>
    </tbody>
  </table>
</div><p><br></p>`;
      case "info":
        return `<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 8px; margin: 16px 0; color: #1e40af;"><strong>ℹ️ Notice:</strong> Type your notice or announcement details here.</div><p><br></p>`;
      case "success":
        return `<div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 14px 18px; border-radius: 8px; margin: 16px 0; color: #166534;"><strong>✅ Highlight:</strong> Type your positive achievement or update here.</div><p><br></p>`;
      case "warning":
        return `<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 16px 0; color: #92400e;"><strong>⚠️ Alert:</strong> Type urgent notice or deadline alert here.</div><p><br></p>`;
      case "card":
        return `<div style="border: 1px solid #cbd5e1; background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 16px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);"><h3 style="margin-top:0; color:#0f172a;">Card Title</h3><p style="margin-bottom:0; color:#334155;">Type inside this rounded card container.</p></div><p><br></p>`;
      case "badge":
        return `<span style="background-color: #1a5d9c; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; display: inline-block; margin: 0 4px;">Pill Badge</span> `;
      case "grid":
        return `<div style="display: flex; flex-wrap: wrap; gap: 16px; margin: 16px 0;"><div style="flex: 1; min-width: 240px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px;"><h4 style="margin-top:0; color:#0f172a;">Column 1 Title</h4><p style="margin-bottom:0; color:#475569;">Column 1 details...</p></div><div style="flex: 1; min-width: 240px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px;"><h4 style="margin-top:0; color:#0f172a;">Column 2 Title</h4><p style="margin-bottom:0; color:#475569;">Column 2 details...</p></div></div><p><br></p>`;
      default:
        return "";
    }
  };

  // Visual Basic .NET Component Templates
  const insertComponent = (type: string) => {
    if (type === "hyperlink") {
      openLinkModal();
      return;
    }
    if (type === "pdfCard") {
      openPdfStudio();
      return;
    }
    const htmlSnippet = getComponentHtmlSnippet(type);
    if (htmlSnippet) {
      insertHTML(htmlSnippet);
    }
  };

  const toolboxComponents = [
    {
      id: "hyperlink",
      title: "Hyperlink & Action Button",
      subtitle: "Write text with link & button style",
      icon: LinkIcon,
      color: "bg-sky-600 text-white",
    },
    {
      id: "pdfCard",
      title: "PDF Document Card Embed",
      subtitle: "Customize layout & embed PDF document",
      icon: FileText,
      color: "bg-rose-600 text-white",
    },
    {
      id: "ctaBanner",
      title: "Call-to-Action Link Banner",
      subtitle: "Header, paragraph & redirect button",
      icon: MousePointerClick,
      color: "bg-blue-700 text-white",
    },
    {
      id: "quickLinksGrid",
      title: "Quick Redirect Links Grid",
      subtitle: "3 hyperlinked navigation cards",
      icon: ExternalLink,
      color: "bg-[#102a4c] text-white",
    },
    {
      id: "hero",
      title: "Hero Banner Section",
      subtitle: "Navy Header, Badge & Buttons",
      icon: LayoutTemplate,
      color: "bg-blue-600 text-white",
    },
    {
      id: "slider",
      title: "Image Banner Slider",
      subtitle: "Full Width Campus Image",
      icon: Sliders,
      color: "bg-indigo-600 text-white",
    },
    {
      id: "features",
      title: "3-Column Feature Cards",
      subtitle: "Academic, Sports & Safety",
      icon: Award,
      color: "bg-emerald-600 text-white",
    },
    {
      id: "principal",
      title: "Principal Note Card",
      subtitle: "Photo Frame & Quote Box",
      icon: UserCheck,
      color: "bg-amber-600 text-white",
    },
    {
      id: "stats",
      title: "School Stat Counters",
      subtitle: "4 Metric Stat Blocks",
      icon: Sparkles,
      color: "bg-violet-600 text-white",
    },
    {
      id: "contact",
      title: "Contact Info Box",
      subtitle: "Address, Phone & Hours",
      icon: PhoneCall,
      color: "bg-cyan-600 text-white",
    },
    {
      id: "testimonials",
      title: "Testimonial Reviews",
      subtitle: "Parent & Student Stars",
      icon: MessageSquareQuote,
      color: "bg-rose-600 text-white",
    },
    {
      id: "disclosureTable",
      title: "CBSE Disclosure Table",
      subtitle: "Document Download Grid",
      icon: FileSpreadsheet,
      iconColor: "text-blue-600",
      color: "bg-slate-700 text-white",
    },
    {
      id: "info",
      title: "Blue Notice Box",
      subtitle: "Information Callout",
      icon: Info,
      color: "bg-sky-500 text-white",
    },
    {
      id: "success",
      title: "Green Success Note",
      subtitle: "Positive Achievement Box",
      icon: CheckCircle2,
      color: "bg-green-600 text-white",
    },
    {
      id: "warning",
      title: "Amber Alert Box",
      subtitle: "Warning / Deadline Box",
      icon: AlertTriangle,
      color: "bg-amber-500 text-white",
    },
    {
      id: "grid",
      title: "2-Column Grid Layout",
      subtitle: "Side-by-side Columns",
      icon: LayoutGrid,
      color: "bg-purple-600 text-white",
    },
  ];

  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white transition-all shadow-xs overflow-hidden ${
        isFullscreen
          ? "fixed inset-3 z-50 flex flex-col shadow-2xl ring-1 ring-slate-900/20"
          : "relative"
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/90 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("visual")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "visual"
                ? "bg-white text-[#1a5d9c] shadow-2xs border border-slate-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Pencil size={13} /> Visual Content Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "preview"
                ? "bg-white text-[#1a5d9c] shadow-2xs border border-slate-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Eye size={13} /> Live Page Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("html")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "html"
                ? "bg-white text-[#1a5d9c] shadow-2xs border border-slate-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <FileCode size={13} /> HTML Code
          </button>
          <button
            type="button"
            onClick={() => openStudioForTargetImage()}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs hover:brightness-110 transition ml-2 cursor-pointer"
          >
            <Scissors size={13} />
            <span>✂️ Image Studio (Crop, Resize, Compress)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "visual" && (
            <button
              type="button"
              onClick={() => setShowToolbox(!showToolbox)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
                showToolbox
                  ? "border-blue-300 bg-blue-50 text-[#1a5d9c]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Layers size={13} />
              <span>{showToolbox ? "Hide VB Toolbox" : "🧰 Visual Components Toolbox"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs"
            title={isFullscreen ? "Exit Fullscreen Workspace" : "Expand Fullscreen Workspace"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      {activeTab === "visual" && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-slate-50/50 p-2.5 text-slate-700">
          {/* Text Style Selection */}
          <select
            onChange={(e) => handleFormatBlock(e.target.value)}
            defaultValue="<p>"
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-50 shadow-2xs cursor-pointer"
            title="Text Style"
          >
            <option value="<p>">Normal Paragraph</option>
            <option value="<h1>">Heading 1 (Main Title)</option>
            <option value="<h2>">Heading 2 (Section Title)</option>
            <option value="<h3>">Heading 3 (Sub Heading)</option>
            <option value="<blockquote>">Quote Block</option>
            <option value="<pre>">Monospace Code</option>
          </select>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* Text Formatting */}
          <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => execCommand("bold")}
              title="Bold"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("italic")}
              title="Italic"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("underline")}
              title="Underline"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <Underline size={15} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("strikeThrough")}
              title="Strikethrough"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <Strikethrough size={15} />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* Text Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setColorMenuOpen(!colorMenuOpen);
                setHighlightMenuOpen(false);
              }}
              title="Text Color"
              className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100 shadow-2xs"
            >
              <Palette size={15} className="text-blue-600" />
              <span>Color</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {colorMenuOpen && (
              <div className="absolute top-full left-0 z-30 mt-1.5 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Text Color
                </p>
                <div className="grid grid-cols-4 gap-1.5 p-1">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.name}
                      onClick={() => {
                        execCommand("foreColor", c.value);
                        setColorMenuOpen(false);
                      }}
                      className="h-7 w-7 rounded-lg border border-slate-200 transition hover:scale-110 shadow-2xs"
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  onChange={(e) => {
                    execCommand("foreColor", e.target.value);
                    setColorMenuOpen(false);
                  }}
                  className="mt-1.5 h-8 w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-1"
                  title="Custom Color Picker"
                />
              </div>
            )}
          </div>

          {/* Highlight Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setHighlightMenuOpen(!highlightMenuOpen);
                setColorMenuOpen(false);
              }}
              title="Background Highlight Color"
              className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100 shadow-2xs"
            >
              <Highlighter size={15} className="text-amber-500" />
              <span>Highlight</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {highlightMenuOpen && (
              <div className="absolute top-full left-0 z-30 mt-1.5 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Text Highlight Color
                </p>
                <div className="space-y-1 p-1">
                  {HIGHLIGHT_COLORS.map((hc) => (
                    <button
                      key={hc.value}
                      type="button"
                      onClick={() => {
                        execCommand("hiliteColor", hc.value);
                        setHighlightMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-slate-300"
                        style={{ backgroundColor: hc.value === "transparent" ? "#ffffff" : hc.value }}
                      />
                      <span>{hc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* Alignments */}
          <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => execCommand("justifyLeft")}
              title="Align Left"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <AlignLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("justifyCenter")}
              title="Align Center"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <AlignCenter size={15} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("justifyRight")}
              title="Align Right"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <AlignRight size={15} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("justifyFull")}
              title="Justify"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <AlignJustify size={15} />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* Lists */}
          <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => execCommand("insertUnorderedList")}
              title="Bullet List"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("insertOrderedList")}
              title="Numbered List"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <ListOrdered size={15} />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* Media Links & Quote */}
          <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleAddLink}
              title="Insert Link"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <LinkIcon size={15} />
            </button>
            <button
              type="button"
              onClick={handleAddImage}
              title="Insert Image from Gallery"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <ImageIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock("<blockquote>")}
              title="Quote Block"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <Quote size={15} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("insertHorizontalRule")}
              title="Divider Line"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <Minus size={15} />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-0.5" />

          {/* Undo / Redo */}
          <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => execCommand("undo")}
              title="Undo (Ctrl+Z)"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <Undo size={15} />
            </button>
            <button
              type="button"
              onClick={() => execCommand("redo")}
              title="Redo (Ctrl+Y)"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900"
            >
              <Redo size={15} />
            </button>
          </div>

          {/* Remove Selected Element Button in Top Toolbar */}
          {(selectedBlockEl || selectedImageEl || selectedAnchorEl) && (
            <button
              type="button"
              onClick={deleteSelectedBlock}
              title="Remove selected component or element from visual canvas"
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-600 px-3 py-1 text-xs font-extrabold text-white shadow-2xs hover:bg-red-700 transition cursor-pointer animate-in fade-in"
            >
              <Trash2 size={13} />
              <span>Remove Selected</span>
            </button>
          )}

          {/* Clear Format */}
          <button
            type="button"
            onClick={() => execCommand("removeFormat")}
            title="Clear Formatting"
            className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition flex items-center gap-1 shadow-2xs"
          >
            <RotateCcw size={13} />
            <span>Clear Format</span>
          </button>
        </div>
      )}

      {/* Main Content Workspace with Visual Basic Toolbox */}
      <div className={`flex flex-col md:flex-row overflow-hidden ${isFullscreen ? "flex-1" : ""}`}>
        {/* Left Side: Visual Basic Component Toolbox Panel */}
        {activeTab === "visual" && showToolbox && (
          <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 p-3 overflow-y-auto max-h-[480px] md:max-h-[640px] shrink-0 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1a5d9c] flex items-center gap-1.5">
                  <Layers size={14} /> Visual Component Toolbox
                </h4>
                <p className="text-[11px] font-medium text-slate-400">Click or Drag & Drop blocks into editor</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                VB Style
              </span>
            </div>

            {/* Selection Quick Action Banner in Toolbox */}
            {(selectedBlockEl || selectedImageEl || selectedAnchorEl) && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-2.5 flex items-center justify-between text-xs font-bold text-rose-900 shadow-2xs animate-in fade-in">
                <span className="truncate max-w-[130px] font-mono text-[11px]">
                  &lt;{(selectedBlockEl || selectedImageEl || selectedAnchorEl)?.tagName.toLowerCase()}&gt;
                </span>
                <button
                  type="button"
                  onClick={deleteSelectedBlock}
                  className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-rose-700 transition cursor-pointer shadow-2xs"
                >
                  <Trash2 size={12} />
                  <span>Remove</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              {toolboxComponents.map((comp) => {
                const IconComp = comp.icon;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", comp.id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => insertComponent(comp.id)}
                    title="Click to insert or Drag & Drop into editor canvas"
                    className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 text-left transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md cursor-grab active:cursor-grabbing"
                  >
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${comp.color} shadow-2xs group-hover:scale-105 transition-transform`}>
                      <IconComp size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-[#1a5d9c] truncate">
                          {comp.title}
                        </p>
                        <Plus size={13} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 truncate">
                        {comp.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Right Side: Document Canvas / Preview / Code View */}
        <div className={`flex-1 p-3 bg-white flex flex-col ${isFullscreen ? "overflow-hidden" : ""}`}>
          {activeTab === "visual" && (
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-blue-200 bg-blue-50/90 p-2.5 shadow-md animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-black text-blue-950">
                  <Scissors size={15} className="text-blue-600 animate-pulse" /> Image & Component Suite:
                </span>
                <span className="text-[11px] font-bold text-blue-700 max-w-[220px] truncate bg-white/80 px-2 py-0.5 rounded-md border border-blue-200">
                  {selectedBlockEl || selectedImageEl || selectedAnchorEl
                    ? `Selected: <${(selectedBlockEl || selectedImageEl || selectedAnchorEl)?.tagName.toLowerCase()}>`
                    : "Click or drag any component to edit/remove"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {(selectedBlockEl || selectedImageEl || selectedAnchorEl) && (
                  <button
                    type="button"
                    onClick={deleteSelectedBlock}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-red-700 transition cursor-pointer animate-in fade-in"
                    title="Remove selected component or element from visual canvas"
                  >
                    <Trash2 size={13} />
                    <span>🗑️ Remove Component</span>
                  </button>
                )}

                {/* Quick Resizes */}
                <span className="text-[10px] font-extrabold text-blue-800 uppercase">Size:</span>
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      const iframe = iframeRef.current;
                      const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
                      const targetImg = selectedImageEl || (doc?.querySelector("img.wysiwyg-selected-img") as HTMLImageElement) || (doc?.querySelector("img") as HTMLImageElement);
                      if (targetImg) {
                        targetImg.style.width = pct === 100 ? "100%" : `${pct}%`;
                        targetImg.style.height = "auto";
                        syncIframeToState();
                      } else {
                        alert("Please click an image in the editor first, or click 'Crop, Resize & Compress Studio' to process image.");
                      }
                    }}
                    className="rounded-lg border border-blue-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-blue-100 transition"
                  >
                    {pct}%
                  </button>
                ))}

                <div className="h-4 w-px bg-blue-200 mx-0.5" />

                {/* Alignment */}
                <span className="text-[10px] font-extrabold text-blue-800 uppercase">Align:</span>
                <button
                  type="button"
                  onClick={() => applyImageAlignment("left")}
                  title="Float Left Wrap"
                  className="rounded-lg border border-blue-200 bg-white p-1 text-slate-700 hover:bg-blue-100 transition"
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => applyImageAlignment("center")}
                  title="Center Block"
                  className="rounded-lg border border-blue-200 bg-white p-1 text-slate-700 hover:bg-blue-100 transition"
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => applyImageAlignment("right")}
                  title="Float Right Wrap"
                  className="rounded-lg border border-blue-200 bg-white p-1 text-slate-700 hover:bg-blue-100 transition"
                >
                  <AlignRight size={13} />
                </button>

                <div className="h-4 w-px bg-blue-200 mx-0.5" />

                {/* Gallery & Delete */}
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(true)}
                  title="Insert / Replace from Cloudinary Media Gallery"
                  className="flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition"
                >
                  <ImageIcon size={12} />
                  <span>Gallery</span>
                </button>
                {selectedImageEl && (
                  <button
                    type="button"
                    onClick={deleteSelectedImage}
                    title="Delete Image"
                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                {selectedAnchorEl && (
                  <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 px-2 py-1 rounded-xl">
                    <span className="text-[11px] font-extrabold text-sky-900 truncate max-w-[160px]" title={selectedAnchorEl.getAttribute("href") || ""}>
                      🔗 {selectedAnchorEl.getAttribute("href") || "Link"}
                    </span>
                    <button
                      type="button"
                      onClick={() => openLinkModal(selectedAnchorEl)}
                      className="rounded-lg bg-[#1a5d9c] px-2 py-0.5 text-[11px] font-bold text-white hover:bg-blue-700 transition"
                    >
                      Edit Link
                    </button>
                    <button
                      type="button"
                      onClick={removeHyperlink}
                      className="rounded-lg border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "visual" && (
            <iframe
              ref={iframeRef}
              title="Visual CMS Content Editor Workspace"
              className={`w-full border border-slate-100 outline-none bg-white rounded-2xl ${
                isFullscreen ? "flex-1 min-h-[70vh]" : "min-h-[460px]"
              }`}
            />
          )}

          {activeTab === "preview" && (
            <div
              className={`w-full p-6 text-slate-800 border border-slate-100 rounded-2xl bg-white leading-relaxed text-base ${
                isFullscreen ? "flex-1 overflow-y-auto" : "min-h-[460px]"
              }`}
              dangerouslySetInnerHTML={{
                __html:
                  value ||
                  '<div className="py-16 text-center text-slate-400 italic"><p>No page content entered yet. Switch to Visual Editor and click any block in the Visual Component Toolbox to build!</p></div>',
              }}
            />
          )}

          {activeTab === "html" && (
            <textarea
              value={value || ""}
              onChange={(e) => {
                isInternalChangeRef.current = true;
                onChange(e.target.value);
              }}
              placeholder="<div>Enter HTML content...</div>"
              rows={isFullscreen ? 28 : 18}
              className="w-full font-mono text-xs leading-relaxed bg-slate-900 text-emerald-400 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 flex-1"
            />
          )}
        </div>
      </div>

      <CloudinaryGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectImage={(url) => {
          if (isPdfStudioOpen) {
            setPdfStudioUrl(url);
            const rawFileName = url.split("/").pop() || "Official Document";
            const cleanName = rawFileName.replace(/\.(pdf|jpg|jpeg|png|webp)$/i, "").replace(/[-_]/g, " ");
            setPdfStudioTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
            setIsGalleryOpen(false);
          } else if (selectedImageEl) {
            selectedImageEl.src = isPdfFile(url) ? getCloudinaryPdfThumbnailUrl(url, 1, 1000) : url;
            setSelectedImageEl(null);
            syncIframeToState();
            setIsGalleryOpen(false);
          } else if (isPdfFile(url)) {
            openPdfStudio(url);
            setIsGalleryOpen(false);
          } else {
            insertHTML(`<img src="${url}" alt="Cloudinary Media" style="max-width: 100%; height: auto; border-radius: 12px; margin: 12px 0; box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.1);" /><p><br></p>`);
            setIsGalleryOpen(false);
          }
        }}
      />

      <ImageStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        initialData={studioInitialData}
        onApply={({ htmlSnippet, data }) => {
          if (selectedImageEl) {
            selectedImageEl.insertAdjacentHTML("beforebegin", htmlSnippet);
            selectedImageEl.remove();
            setSelectedImageEl(null);
            syncIframeToState();
          } else {
            insertHTML(htmlSnippet);
          }
        }}
      />

      {/* PDF Card Customizer Studio Modal */}
      {isPdfStudioOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4 backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-500/20 text-rose-400">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-white flex items-center gap-2">
                    📄 PDF Card Customizer Studio
                    <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                      Hand Customization
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Customize layout theme, document title, description & action buttons for your PDF embed
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPdfStudioOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 overflow-hidden">
              
              {/* Left Column: Hand Customization Controls (5 cols) */}
              <div className="lg:col-span-5 flex flex-col overflow-y-auto border-r border-slate-800 bg-slate-900/60 p-5 space-y-4 scrollbar-thin">
                
                {/* PDF File Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    PDF Document File URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pdfStudioUrl}
                      onChange={(e) => setPdfStudioUrl(e.target.value)}
                      placeholder="Paste PDF URL or select from gallery..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono text-slate-200 outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setIsGalleryOpen(true)}
                      className="shrink-0 flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                      title="Select PDF from Cloudinary Gallery"
                    >
                      <ImageIcon size={14} />
                      <span>Gallery</span>
                    </button>
                  </div>
                </div>

                {/* Theme Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Select Card Theme & Layout Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "light", name: "Modern Light Card", icon: "🌟", desc: "Clean white card with page preview" },
                      { id: "dark", name: "Dark Executive", icon: "🌙", desc: "Navy dark theme with glowing border" },
                      { id: "banner", name: "Compact Banner", icon: "📄", desc: "Single row horizontal download bar" },
                      { id: "badge", name: "Minimal Pill Badge", icon: "🏷️", desc: "Rounded pill action link badge" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setPdfStudioTheme(t.id as any)}
                        className={`flex flex-col text-left p-3 rounded-2xl border transition cursor-pointer ${
                          pdfStudioTheme === t.id
                            ? "border-rose-500 bg-rose-500/15 text-white shadow-md ring-1 ring-rose-500/50"
                            : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{t.icon}</span>
                          <span>{t.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 leading-tight">{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Document Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={pdfStudioTitle}
                    onChange={(e) => setPdfStudioTitle(e.target.value)}
                    placeholder="e.g. Admission Form Session 2026-27"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-100 outline-none focus:border-rose-500"
                  />
                </div>

                {/* Subtitle / Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Subtitle / Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={pdfStudioSubtitle}
                    onChange={(e) => setPdfStudioSubtitle(e.target.value)}
                    placeholder="e.g. Official application form for Grade Nursery to IX"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-300 outline-none focus:border-rose-500"
                  />
                </div>

                {/* Button Label */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Action Button Label
                  </label>
                  <input
                    type="text"
                    value={pdfStudioButtonText}
                    onChange={(e) => setPdfStudioButtonText(e.target.value)}
                    placeholder="e.g. Open Document"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-200 outline-none focus:border-rose-500"
                  />
                </div>

                {/* Max Height Slider (for Card modes) */}
                {pdfStudioTheme !== "badge" && pdfStudioTheme !== "banner" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Page Preview Height
                      </label>
                      <span className="text-xs font-mono font-bold text-rose-400">{pdfStudioMaxHeight}px</span>
                    </div>
                    <input
                      type="range"
                      min={250}
                      max={650}
                      step={25}
                      value={pdfStudioMaxHeight}
                      onChange={(e) => setPdfStudioMaxHeight(Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Right Column: Live Interactive Preview (7 cols) */}
              <div className="lg:col-span-7 flex flex-col overflow-hidden bg-slate-950 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Eye size={14} className="text-rose-400" /> Live Interactive Preview:
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">Theme: {pdfStudioTheme}</span>
                </div>

                {/* Live Card Renderer Box */}
                <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-5 scrollbar-thin">
                  {!pdfStudioUrl ? (
                    <div className="flex h-full flex-col items-center justify-center text-slate-500 gap-2 p-8">
                      <FileText size={48} className="text-slate-700" />
                      <p className="text-xs font-medium">Select a PDF file or paste URL to preview custom card</p>
                    </div>
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: generatePdfCardHtml({
                          url: pdfStudioUrl,
                          title: pdfStudioTitle,
                          subtitle: pdfStudioSubtitle,
                          buttonText: pdfStudioButtonText,
                          theme: pdfStudioTheme,
                          maxHeight: pdfStudioMaxHeight,
                        }),
                      }}
                    />
                  )}
                </div>

                {/* Apply Button */}
                <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPdfStudioOpen(false)}
                    className="rounded-xl border border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!pdfStudioUrl}
                    onClick={() => {
                      if (!pdfStudioUrl) return;
                      const htmlSnippet = generatePdfCardHtml({
                        url: pdfStudioUrl,
                        title: pdfStudioTitle,
                        subtitle: pdfStudioSubtitle,
                        buttonText: pdfStudioButtonText,
                        theme: pdfStudioTheme,
                        maxHeight: pdfStudioMaxHeight,
                      });
                      insertHTML(htmlSnippet);
                      setIsPdfStudioOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
                  >
                    <Check size={16} />
                    <span>Apply & Insert PDF Card</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Hyperlink Creation & Edit Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#102a4c] to-[#1a5d9c] px-6 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur-md text-amber-400">
                  <LinkIcon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingAnchorEl ? "Edit Hyperlink & Redirect Target" : "Create Hyperlink & Redirect Target"}
                  </h3>
                  <p className="text-xs text-blue-200 font-medium">Configure text, destination link & button presentation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="rounded-xl p-1.5 text-blue-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[75vh] overflow-y-auto p-6 space-y-4 text-slate-700">
              {/* Link Text Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Display Link Text <span className="text-slate-400 font-normal">(Anchor Text)</span>
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Click Here to Apply, Read Admissions Criteria..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#1a5d9c] focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              {/* Link URL Field & Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Redirect Destination URL <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-blue-600">Quick Page Presets 👇</span>
                </div>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="e.g. /admission, /about, https://example.com"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#1a5d9c] focus:bg-white focus:ring-2 focus:ring-blue-100 transition"
                />

                {/* Preset Buttons */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {[
                    { label: "🎓 Admission Form", url: "/admission" },
                    { label: "🏫 About IPS", url: "/about" },
                    { label: "📞 Contact Us", url: "/contact" },
                    { label: "📚 Academics", url: "/academics" },
                    { label: "📜 CBSE Disclosure", url: "/mandatory-public-disclosure" },
                    { label: "🖼️ Gallery", url: "/gallery" },
                    { label: "✉️ Email Contact", url: "mailto:info@indianpublicschool.edu.in" },
                    { label: "📱 Call Phone", url: "tel:+919876543210" },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        setLinkUrl(preset.url);
                        if (!linkText || linkText === "https://") {
                          setLinkText(preset.label.replace(/^[^\s]+\s*/, ""));
                        }
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-[#1a5d9c] transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link Target Toggle */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">Open in New Tab Window</p>
                  <p className="text-[11px] text-slate-500 font-medium">Adds target="_blank" rel="noopener noreferrer"</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkTarget(linkTarget === "_blank" ? "_self" : "_blank")}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    linkTarget === "_blank" ? "bg-[#1a5d9c]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      linkTarget === "_blank" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Link Presentation Style */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Link Presentation & Button Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: "text",
                      name: "Standard Text Link",
                      sub: "School blue text link with underline",
                    },
                    {
                      id: "gold-button",
                      name: "Gold CTA Button",
                      sub: "Amber gold background button with arrow",
                    },
                    {
                      id: "navy-button",
                      name: "Navy Action Button",
                      sub: "Navy blue background button with white text",
                    },
                    {
                      id: "outline-button",
                      name: "Outline Border Button",
                      sub: "Blue outlined button with arrow",
                    },
                    {
                      id: "pill-badge",
                      name: "Pill Link Badge",
                      sub: "Soft sky blue pill badge link",
                    },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setLinkStyle(st.id as any)}
                      className={`flex flex-col text-left p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        linkStyle === st.id
                          ? "border-[#1a5d9c] bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-0.5">
                        <span className="text-xs font-bold text-slate-800">{st.name}</span>
                        {linkStyle === st.id && <CheckCircle2 size={14} className="text-[#1a5d9c]" />}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{st.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Live Element Preview</p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-center min-h-[48px]">
                  {linkStyle === "gold-button" ? (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        backgroundColor: "#f4bd4f",
                        color: "#102a4c",
                        fontWeight: 700,
                        padding: "0.65rem 1.35rem",
                        borderRadius: "0.75rem",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      }}
                    >
                      {linkText || "Gold Button Text"} &rarr;
                    </a>
                  ) : linkStyle === "navy-button" ? (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        backgroundColor: "#102a4c",
                        color: "#ffffff",
                        fontWeight: 700,
                        padding: "0.65rem 1.35rem",
                        borderRadius: "0.75rem",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        boxShadow: "0 2px 5px rgba(16,42,76,0.2)",
                      }}
                    >
                      {linkText || "Navy Button Text"} &rarr;
                    </a>
                  ) : linkStyle === "outline-button" ? (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        border: "2px solid #1a5d9c",
                        color: "#1a5d9c",
                        backgroundColor: "#ffffff",
                        fontWeight: 700,
                        padding: "0.6rem 1.25rem",
                        borderRadius: "0.75rem",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {linkText || "Outline Button Text"} &rarr;
                    </a>
                  ) : linkStyle === "pill-badge" ? (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        backgroundColor: "#e0f2fe",
                        color: "#0369a1",
                        border: "1px solid #bae6fd",
                        fontWeight: 700,
                        padding: "0.35rem 0.9rem",
                        borderRadius: "9999px",
                        fontSize: "0.85rem",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      🔗 {linkText || "Pill Badge Text"}
                    </a>
                  ) : (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{ color: "#1a5d9c", textDecoration: "underline", fontWeight: 600 }}
                    >
                      {linkText || "Standard Text Hyperlink"}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between bg-slate-50 border-t border-slate-200 px-6 py-3.5">
              {(editingAnchorEl || selectedAnchorEl) ? (
                <button
                  type="button"
                  onClick={removeHyperlink}
                  className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Remove Link</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyHyperlink}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 transition cursor-pointer"
                >
                  <Check size={14} />
                  <span>{editingAnchorEl ? "Update Link" : "Insert Hyperlink"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
