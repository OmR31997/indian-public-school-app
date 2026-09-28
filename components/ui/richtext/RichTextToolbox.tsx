"use client";

import React from "react";
import { Layers, Trash2, Plus } from "lucide-react";

export interface RichTextToolboxProps {
    activeTab: "visual" | "preview" | "html";
    showToolbox: boolean;
    selectedBlockEl: HTMLElement | null;
    selectedImageEl: HTMLImageElement | null;
    selectedAnchorEl: HTMLAnchorElement | null;
    deleteSelectedBlock: () => void;
    toolboxComponents: Array<{
        id: string;
        title: string;
        subtitle: string;
        icon: any;
        color: string;
    }>;
    insertComponent: (type: string) => void;
}

export const RichTextToolbox: React.FC<RichTextToolboxProps> = ({
    activeTab,
    showToolbox,
    selectedBlockEl,
    selectedImageEl,
    selectedAnchorEl,
    deleteSelectedBlock,
    toolboxComponents,
    insertComponent,
}) => {
    if (activeTab !== "visual" || !showToolbox) return null;

    const selectedEl = selectedBlockEl || selectedImageEl || selectedAnchorEl;

    return (
        <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 p-3 overflow-y-auto max-h-[480px] md:max-h-[640px] shrink-0 space-y-3">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#1a5d9c] flex items-center gap-1.5">
                        <Layers size={14} /> Visual Component Toolbox
                    </h4>
                    <p className="text-[11px] font-medium text-slate-400">Click or Drag & Drop blocks into editor</p>
                </div>
                {/* <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
                    VB Style
                </span> */}
            </div>

            {/* Selection Quick Action Banner in Toolbox */}
            {selectedEl && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-2.5 flex items-center justify-between text-xs font-bold text-rose-900 shadow-2xs animate-in fade-in">
                    <span className="truncate max-w-[130px] font-mono text-[11px]">
                        &lt;{selectedEl.tagName.toLowerCase()}&gt;
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
    );
};
