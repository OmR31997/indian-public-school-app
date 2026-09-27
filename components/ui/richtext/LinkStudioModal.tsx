"use client";

import React from "react";
import { Link as LinkIcon, X, CheckCircle2, Trash2, Check } from "lucide-react";

export interface LinkStudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingAnchorEl: HTMLAnchorElement | null;
    selectedAnchorEl: HTMLAnchorElement | null;
    linkText: string;
    setLinkText: (val: string) => void;
    linkUrl: string;
    setLinkUrl: (val: string) => void;
    linkTarget: string;
    setLinkTarget: (val: any) => void;
    linkStyle: "text" | "gold-button" | "navy-button" | "outline-button" | "pill-badge";
    setLinkStyle: (style: "text" | "gold-button" | "navy-button" | "outline-button" | "pill-badge") => void;
    applyHyperlink: () => void;
    removeHyperlink: () => void;
}

export const LinkStudioModal: React.FC<LinkStudioModalProps> = ({
    isOpen,
    onClose,
    editingAnchorEl,
    selectedAnchorEl,
    linkText,
    setLinkText,
    linkUrl,
    setLinkUrl,
    linkTarget,
    setLinkTarget,
    linkStyle,
    setLinkStyle,
    applyHyperlink,
    removeHyperlink,
}) => {
    if (!isOpen) return null;

    return (
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
                        onClick={onClose}
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
                            <span className="text-[11px] font-semibold text-blue-600">Quick Page Presets</span>
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
                                { label: "Admission Form", icon: "bi bi-mortarboard-fill", url: "/admission" },
                                { label: "About IPS", icon: "bi bi-building", url: "/about" },
                                { label: "Contact Us", icon: "bi bi-telephone-fill", url: "/contact" },
                                { label: "Academics", icon: "bi bi-book-fill", url: "/academics" },
                                { label: "CBSE Disclosure", icon: "bi bi-file-earmark-text-fill", url: "/mandatory-public-disclosure" },
                                { label: "Gallery", icon: "bi bi-images", url: "/gallery" },
                                { label: "Email Contact", icon: "bi bi-envelope-fill", url: "mailto:info@indianpublicschool.edu.in" },
                                { label: "Call Phone", icon: "bi bi-telephone-outbound-fill", url: "tel:+919876543210" },
                            ].map((preset) => (
                                <button
                                    key={preset.url}
                                    type="button"
                                    onClick={() => {
                                        setLinkUrl(preset.url);
                                        if (!linkText || linkText === "https://") {
                                            setLinkText(preset.label);
                                        }
                                    }}
                                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-[#1a5d9c] transition cursor-pointer"
                                >
                                    <i className={`${preset.icon} text-[#1a5d9c]`} />
                                    <span>{preset.label}</span>
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
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${linkTarget === "_blank" ? "bg-[#1a5d9c]" : "bg-slate-300"
                                }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${linkTarget === "_blank" ? "translate-x-5" : "translate-x-0"
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
                                    className={`flex flex-col text-left p-2.5 rounded-2xl border transition-all cursor-pointer ${linkStyle === st.id
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
                                    <i className="bi bi-link-45deg me-1" /> {linkText || "Pill Badge Text"}
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
                            onClick={onClose}
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
    );
};
