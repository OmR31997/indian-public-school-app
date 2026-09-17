"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Crop,
  Maximize2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Sparkles,
  Palette,
  Check,
  X,
  Lock,
  Unlock,
  Type,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize,
  Zap,
  Info,
} from "lucide-react";

export interface ImageStudioData {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  caption?: string;
  alignment?: "left" | "center" | "right" | "full";
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: "none" | "soft" | "medium" | "elevated" | "glow";
  linkUrl?: string;
}

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ImageStudioData | string | null;
  onApply: (resultHtmlOrData: {
    src: string;
    htmlSnippet: string;
    data: ImageStudioData;
  }) => void;
}

const ASPECT_RATIOS = [
  { label: "Freeform", value: 0 },
  { label: "1:1 Square", value: 1 },
  { label: "16:9 HD", value: 16 / 9 },
  { label: "4:3 Standard", value: 4 / 3 },
  { label: "3:2 Banner", value: 3 / 2 },
  { label: "9:16 Story", value: 9 / 16 },
];

export function ImageStudioModal({
  isOpen,
  onClose,
  initialData,
  onApply,
}: ImageStudioModalProps) {
  // Parsing initial data
  const rawSrc =
    typeof initialData === "string"
      ? initialData
      : initialData?.src || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80";

  const [activeTab, setActiveTab] = useState<
    "crop" | "resize" | "compress" | "filters" | "style" | "seo"
  >("crop");

  // Original image natural dimensions
  const [naturalSize, setNaturalSize] = useState({ width: 800, height: 600 });
  const [originalByteEstimate, setOriginalByteEstimate] = useState<number>(0);

  // Editing state
  const [currentSrc, setCurrentSrc] = useState<string>(rawSrc);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Crop State
  const [aspectRatio, setAspectRatio] = useState<number>(0);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 100, height: 100 }); // percentages (0-100)
  const [isDraggingCrop, setIsDraggingCrop] = useState<string | null>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // Resize State
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  // Compression State
  const [quality, setQuality] = useState<number>(85); // 10 to 100
  const [outputFormat, setOutputFormat] = useState<"webp" | "jpeg" | "png">("webp");
  const [compressedByteEstimate, setCompressedByteEstimate] = useState<number>(0);

  // Filters State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);

  // Style State
  const [borderRadius, setBorderRadius] = useState<number>(
    typeof initialData === "object" && initialData?.borderRadius !== undefined
      ? initialData.borderRadius
      : 12
  );
  const [borderWidth, setBorderWidth] = useState<number>(
    typeof initialData === "object" && initialData?.borderWidth !== undefined
      ? initialData.borderWidth
      : 0
  );
  const [borderColor, setBorderColor] = useState<string>(
    typeof initialData === "object" && initialData?.borderColor
      ? initialData.borderColor
      : "#cbd5e1"
  );
  const [shadowStyle, setShadowStyle] = useState<"none" | "soft" | "medium" | "elevated" | "glow">(
    typeof initialData === "object" && initialData?.shadow ? initialData.shadow : "soft"
  );

  // SEO & Layout State
  const [altText, setAltText] = useState<string>(
    typeof initialData === "object" && initialData?.alt ? initialData.alt : "Page visual asset"
  );
  const [titleText, setTitleText] = useState<string>(
    typeof initialData === "object" && initialData?.title ? initialData.title : ""
  );
  const [captionText, setCaptionText] = useState<string>(
    typeof initialData === "object" && initialData?.caption ? initialData.caption : ""
  );
  const [alignment, setAlignment] = useState<"left" | "center" | "right" | "full">(
    typeof initialData === "object" && initialData?.alignment ? initialData.alignment : "center"
  );
  const [linkUrl, setLinkUrl] = useState<string>(
    typeof initialData === "object" && initialData?.linkUrl ? initialData.linkUrl : ""
  );

  const hiddenImgRef = useRef<HTMLImageElement | null>(null);

  // Initialize and reset on open or src change
  useEffect(() => {
    if (!isOpen) return;

    const initialSrc =
      typeof initialData === "string"
        ? initialData
        : initialData?.src || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80";

    setCurrentSrc(initialSrc);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setGrayscale(0);
    setSepia(0);
    setCropRect({ x: 0, y: 0, width: 100, height: 100 });
    setAspectRatio(0);

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = initialSrc;
    img.onload = () => {
      if (!isMounted) return;
      setNaturalSize({ width: img.naturalWidth || 800, height: img.naturalHeight || 600 });
      setTargetWidth(img.naturalWidth || 800);
      setTargetHeight(img.naturalHeight || 600);
      hiddenImgRef.current = img;

      // Rough byte calculation
      const estBytes = Math.round(((img.naturalWidth || 800) * (img.naturalHeight || 600) * 3 * 0.4) / 1024);
      setOriginalByteEstimate(estBytes);
      updateCompressionEstimate(img.naturalWidth || 800, img.naturalHeight || 600, quality, outputFormat);
    };
    img.onerror = () => {
      if (!isMounted) return;
      const fallbackImg = new Image();
      fallbackImg.src = initialSrc;
      fallbackImg.onload = () => {
        if (!isMounted) return;
        setNaturalSize({ width: fallbackImg.naturalWidth || 800, height: fallbackImg.naturalHeight || 600 });
        setTargetWidth(fallbackImg.naturalWidth || 800);
        setTargetHeight(fallbackImg.naturalHeight || 600);
        hiddenImgRef.current = fallbackImg;
      };
    };

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialData]);

  // Update width/height proportionally if lock is enabled
  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspectRatio && naturalSize.width > 0) {
      const ratio = naturalSize.height / naturalSize.width;
      setTargetHeight(Math.round(w * ratio));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspectRatio && naturalSize.height > 0) {
      const ratio = naturalSize.width / naturalSize.height;
      setTargetWidth(Math.round(h * ratio));
    }
  };

  const handleQuickScale = (percent: number) => {
    const w = Math.round((naturalSize.width * percent) / 100);
    const h = Math.round((naturalSize.height * percent) / 100);
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const handlePresetWidth = (w: number) => {
    handleWidthChange(w);
  };

  // Compression size estimation
  const updateCompressionEstimate = (w: number, h: number, q: number, fmt: string) => {
    let multiplier = 0.35;
    if (fmt === "webp") multiplier = 0.18;
    if (fmt === "png") multiplier = 0.65;
    const sizeKb = Math.round(((w * h * (q / 100) * multiplier) / 1024) * 10) / 10;
    setCompressedByteEstimate(Math.max(12, sizeKb));
  };

  useEffect(() => {
    updateCompressionEstimate(targetWidth, targetHeight, quality, outputFormat);
  }, [targetWidth, targetHeight, quality, outputFormat]);

  // Crop Ratio constraint helper
  useEffect(() => {
    if (aspectRatio > 0) {
      // Calculate current crop width/height matching ratio
      const containerRatio = naturalSize.width / naturalSize.height;
      const targetRatio = aspectRatio / containerRatio;
      let newW = 80;
      let newH = 80;
      if (targetRatio >= 1) {
        newW = 90;
        newH = Math.min(90, Math.round(90 / targetRatio));
      } else {
        newH = 90;
        newW = Math.min(90, Math.round(90 * targetRatio));
      }
      setCropRect({
        x: Math.round((100 - newW) / 2),
        y: Math.round((100 - newH) / 2),
        width: newW,
        height: newH,
      });
    }
  }, [aspectRatio, naturalSize]);

  // Handle Crop Dragging via Window-level listeners
  const handleCropMouseDown = (handle: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingCrop(handle);
  };

  useEffect(() => {
    if (!isDraggingCrop) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const targetImgEl = document.getElementById("studio-target-img") || cropContainerRef.current;
      if (!targetImgEl) return;
      const rect = targetImgEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const mouseX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100;
      const mouseY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)) * 100;

      setCropRect((prev) => {
        let { x, y, width, height } = prev;
        if (isDraggingCrop === "move") {
          x = Math.max(0, Math.min(100 - width, mouseX - width / 2));
          y = Math.max(0, Math.min(100 - height, mouseY - height / 2));
        } else if (isDraggingCrop === "se") {
          width = Math.max(5, Math.min(100 - x, mouseX - x));
          height = Math.max(5, Math.min(100 - y, mouseY - y));
        } else if (isDraggingCrop === "nw") {
          const newX = Math.max(0, Math.min(x + width - 5, mouseX));
          const newY = Math.max(0, Math.min(y + height - 5, mouseY));
          width += x - newX;
          height += y - newY;
          x = newX;
          y = newY;
        } else if (isDraggingCrop === "ne") {
          const newY = Math.max(0, Math.min(y + height - 5, mouseY));
          width = Math.max(5, Math.min(100 - x, mouseX - x));
          height += y - newY;
          y = newY;
        } else if (isDraggingCrop === "sw") {
          const newX = Math.max(0, Math.min(x + width - 5, mouseX));
          width += x - newX;
          height = Math.max(5, Math.min(100 - y, mouseY - y));
          x = newX;
        } else if (isDraggingCrop === "n") {
          const newY = Math.max(0, Math.min(y + height - 5, mouseY));
          height += y - newY;
          y = newY;
        } else if (isDraggingCrop === "s") {
          height = Math.max(5, Math.min(100 - y, mouseY - y));
        } else if (isDraggingCrop === "w") {
          const newX = Math.max(0, Math.min(x + width - 5, mouseX));
          width += x - newX;
          x = newX;
        } else if (isDraggingCrop === "e") {
          width = Math.max(5, Math.min(100 - x, mouseX - x));
        }
        return { x, y, width, height };
      });
    };

    const handleGlobalMouseUp = () => {
      setIsDraggingCrop(null);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDraggingCrop]);

  // Commit crop selection onto working canvas
  const commitCrop = () => {
    const targetImg = hiddenImgRef.current || (document.getElementById("studio-target-img") as HTMLImageElement);
    if (!targetImg) return;

    const currentW = targetImg.naturalWidth || targetImg.width || naturalSize.width || 800;
    const currentH = targetImg.naturalHeight || targetImg.height || naturalSize.height || 600;

    const cropX = Math.round((cropRect.x / 100) * currentW);
    const cropY = Math.round((cropRect.y / 100) * currentH);
    const cropW = Math.max(10, Math.round((cropRect.width / 100) * currentW));
    const cropH = Math.max(10, Math.round((cropRect.height / 100) * currentH));

    try {
      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(targetImg, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      const croppedDataUrl = canvas.toDataURL("image/png");

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = croppedDataUrl;
      img.onload = () => {
        hiddenImgRef.current = img;
        setCurrentSrc(croppedDataUrl);
        setNaturalSize({ width: cropW, height: cropH });
        setTargetWidth(cropW);
        setTargetHeight(cropH);
        setCropRect({ x: 0, y: 0, width: 100, height: 100 });
        setAspectRatio(0);
      };
    } catch (err) {
      console.warn("Canvas crop fallback:", err);
    }
  };

  // Generate Processed Canvas and Output
  const processAndExport = (): {
    src: string;
    htmlSnippet: string;
    data: ImageStudioData;
  } => {
    const targetImg = hiddenImgRef.current || (document.getElementById("studio-target-img") as HTMLImageElement);
    const currentW = targetImg?.naturalWidth || targetImg?.width || naturalSize.width || 800;
    const currentH = targetImg?.naturalHeight || targetImg?.height || naturalSize.height || 600;

    const cropX = Math.round((cropRect.x / 100) * currentW);
    const cropY = Math.round((cropRect.y / 100) * currentH);
    const cropW = Math.max(10, Math.round((cropRect.width / 100) * currentW));
    const cropH = Math.max(10, Math.round((cropRect.height / 100) * currentH));

    let finalW = cropW;
    let finalH = cropH;
    if (targetWidth !== naturalSize.width && targetWidth > 0) {
      finalW = targetWidth;
      finalH = targetHeight;
    }

    const canvas = document.createElement("canvas");
    canvas.width = finalW;
    canvas.height = finalH;
    const ctx = canvas.getContext("2d");

    let dataUrl = currentSrc;

    if (ctx && targetImg) {
      try {
        ctx.save();
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`;
        ctx.translate(finalW / 2, finalH / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        ctx.drawImage(
          targetImg,
          cropX,
          cropY,
          cropW,
          cropH,
          -finalW / 2,
          -finalH / 2,
          finalW,
          finalH
        );

        ctx.restore();
        const mimeType = outputFormat === "png" ? "image/png" : outputFormat === "jpeg" ? "image/jpeg" : "image/webp";
        dataUrl = canvas.toDataURL(mimeType, quality / 100);
      } catch (err) {
        console.warn("Canvas export fallback:", err);
      }
    }

    // Box shadow style strings
    let shadowCss = "none";
    if (shadowStyle === "soft") shadowCss = "0 4px 12px -2px rgba(0, 0, 0, 0.08)";
    if (shadowStyle === "medium") shadowCss = "0 10px 25px -5px rgba(0, 0, 0, 0.15)";
    if (shadowStyle === "elevated") shadowCss = "0 20px 35px -8px rgba(0, 0, 0, 0.25)";
    if (shadowStyle === "glow") shadowCss = "0 0 20px 2px rgba(26, 93, 156, 0.35)";

    // Alignment wrapper style strings
    let alignContainerStyle = "";
    let imgStyle = `max-width: 100%; height: auto; border-radius: ${borderRadius}px; box-shadow: ${shadowCss};`;
    if (borderWidth > 0) {
      imgStyle += ` border: ${borderWidth}px solid ${borderColor};`;
    }

    if (alignment === "left") {
      imgStyle += ` float: left; margin: 0 1.5rem 1rem 0;`;
    } else if (alignment === "right") {
      imgStyle += ` float: right; margin: 0 0 1rem 1.5rem;`;
    } else if (alignment === "full") {
      imgStyle += ` width: 100%; display: block; margin: 1.5rem 0;`;
    } else {
      // center
      alignContainerStyle = "text-align: center; margin: 1.5rem 0;";
      imgStyle += ` display: inline-block;`;
    }

    let imgTag = `<img src="${dataUrl}" alt="${altText}" title="${titleText}" style="${imgStyle}" />`;

    if (linkUrl) {
      imgTag = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${imgTag}</a>`;
    }

    let htmlSnippet = imgTag;

    if (captionText) {
      htmlSnippet = `<figure style="${alignContainerStyle || "margin: 1.5rem 0; text-align: center;"}">
  ${imgTag}
  <figcaption style="font-size: 0.85rem; color: #64748b; margin-top: 0.5rem; font-style: italic;">${captionText}</figcaption>
</figure>`;
    } else if (alignContainerStyle) {
      htmlSnippet = `<div style="${alignContainerStyle}">${imgTag}</div>`;
    }

    htmlSnippet += `<p><br></p>`;

    return {
      src: dataUrl,
      htmlSnippet,
      data: {
        src: dataUrl,
        width: finalW,
        height: finalH,
        alt: altText,
        title: titleText,
        caption: captionText,
        alignment,
        borderRadius,
        borderWidth,
        borderColor,
        shadow: shadowStyle,
        linkUrl,
      },
    };
  };

  const handleApply = () => {
    const result = processAndExport();
    onApply(result);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <Sparkles size={20} className="text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Image Studio Pro
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-400/30">
                  Crop • Resize • Compress
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Professional image editing & optimization suite for page content
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="flex flex-1 overflow-hidden bg-slate-950">
          {/* Left / Main Preview Canvas */}
          <div className="relative flex flex-1 flex-col items-center justify-center p-6 bg-radial from-slate-900 to-slate-950 overflow-hidden">
            {/* Top Transform Quick Toolbar */}
            <div className="absolute top-4 left-6 right-6 z-20 flex items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span>Original: {naturalSize.width} × {naturalSize.height} px</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold">
                  Output: {targetWidth} × {targetHeight} px (~{compressedByteEstimate} KB)
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90) % 360)}
                  title="Rotate Left 90°"
                  className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-blue-600 hover:text-white transition"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Rotate Right 90°"
                  className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-blue-600 hover:text-white transition"
                >
                  <RotateCw size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH(!flipH)}
                  title="Flip Horizontal"
                  className={`rounded-xl border p-2 transition ${
                    flipH
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <FlipHorizontal size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV(!flipV)}
                  title="Flip Vertical"
                  className={`rounded-xl border p-2 transition ${
                    flipV
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <FlipVertical size={15} />
                </button>
              </div>
            </div>

            {/* Interactive Image Container */}
            <div
              ref={cropContainerRef}
              className="relative max-h-[68vh] max-w-[90%] overflow-hidden rounded-2xl border border-slate-800 bg-black/40 shadow-2xl flex items-center justify-center p-2"
            >
              <img
                id="studio-target-img"
                src={currentSrc}
                alt="Studio Target"
                style={{
                  transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${
                    flipV ? -1 : 1
                  })`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%) sepia(${sepia}%)`,
                  maxHeight: "56vh",
                  objectFit: "contain",
                }}
                className="pointer-events-none rounded-lg transition-all duration-150"
              />

              {/* Crop Handle Overlay */}
              {activeTab === "crop" && (
                <div
                  style={{
                    left: `${cropRect.x}%`,
                    top: `${cropRect.y}%`,
                    width: `${cropRect.width}%`,
                    height: `${cropRect.height}%`,
                  }}
                  className="absolute z-10 rounded-lg border-2 border-dashed border-blue-400 bg-blue-500/15 shadow-2xl cursor-move"
                  onMouseDown={(e) => handleCropMouseDown("move", e)}
                >
                  {/* Rule of thirds grid lines */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                    <div className="border-r border-b border-white/60"></div>
                    <div className="border-r border-b border-white/60"></div>
                    <div className="border-b border-white/60"></div>
                    <div className="border-r border-b border-white/60"></div>
                    <div className="border-r border-b border-white/60"></div>
                    <div className="border-b border-white/60"></div>
                    <div className="border-r border-white/60"></div>
                    <div className="border-r border-white/60"></div>
                    <div></div>
                  </div>

                  {/* 8-Directional Custom Drag Handles */}
                  {/* Top Left */}
                  <div
                    onMouseDown={(e) => handleCropMouseDown("nw", e)}
                    className="absolute -top-2.5 -left-2.5 h-5 w-5 cursor-nwse-resize rounded-full bg-blue-500 border-2 border-white shadow-lg hover:scale-125 transition"
                    title="Drag Top-Left"
                  />
                  {/* Top Center */}
                  <div
                    onMouseDown={(e) => handleCropMouseDown("n", e)}
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-5 cursor-ns-resize rounded-full bg-blue-500 border-2 border-white shadow-lg hover:scale-125 transition"
                    title="Drag Top"
                  />
                  {/* Top Right */}
                  <div
                    onMouseDown={(e) => handleCropMouseDown("ne", e)}
                    className="absolute -top-2.5 -right-2.5 h-5 w-5 cursor-nesw-resize rounded-full bg-blue-500 border-2 border-white shadow-lg hover:scale-125 transition"
                    title="Drag Top-Right"
                  />
                  {/* Middle Left */}
                  <div
                    onMouseDown={(e) => handleCropMouseDown("w", e)}
                    className="absolute top-1/2 -left-2.5 -translate-y-1/2 h-5 w-5 cursor-ew-resize rounded-full bg-blue-500 border-2 border-white shadow-lg hover:scale-125 transition"
                    title="Drag Left"
                  />
                  {/* Middle Right */}
                  <div
                    onMouseDown={(e) => handleCropMouseDown("e", e)}
                    className="absolute top-1/2 -right-2.5 -translate-y-1/2 h-5 w-5 cursor-ew-resize rounded-full bg-blue-500 border-2 border-white shadow-lg hover:scale-125 transition"
                    title="Drag Right"
                  />
                  {/* Bottom Left */}
                  <div
                    onMouseDown={(e) => handleCropMouseDown("sw", e)}
                    className="absolute -bottom-2.5 -left-2.5 h-5 w-5 cursor-nesw-resize rounded-full bg-blue-500 border-2 border-white shadow-md hover:scale-125 transition"
                    title="Drag Bottom-Left"
                  />
                  {/* Bottom Center */}
                  <div
                    onMouseDown={(e) => handleCropMouseDown("s", e)}
                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-5 w-5 cursor-ns-resize rounded-full bg-blue-500 border-2 border-white shadow-md hover:scale-125 transition"
                    title="Drag Bottom"
                  />
                  {/* Bottom Right */}
                  <div
                    onMouseDown={(e) => handleCropMouseDown("se", e)}
                    className="absolute -bottom-2.5 -right-2.5 h-5 w-5 cursor-nwse-resize rounded-full bg-blue-500 border-2 border-white shadow-md hover:scale-125 transition"
                    title="Drag Bottom-Right"
                  />
                </div>
              )}
            </div>

            {/* Bottom Status Indicator */}
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Aspect Ratio: {aspectRatio === 0 ? "Freeform" : ASPECT_RATIOS.find((r) => r.value === aspectRatio)?.label}</span>
              <span>Crop Area: {Math.round(cropRect.width)}% × {Math.round(cropRect.height)}%</span>
            </div>
          </div>

          {/* Right Controls Sidebar */}
          <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col shrink-0">
            {/* Tool Category Tabs */}
            <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("crop")}
                title="Crop Tool"
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold transition cursor-pointer ${
                  activeTab === "crop"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Crop size={15} />
                <span>Crop</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("resize")}
                title="Resize Tool"
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold transition cursor-pointer ${
                  activeTab === "resize"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Maximize2 size={15} />
                <span>Resize</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("compress")}
                title="Compress & Format"
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold transition cursor-pointer ${
                  activeTab === "compress"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Zap size={15} />
                <span>Optimize</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("filters")}
                title="Color Filters"
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold transition cursor-pointer ${
                  activeTab === "filters"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Sliders size={15} />
                <span>Filter</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("style")}
                title="Frame & Border Styles"
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold transition cursor-pointer ${
                  activeTab === "style"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Palette size={15} />
                <span>Frame</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("seo")}
                title="SEO & Alt Text"
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-bold transition cursor-pointer ${
                  activeTab === "seo"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Type size={15} />
                <span>SEO</span>
              </button>
            </div>

            {/* Tab Controls Panel Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-200">
              {/* CROP TAB */}
              {activeTab === "crop" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Aspect Ratio Presets
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ASPECT_RATIOS.map((ar) => (
                        <button
                          key={ar.label}
                          type="button"
                          onClick={() => setAspectRatio(ar.value)}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold text-left transition cursor-pointer ${
                            aspectRatio === ar.value
                              ? "border-blue-500 bg-blue-600/20 text-blue-300 font-bold"
                              : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          {ar.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Crop Coordinates Inputs */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Custom Crop Region Box
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                          Left X ({Math.round((cropRect.x / 100) * naturalSize.width)}px)
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="95"
                          value={Math.round(cropRect.x)}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(95, parseInt(e.target.value) || 0));
                            setCropRect((prev) => ({ ...prev, x: val }));
                          }}
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                          Top Y ({Math.round((cropRect.y / 100) * naturalSize.height)}px)
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="95"
                          value={Math.round(cropRect.y)}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(95, parseInt(e.target.value) || 0));
                            setCropRect((prev) => ({ ...prev, y: val }));
                          }}
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                          Width ({Math.round((cropRect.width / 100) * naturalSize.width)}px)
                        </span>
                        <input
                          type="number"
                          min="5"
                          max="100"
                          value={Math.round(cropRect.width)}
                          onChange={(e) => {
                            const val = Math.max(5, Math.min(100 - cropRect.x, parseInt(e.target.value) || 10));
                            setCropRect((prev) => ({ ...prev, width: val }));
                          }}
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                          Height ({Math.round((cropRect.height / 100) * naturalSize.height)}px)
                        </span>
                        <input
                          type="number"
                          min="5"
                          max="100"
                          value={Math.round(cropRect.height)}
                          onChange={(e) => {
                            const val = Math.max(5, Math.min(100 - cropRect.y, parseInt(e.target.value) || 10));
                            setCropRect((prev) => ({ ...prev, height: val }));
                          }}
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                    <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Info size={14} className="text-blue-400" /> Interactive Custom Drag
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Drag any of the 8 blue handles around the image box to stretch, shrink, or custom crop any portion of the image.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={commitCrop}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition cursor-pointer"
                      >
                        <Crop size={14} />
                        <span>Apply Crop Selection Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCropRect({ x: 0, y: 0, width: 100, height: 100 });
                          setAspectRatio(0);
                        }}
                        className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* RESIZE TAB */}
              {activeTab === "resize" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Custom Dimensions (px)
                      </label>
                      <button
                        type="button"
                        onClick={() => setLockAspectRatio(!lockAspectRatio)}
                        className={`flex items-center gap-1 text-[11px] font-bold transition ${
                          lockAspectRatio ? "text-blue-400" : "text-slate-500"
                        }`}
                      >
                        {lockAspectRatio ? <Lock size={12} /> : <Unlock size={12} />}
                        <span>{lockAspectRatio ? "Locked Ratio" : "Unlocked"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                          Width (px)
                        </span>
                        <input
                          type="number"
                          value={targetWidth}
                          onChange={(e) => handleWidthChange(parseInt(e.target.value) || 100)}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                          Height (px)
                        </span>
                        <input
                          type="number"
                          value={targetHeight}
                          onChange={(e) => handleHeightChange(parseInt(e.target.value) || 100)}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Quick Percentage Scale
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleQuickScale(pct)}
                          className="rounded-xl border border-slate-800 bg-slate-950 py-2 text-xs font-bold text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Standard Max Width Presets
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[300, 600, 800, 1200].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => handlePresetWidth(w)}
                          className="rounded-xl border border-slate-800 bg-slate-950 py-2 text-xs font-bold text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition"
                        >
                          {w}px Width
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* OPTIMIZE & COMPRESS TAB */}
              {activeTab === "compress" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Output Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["webp", "jpeg", "png"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setOutputFormat(fmt)}
                          className={`rounded-xl border py-2 text-xs font-bold uppercase transition cursor-pointer ${
                            outputFormat === fmt
                              ? "border-emerald-500 bg-emerald-600/20 text-emerald-300"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Compression Quality</span>
                      <span className="text-emerald-400">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Maximum Compression</span>
                      <span>Lossless / High Quality</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Est. Original Size:</span>
                      <span className="font-semibold text-slate-300">~{originalByteEstimate} KB</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Est. Compressed Size:</span>
                      <span className="font-extrabold text-emerald-400">~{compressedByteEstimate} KB</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Estimated Savings:</span>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-300">
                        {Math.max(
                          0,
                          Math.round(
                            ((originalByteEstimate - compressedByteEstimate) /
                              (originalByteEstimate || 1)) *
                              100
                          )
                        )}
                        % Reduced
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* FILTERS TAB */}
              {activeTab === "filters" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Brightness</span>
                      <span className="text-blue-400">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Contrast</span>
                      <span className="text-blue-400">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Saturation</span>
                      <span className="text-blue-400">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Grayscale</span>
                      <span className="text-blue-400">{grayscale}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={grayscale}
                      onChange={(e) => setGrayscale(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Sepia Warmth</span>
                      <span className="text-blue-400">{sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sepia}
                      onChange={(e) => setSepia(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                      setSaturation(100);
                      setBlur(0);
                      setGrayscale(0);
                      setSepia(0);
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
                  >
                    Reset Color Filters
                  </button>
                </div>
              )}

              {/* FRAME & STYLE TAB */}
              {activeTab === "style" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Border Radius (px)</span>
                      <span className="text-blue-400">{borderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={borderRadius}
                      onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                      Drop Shadow Effect
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["none", "soft", "medium", "elevated", "glow"] as const).map((sh) => (
                        <button
                          key={sh}
                          type="button"
                          onClick={() => setShadowStyle(sh)}
                          className={`rounded-xl border py-2 text-xs font-semibold capitalize transition cursor-pointer ${
                            shadowStyle === sh
                              ? "border-blue-500 bg-blue-600/20 text-blue-300 font-bold"
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                          }`}
                        >
                          {sh} Shadow
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-400">Border Width (px)</span>
                      <span className="text-blue-400">{borderWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    {borderWidth > 0 && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Border Color:</span>
                        <input
                          type="color"
                          value={borderColor}
                          onChange={(e) => setBorderColor(e.target.value)}
                          className="h-7 w-12 rounded border border-slate-700 bg-slate-950 p-0.5 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SEO & ALT TEXT TAB */}
              {activeTab === "seo" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                      Page Alignment
                    </label>
                    <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(
                        [
                          { id: "left", label: "Left Wrap", icon: AlignLeft },
                          { id: "center", label: "Center", icon: AlignCenter },
                          { id: "right", label: "Right Wrap", icon: AlignRight },
                          { id: "full", label: "Full Width", icon: Maximize },
                        ] as const
                      ).map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setAlignment(item.id)}
                            title={item.label}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                              alignment === item.id
                                ? "bg-blue-600 text-white"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <Icon size={14} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                      Alt Text (SEO & Accessibility)
                    </label>
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Descriptive alt text for screen readers..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                      Visible Image Caption
                    </label>
                    <input
                      type="text"
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      placeholder="Optional caption beneath image..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                      Click Target URL (Link)
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5">
                      <LinkIcon size={14} className="text-slate-500 mr-2 shrink-0" />
                      <input
                        type="text"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com or /admissions"
                        className="w-full bg-transparent text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="border-t border-slate-800 bg-slate-950 p-4 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 transition cursor-pointer"
              >
                <Check size={16} />
                <span>Apply Studio Image</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
