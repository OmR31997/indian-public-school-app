"use client";

import React, { useState } from "react";
import {
    FileText,
    FileSpreadsheet,
    X,
    ImageIcon,
    Maximize2,
    Square,
    Eye,
    Loader2,
    Check,
    Table,
} from "lucide-react";
import { getPdfProxyUrl, getCleanUrl } from "@/lib/file-preview";
import {
    generateWordEmbedHtml,
    generateExcelEmbedHtml,
    generateWordCardHtml,
    generateExcelCardHtml,
    parseExcelArrayBufferTo2DArray,
    generateCustomTableHtml,
} from "./richtext.helpers";


export interface DocStudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    insertHTML: (htmlSnippet: string) => void;
    docType: "word" | "excel";
    setDocType: (type: "word" | "excel") => void;
    docStudioUrl: string;
    setDocStudioUrl: (url: string) => void;
    docStudioTitle: string;
    setDocStudioTitle: (title: string) => void;
    docStudioSubtitle: string;
    setDocStudioSubtitle: (subtitle: string) => void;
    docStudioButtonText: string;
    setDocStudioButtonText: (text: string) => void;
    docStudioTheme: "light" | "dark" | "banner" | "badge";
    setDocStudioTheme: (theme: "light" | "dark" | "banner" | "badge") => void;
    docStudioViewMode: "card" | "embed";
    setDocStudioViewMode: (mode: "card" | "embed") => void;
    docStudioEmbedHeight: number;
    setDocStudioEmbedHeight: (height: number) => void;
    onOpenGallery: () => void;
}

export const DocStudioModal: React.FC<DocStudioModalProps> = ({
    isOpen,
    onClose,
    insertHTML,
    docType,
    setDocType,
    docStudioUrl,
    setDocStudioUrl,
    docStudioTitle,
    setDocStudioTitle,
    docStudioSubtitle,
    setDocStudioSubtitle,
    docStudioButtonText,
    setDocStudioButtonText,
    docStudioTheme,
    setDocStudioTheme,
    docStudioViewMode,
    setDocStudioViewMode,
    docStudioEmbedHeight,
    setDocStudioEmbedHeight,
    onOpenGallery,
}) => {
    const [isParsingExcel, setIsParsingExcel] = useState<boolean>(false);

    if (!isOpen) return null;

    const handleParseAndInsertExcelTable = async () => {
        if (!docStudioUrl) return;
        setIsParsingExcel(true);
        try {
            const proxyUrl = getPdfProxyUrl(docStudioUrl);
            let res = await fetch(proxyUrl);
            if (!res.ok) {
                const cleanTargetUrl = getCleanUrl(docStudioUrl) || docStudioUrl;
                res = await fetch(cleanTargetUrl);
            }
            if (!res.ok) throw new Error(`HTTP fetch status ${res.status}`);
            const buffer = await res.arrayBuffer();
            const grid = parseExcelArrayBufferTo2DArray(buffer);
            if (grid && grid.length > 0) {
                const tableHtml = generateCustomTableHtml({
                    customData: grid,
                    headerBg: "#15803d",
                    headerColor: "#ffffff",
                    borderColor: "#cbd5e1",
                    zebra: true,
                });
                insertHTML(tableHtml);
                onClose();
            } else {
                const cardSnippet = generateExcelCardHtml({
                    url: docStudioUrl,
                    title: docStudioTitle,
                    subtitle: docStudioSubtitle,
                    buttonText: docStudioButtonText,
                    theme: docStudioTheme,
                });
                insertHTML(cardSnippet);
                onClose();
            }
        } catch (err) {
            console.warn("Failed to parse Excel binary arrayBuffer via proxy:", err);
            const cardSnippet = generateExcelCardHtml({
                url: docStudioUrl,
                title: docStudioTitle,
                subtitle: docStudioSubtitle,
                buttonText: docStudioButtonText,
                theme: docStudioTheme,
            });
            insertHTML(cardSnippet);
            onClose();
        } finally {
            setIsParsingExcel(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-in fade-in duration-150">
            <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4 backdrop-blur-xs">
                    <div className="flex items-center gap-3">
                        <div className={`grid h-10 w-10 place-items-center rounded-2xl ${docType === "word" ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                            {docType === "word" ? <FileText size={20} /> : <FileSpreadsheet size={20} />}
                        </div>
                        <div>
                            <h3 className="font-display text-lg font-extrabold text-white flex items-center gap-2">
                                {docType === "word" ? "Word & Google Doc Customizer Studio" : "Excel & Google Sheet Customizer Studio"}
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${docType === "word" ? "bg-blue-500/20 text-blue-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                                    {docType === "word" ? ".DOCX / .DOC / Google Doc" : ".XLSX / .CSV / Google Sheet"}
                                </span>
                            </h3>
                            <p className="text-xs text-slate-400">
                                Customize layout theme, document title, subtitle & action buttons for Word, Excel, Google Docs & Sheets
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 overflow-hidden">
                    {/* Left Column Controls */}
                    <div className="lg:col-span-5 flex flex-col overflow-y-auto border-r border-slate-800 bg-slate-900/60 p-5 space-y-4 scrollbar-thin">
                        {/* Document Type Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                Document Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDocType("word");
                                        if (!docStudioSubtitle || docStudioSubtitle.includes("Excel")) {
                                            setDocStudioSubtitle("Word Document or Google Doc");
                                        }
                                    }}
                                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${docType === "word"
                                        ? "border-blue-500 bg-blue-600 text-white shadow-md"
                                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    <FileText size={15} />
                                    <span>Word / Google Doc</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDocType("excel");
                                        if (!docStudioSubtitle || docStudioSubtitle.includes("Word")) {
                                            setDocStudioSubtitle("Excel Worksheet or Google Sheet");
                                        }
                                    }}
                                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${docType === "excel"
                                        ? "border-emerald-500 bg-emerald-600 text-white shadow-md"
                                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    <FileSpreadsheet size={15} />
                                    <span>Excel / Google Sheet</span>
                                </button>
                            </div>
                        </div>

                        {/* File URL Input & Gallery */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                Document File URL
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={docStudioUrl}
                                    onChange={(e) => setDocStudioUrl(e.target.value)}
                                    placeholder={docType === "word" ? "Paste Word doc URL..." : "Paste Excel spreadsheet URL..."}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono text-slate-200 outline-none focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={onOpenGallery}
                                    className="shrink-0 flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                                    title="Select File from Cloudinary Gallery"
                                >
                                    <ImageIcon size={14} />
                                    <span>Gallery</span>
                                </button>
                            </div>
                        </div>

                        {/* Presentation Format / Mode Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                Display Format Mode
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDocStudioViewMode("embed")}
                                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${docStudioViewMode === "embed"
                                        ? docType === "word"
                                            ? "border-blue-500 bg-blue-600/20 text-blue-300 ring-1 ring-blue-500"
                                            : "border-emerald-500 bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500"
                                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Maximize2 size={15} />
                                        <span>Live Embedded Reader</span>
                                    </div>
                                    <span className="text-[10px] font-normal text-slate-400">Interactive iFrame View</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setDocStudioViewMode("card")}
                                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${docStudioViewMode === "card"
                                        ? docType === "word"
                                            ? "border-blue-500 bg-blue-600/20 text-blue-300 ring-1 ring-blue-500"
                                            : "border-emerald-500 bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500"
                                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Square size={15} />
                                        <span>Card Banner Link</span>
                                    </div>
                                    <span className="text-[10px] font-normal text-slate-400">Compact Box with Download</span>
                                </button>
                            </div>
                        </div>

                        {/* Conditional Theme / Height Selector */}
                        {docStudioViewMode === "embed" ? (
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Embedded Viewer Height
                                    </label>
                                    <span className="text-xs font-mono font-bold text-blue-400">{docStudioEmbedHeight}px</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min={350}
                                        max={850}
                                        step={25}
                                        value={docStudioEmbedHeight}
                                        onChange={(e) => setDocStudioEmbedHeight(Number(e.target.value))}
                                        className="w-full accent-blue-500 cursor-pointer"
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                                    <span>350px (Compact)</span>
                                    <span>550px (Standard)</span>
                                    <span>850px (Tall)</span>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                    Card Theme & Layout Preset
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: "light", name: "Modern Light Card", icon: "bi bi-sun-fill", desc: "Clean white card with preview" },
                                        { id: "dark", name: "Dark Executive", icon: "bi bi-moon-stars-fill", desc: "Dark theme with glowing accent" },
                                        { id: "banner", name: "Compact Banner", icon: "bi bi-file-earmark-text-fill", desc: "Single row horizontal download bar" },
                                        { id: "badge", name: "Minimal Pill Badge", icon: "bi bi-tag-fill", desc: "Rounded pill action link badge" },
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setDocStudioTheme(t.id as any)}
                                            className={`flex flex-col text-left p-3 rounded-2xl border transition cursor-pointer ${docStudioTheme === t.id
                                                ? `${docType === "word" ? "border-blue-500 bg-blue-500/15 text-white ring-1 ring-blue-500/50" : "border-emerald-500 bg-emerald-500/15 text-white ring-1 ring-emerald-500/50"}`
                                                : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                                }`}
                                        >
                                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                                <i className={`${t.icon} ${docType === "word" ? "text-blue-400" : "text-emerald-400"}`} />
                                                <span>{t.name}</span>
                                            </span>
                                            <span className="text-[10px] text-slate-400 mt-1 leading-tight">{t.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Document Title */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                Document Title
                            </label>
                            <input
                                type="text"
                                value={docStudioTitle}
                                onChange={(e) => setDocStudioTitle(e.target.value)}
                                placeholder={docType === "word" ? "e.g. CBSE Syllabus 2026-27" : "e.g. Fee Structure Schedule 2026-27"}
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-100 outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Subtitle */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                Subtitle / Description
                            </label>
                            <input
                                type="text"
                                value={docStudioSubtitle}
                                onChange={(e) => setDocStudioSubtitle(e.target.value)}
                                placeholder="e.g. Official document details..."
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-slate-300 outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Button Label */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                Action Button Label
                            </label>
                            <input
                                type="text"
                                value={docStudioButtonText}
                                onChange={(e) => setDocStudioButtonText(e.target.value)}
                                placeholder="e.g. View Document"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-200 outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Right Column: Live Interactive Preview */}
                    <div className="lg:col-span-7 flex flex-col overflow-hidden bg-slate-950 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Eye size={14} className={docType === "word" ? "text-blue-400" : "text-emerald-400"} /> Live Interactive Preview ({docStudioViewMode === "embed" ? "Embedded Reader View" : "Card Banner View"}):
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">Mode: {docStudioViewMode}</span>
                        </div>

                        {isParsingExcel && (
                            <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 px-4 py-2 text-xs font-semibold text-emerald-300 animate-pulse">
                                <Loader2 size={14} className="animate-spin text-emerald-400" />
                                <span>Reading and parsing sheet content from file...</span>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-5 scrollbar-thin">
                            {!docStudioUrl ? (
                                <div className="flex h-full flex-col items-center justify-center text-slate-500 gap-2 p-8">
                                    {docType === "word" ? <FileText size={48} className="text-slate-700" /> : <FileSpreadsheet size={48} className="text-slate-700" />}
                                    <p className="text-xs font-medium">Select or paste document URL to preview interactive content</p>
                                </div>
                            ) : (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            docStudioViewMode === "embed"
                                                ? docType === "word"
                                                    ? generateWordEmbedHtml({
                                                        url: docStudioUrl,
                                                        title: docStudioTitle,
                                                        subtitle: docStudioSubtitle,
                                                        buttonText: docStudioButtonText,
                                                        height: docStudioEmbedHeight,
                                                    })
                                                    : generateExcelEmbedHtml({
                                                        url: docStudioUrl,
                                                        title: docStudioTitle,
                                                        subtitle: docStudioSubtitle,
                                                        buttonText: docStudioButtonText,
                                                        height: docStudioEmbedHeight,
                                                    })
                                                : docType === "word"
                                                    ? generateWordCardHtml({
                                                        url: docStudioUrl,
                                                        title: docStudioTitle,
                                                        subtitle: docStudioSubtitle,
                                                        buttonText: docStudioButtonText,
                                                        theme: docStudioTheme,
                                                    })
                                                    : generateExcelCardHtml({
                                                        url: docStudioUrl,
                                                        title: docStudioTitle,
                                                        subtitle: docStudioSubtitle,
                                                        buttonText: docStudioButtonText,
                                                        theme: docStudioTheme,
                                                    }),
                                    }}
                                />
                            )}
                        </div>

                        {/* Apply Buttons */}
                        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-800 flex-wrap">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                            >
                                Cancel
                            </button>

                            <div className="flex items-center gap-2 flex-wrap">
                                {docType === "word" ? (
                                    <>
                                        <button
                                            type="button"
                                            disabled={!docStudioUrl}
                                            onClick={() => {
                                                if (!docStudioUrl) return;
                                                const htmlSnippet = generateWordEmbedHtml({
                                                    url: docStudioUrl,
                                                    title: docStudioTitle,
                                                    subtitle: docStudioSubtitle,
                                                    buttonText: docStudioButtonText,
                                                    height: docStudioEmbedHeight,
                                                });
                                                insertHTML(htmlSnippet);
                                                onClose();
                                            }}
                                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
                                            title="Embed interactive live Word / Doc viewer iframe directly into page"
                                        >
                                            <Maximize2 size={15} />
                                            <span>Insert Live Document View (Embedded Reader)</span>
                                        </button>

                                        <button
                                            type="button"
                                            disabled={!docStudioUrl}
                                            onClick={() => {
                                                if (!docStudioUrl) return;
                                                const htmlSnippet = generateWordCardHtml({
                                                    url: docStudioUrl,
                                                    title: docStudioTitle,
                                                    subtitle: docStudioSubtitle,
                                                    buttonText: docStudioButtonText,
                                                    theme: docStudioTheme,
                                                });
                                                insertHTML(htmlSnippet);
                                                onClose();
                                            }}
                                            className="flex items-center gap-2 rounded-xl border border-blue-600/60 bg-blue-950/40 px-4 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-900/60 disabled:opacity-50 transition cursor-pointer"
                                        >
                                            <Check size={15} />
                                            <span>Insert Word Card Banner</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            disabled={!docStudioUrl || isParsingExcel}
                                            onClick={handleParseAndInsertExcelTable}
                                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg hover:brightness-110 disabled:opacity-50 transition cursor-pointer"
                                            title="Parse Excel sheet rows and insert as an HTML Table"
                                        >
                                            {isParsingExcel ? <Loader2 size={15} className="animate-spin" /> : <Table size={15} />}
                                            <span>Insert Sheet as Pretty Table</span>
                                        </button>

                                        <button
                                            type="button"
                                            disabled={!docStudioUrl || isParsingExcel}
                                            onClick={() => {
                                                if (!docStudioUrl) return;
                                                const htmlSnippet = generateExcelEmbedHtml({
                                                    url: docStudioUrl,
                                                    title: docStudioTitle,
                                                    subtitle: docStudioSubtitle,
                                                    buttonText: docStudioButtonText,
                                                    height: docStudioEmbedHeight,
                                                });
                                                insertHTML(htmlSnippet);
                                                onClose();
                                            }}
                                            className="flex items-center gap-2 rounded-xl border border-emerald-500/60 bg-emerald-950/50 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 disabled:opacity-50 transition cursor-pointer"
                                        >
                                            <Maximize2 size={15} />
                                            <span>Insert Live Sheet View (Embedded Reader)</span>
                                        </button>

                                        <button
                                            type="button"
                                            disabled={!docStudioUrl || isParsingExcel}
                                            onClick={() => {
                                                if (!docStudioUrl) return;
                                                const htmlSnippet = generateExcelCardHtml({
                                                    url: docStudioUrl,
                                                    title: docStudioTitle,
                                                    subtitle: docStudioSubtitle,
                                                    buttonText: docStudioButtonText,
                                                    theme: docStudioTheme,
                                                });
                                                insertHTML(htmlSnippet);
                                                onClose();
                                            }}
                                            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer"
                                        >
                                            <Check size={15} />
                                            <span>Insert Excel Card Banner</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
