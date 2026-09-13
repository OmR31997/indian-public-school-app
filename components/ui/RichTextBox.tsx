"use client";

import React, { useRef, useState, useEffect } from "react";
import { CloudinaryGalleryModal } from "@/components/admin/CloudinaryGalleryModal";
import { ImageStudioModal, ImageStudioData } from "@/components/admin/ImageStudioModal";
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

  // Image Studio States
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioInitialData, setStudioInitialData] = useState<ImageStudioData | string | null>(null);
  const [selectedImageEl, setSelectedImageEl] = useState<HTMLImageElement | null>(null);

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
              a { color: #1a5d9c; text-decoration: underline; font-weight: 600; }
              img { max-width: 100%; height: auto; border-radius: 12px; margin: 12px 0; box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.1); cursor: pointer; transition: all 0.2s ease; }
              img.wysiwyg-selected-img { outline: 3px solid #2563eb !important; outline-offset: 3px !important; box-shadow: 0 0 20px rgba(37, 99, 235, 0.35) !important; }
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

      // Image selection listener inside iframe
      const handleDocClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const imgEl = (target && target.tagName === "IMG" ? target : target?.closest?.("img")) as HTMLImageElement | null;

        doc.querySelectorAll("img").forEach((img) => img.classList.remove("wysiwyg-selected-img"));

        if (imgEl) {
          imgEl.classList.add("wysiwyg-selected-img");
          setSelectedImageEl(imgEl);
        }
      };

      doc.addEventListener("click", handleDocClick);
      doc.addEventListener("mousedown", handleDocClick);
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

  const handleAddLink = () => {
    const url = prompt("Enter Link URL (e.g. https://example.com or /about):", "https://");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const handleAddImage = () => {
    setIsGalleryOpen(true);
  };

  // Visual Basic .NET Component Templates
  const insertComponent = (type: string) => {
    switch (type) {
      case "hero":
        insertHTML(
          `<section style="background-color: #102a4c; color: #ffffff; padding: 2.5rem; border-radius: 1.5rem; margin-bottom: 2rem; box-shadow: 0 10px 25px -5px rgba(16,42,76,0.3);">
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
</section><p><br></p>`
        );
        break;
      case "slider":
        insertHTML(
          `<section style="position: relative; overflow: hidden; border-radius: 1.5rem; margin-bottom: 2rem; background-color: #0f172a;">
  <img src="https://res.cloudinary.com/niefrrkx/image/upload/v1789163175/indian-public-school/assets/Home/hero-campus.jpg" alt="Campus Banner" style="width: 100%; height: 360px; object-fit: cover; opacity: 0.85; display: block;" />
  <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 2rem; background: linear-gradient(transparent, rgba(15,23,42,0.95)); color: #ffffff;">
    <h2 style="font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem 0; color: #ffffff;">Modern Campus Infrastructure</h2>
    <p style="margin: 0; font-size: 1rem; color: #e2e8f0; max-width: 36rem;">State-of-the-art science labs, digital libraries, and world-class athletic facilities.</p>
  </div>
</section><p><br></p>`
        );
        break;
      case "features":
        insertHTML(
          `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
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
</div><p><br></p>`
        );
        break;
      case "principal":
        insertHTML(
          `<section style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 1.5rem; padding: 2rem; margin-bottom: 2rem; display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center;">
  <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80" alt="Principal Profile" style="width: 130px; height: 130px; border-radius: 1rem; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
  <div style="flex: 1; min-width: 240px;">
    <span style="color: #1a5d9c; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Principal's Welcome</span>
    <h3 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0.25rem 0 0.75rem 0;">Building Leaders of Tomorrow</h3>
    <p style="font-size: 0.95rem; color: #475569; line-height: 1.7; font-style: italic; margin: 0 0 1rem 0;">
      "Our promise is simple yet profound: to nurture every student's potential in a safe, inspiring environment where curiosity is celebrated every day."
    </p>
    <p style="font-weight: 700; color: #1e293b; margin: 0;">Dr. S. K. Sharma — <span style="font-weight: 400; color: #64748b;">Principal, Indian Public School</span></p>
  </div>
</section><p><br></p>`
        );
        break;
      case "stats":
        insertHTML(
          `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; background-color: #102a4c; color: #ffffff; padding: 1.75rem; border-radius: 1.25rem; text-align: center;">
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
</div><p><br></p>`
        );
        break;
      case "contact":
        insertHTML(
          `<div style="border: 1px solid #e2e8f0; background-color: #ffffff; padding: 1.75rem; border-radius: 1.25rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <h3 style="font-size: 1.35rem; font-weight: 800; color: #102a4c; margin: 0 0 1rem 0;">Get In Touch With Us</h3>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; color: #334155; font-size: 0.95rem;">
    <div><strong>📍 Address:</strong> Main Highway Road, IPS Campus, Knowledge City</div>
    <div><strong>📞 Phone:</strong> +91 98765 43210 / 011-2345678</div>
    <div><strong>✉️ Email:</strong> info@indianpublicschool.edu.in</div>
    <div><strong>⏰ Office Hours:</strong> Mon - Sat (8:00 AM - 4:00 PM)</div>
  </div>
</div><p><br></p>`
        );
        break;
      case "testimonials":
        insertHTML(
          `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
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
</div><p><br></p>`
        );
        break;
      case "disclosureTable":
        insertHTML(
          `<div style="margin-bottom: 2rem; overflow-x: auto;">
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
</div><p><br></p>`
        );
        break;
      case "info":
        insertHTML(
          `<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 8px; margin: 16px 0; color: #1e40af;"><strong>ℹ️ Notice:</strong> Type your notice or announcement details here.</div><p><br></p>`
        );
        break;
      case "success":
        insertHTML(
          `<div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 14px 18px; border-radius: 8px; margin: 16px 0; color: #166534;"><strong>✅ Highlight:</strong> Type your positive achievement or update here.</div><p><br></p>`
        );
        break;
      case "warning":
        insertHTML(
          `<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 16px 0; color: #92400e;"><strong>⚠️ Alert:</strong> Type urgent notice or deadline alert here.</div><p><br></p>`
        );
        break;
      case "card":
        insertHTML(
          `<div style="border: 1px solid #cbd5e1; background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 16px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);"><h3 style="margin-top:0; color:#0f172a;">Card Title</h3><p style="margin-bottom:0; color:#334155;">Type inside this rounded card container.</p></div><p><br></p>`
        );
        break;
      case "badge":
        insertHTML(
          `<span style="background-color: #1a5d9c; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; display: inline-block; margin: 0 4px;">Pill Badge</span> `
        );
        break;
      case "grid":
        insertHTML(
          `<div style="display: flex; flex-wrap: wrap; gap: 16px; margin: 16px 0;"><div style="flex: 1; min-width: 240px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px;"><h4 style="margin-top:0; color:#0f172a;">Column 1 Title</h4><p style="margin-bottom:0; color:#475569;">Column 1 details...</p></div><div style="flex: 1; min-width: 240px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px;"><h4 style="margin-top:0; color:#0f172a;">Column 2 Title</h4><p style="margin-bottom:0; color:#475569;">Column 2 details...</p></div></div><p><br></p>`
        );
        break;
    }
  };

  const toolboxComponents = [
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
              onClick={() => {
                setStudioInitialData(null);
                setIsStudioOpen(true);
              }}
              title="Open Image Studio (Crop, Resize, Compress)"
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-2xs hover:brightness-110 transition ml-0.5"
            >
              <Scissors size={13} />
              <span>Crop & Edit</span>
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock("<blockquote>")}
              title="Quote Block"
              className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 ml-0.5"
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
                <p className="text-[11px] font-medium text-slate-400">1-Click to add page blocks</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                VB Style
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {toolboxComponents.map((comp) => {
                const IconComp = comp.icon;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => insertComponent(comp.id)}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 text-left transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md cursor-pointer"
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
                  <Scissors size={15} className="text-blue-600 animate-pulse" /> Image Tools Suite:
                </span>
                <span className="text-[11px] font-bold text-blue-700 max-w-[220px] truncate bg-white/80 px-2 py-0.5 rounded-md border border-blue-200">
                  {selectedImageEl ? `Selected: ${selectedImageEl.alt || "Page Asset"}` : "Click any image below to edit"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => openStudioForTargetImage()}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs hover:brightness-110 transition cursor-pointer"
                >
                  <Scissors size={13} />
                  <span>✂️ Crop, Resize & Compress Studio</span>
                </button>

                <div className="h-4 w-px bg-blue-200 mx-0.5" />

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
          if (selectedImageEl) {
            selectedImageEl.src = url;
            setSelectedImageEl(null);
            syncIframeToState();
          } else {
            insertHTML(`<img src="${url}" alt="Cloudinary Media" style="max-width: 100%; height: auto; border-radius: 12px; margin: 12px 0; box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.1);" /><p><br></p>`);
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
    </div>
  );
}
