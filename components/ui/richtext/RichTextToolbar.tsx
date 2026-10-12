"use client";

import React from "react";
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
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Image as ImageIcon,
    Undo,
    Redo,
    Minus,
    Palette,
    Highlighter,
    Table,
    ChevronDown,
    FileSpreadsheet,
    Plus,
    Trash2,
    Monitor,
    Tablet,
    Smartphone,
    Maximize2,
    Paintbrush,
    Sun,
    Moon,
} from "lucide-react";
import { TEXT_COLORS, HIGHLIGHT_COLORS } from "./richtext.constants";

export interface RichTextToolbarProps {
    activeTab: "visual" | "preview" | "html";
    handleFormatBlock: (formatTag: string) => void;
    execCommand: (command: string, arg?: string) => void;
    colorMenuOpen: boolean;
    setColorMenuOpen: (open: boolean) => void;
    highlightMenuOpen: boolean;
    setHighlightMenuOpen: (open: boolean) => void;
    handleAddLink: () => void;
    handleAddImage: () => void;
    openTableStudio: () => void;
    openDocStudio: (type: "word" | "excel") => void;
    selectedBlockEl: HTMLElement | null;
    selectedImageEl: HTMLImageElement | null;
    selectedAnchorEl: HTMLAnchorElement | null;
    insertParagraphAfterSelectedBlock: () => void;
    deleteSelectedBlock: () => void;
    // Responsive Canvas Controls
    canvasMode?: "desktop" | "tablet" | "mobile";
    updateCanvasMode?: (mode: "desktop" | "tablet" | "mobile") => void;
    pageBgColor?: string;
    updatePageBgColor?: (color: string) => void;
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
    activeTab,
    handleFormatBlock,
    execCommand,
    colorMenuOpen,
    setColorMenuOpen,
    highlightMenuOpen,
    setHighlightMenuOpen,
    handleAddLink,
    handleAddImage,
    openTableStudio,
    openDocStudio,
    selectedBlockEl,
    selectedImageEl,
    selectedAnchorEl,
    insertParagraphAfterSelectedBlock,
    deleteSelectedBlock,
    canvasMode = "desktop",
    updateCanvasMode,
    pageBgColor = "#ffffff",
    updatePageBgColor,
}) => {
    if (activeTab !== "visual") return null;

    return (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-slate-50/50 p-2.5 text-slate-700 shrink-0">
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
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <Bold size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("italic")}
                    title="Italic"
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <Italic size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("underline")}
                    title="Underline"
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <Underline size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("strikeThrough")}
                    title="Strikethrough"
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
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
                    className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100 shadow-2xs cursor-pointer"
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
                                    className="h-7 w-7 rounded-lg border border-slate-200 transition hover:scale-110 shadow-2xs cursor-pointer"
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
                    className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100 shadow-2xs cursor-pointer"
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
                                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
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
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <AlignLeft size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("justifyCenter")}
                    title="Align Center"
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <AlignCenter size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("justifyRight")}
                    title="Align Right"
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <AlignRight size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("justifyFull")}
                    title="Justify"
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
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
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <List size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("insertOrderedList")}
                    title="Numbered List"
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <ListOrdered size={15} />
                </button>
            </div>

            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            {/* Media Links, Table & Quote */}
            <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-2xs">
                <button
                    type="button"
                    onClick={handleAddLink}
                    title="Insert Link"
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <LinkIcon size={15} />
                </button>
                <button
                    type="button"
                    onClick={handleAddImage}
                    title="Insert Image from Gallery"
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <ImageIcon size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => openTableStudio()}
                    title="Interactive Table Builder Studio & CSV Data Import"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#1a5d9c] hover:bg-blue-50 transition cursor-pointer"
                >
                    <Table size={15} className="text-[#1a5d9c]" />
                    <span>Table</span>
                </button>
                <button
                    type="button"
                    onClick={() => openDocStudio("word")}
                    title="Word (.docx) & Excel (.xlsx) Document Card Studio"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                >
                    <FileSpreadsheet size={15} className="text-emerald-600" />
                    <span>Doc/Excel</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleFormatBlock("<blockquote>")}
                    title="Quote Block"
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <Quote size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("insertHorizontalRule")}
                    title="Divider Line"
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
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
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <Undo size={15} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand("redo")}
                    title="Redo (Ctrl+Y)"
                    className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                    <Redo size={15} />
                </button>
            </div>

            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            {/* Responsive Screen Viewport Selector */}
            {updateCanvasMode && (
                <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-2xs">
                    <button
                        type="button"
                        onClick={() => updateCanvasMode("desktop")}
                        title="Desktop Screen Canvas (100% Wide)"
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                            canvasMode === "desktop"
                                ? "bg-blue-600 text-white shadow-2xs"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <Monitor size={14} />
                        <span className="hidden sm:inline">Desktop (100%)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => updateCanvasMode("tablet")}
                        title="Tablet Device Screen Canvas (768px)"
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                            canvasMode === "tablet"
                                ? "bg-blue-600 text-white shadow-2xs"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <Tablet size={14} />
                        <span className="hidden sm:inline">Tablet</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => updateCanvasMode("mobile")}
                        title="Smartphone Screen Canvas (375px)"
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                            canvasMode === "mobile"
                                ? "bg-blue-600 text-white shadow-2xs"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <Smartphone size={14} />
                        <span className="hidden sm:inline">Mobile</span>
                    </button>
                </div>
            )}

            {/* Remove Selected Element & Add Text Below in Top Toolbar */}
            {(selectedBlockEl || selectedImageEl || selectedAnchorEl) && (
                <div className="flex items-center gap-1.5 animate-in fade-in">
                    <button
                        type="button"
                        onClick={insertParagraphAfterSelectedBlock}
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white shadow-2xs hover:bg-emerald-700 transition cursor-pointer"
                        title="Insert a plain text paragraph below selected component"
                    >
                        <Plus size={13} />
                        <span>+ Text Below</span>
                    </button>
                    <button
                        type="button"
                        onClick={deleteSelectedBlock}
                        title="Remove selected component or element from visual canvas"
                        className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-600 px-3 py-1 text-xs font-extrabold text-white shadow-2xs hover:bg-red-700 transition cursor-pointer"
                    >
                        <Trash2 size={13} />
                        <span>Remove Selected</span>
                    </button>
                </div>
            )}

            {/* Clear Format */}
            <button
                type="button"
                onClick={() => execCommand("removeFormat")}
                title="Clear Formatting"
                className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
                <RotateCcw size={13} />
                <span>Clear Format</span>
            </button>
        </div>
    );
};
