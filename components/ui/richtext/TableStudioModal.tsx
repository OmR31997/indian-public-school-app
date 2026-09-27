"use client";

import React, { useState } from "react";
import { Table, Grid, X, Eye, Check } from "lucide-react";
import { generateCustomTableHtml, parseCsvTo2DArray } from "./richtext.helpers";

export interface TableStudioModalProps {
    isOpen: boolean;
    initialTab?: "builder" | "csv";
    onClose: () => void;
    insertHTML: (htmlSnippet: string) => void;
}

export const TableStudioModal: React.FC<TableStudioModalProps> = ({
    isOpen,
    initialTab = "builder",
    onClose,
    insertHTML,
}) => {
    const [tableActiveTab, setTableActiveTab] = useState<"builder" | "csv">(initialTab);
    const [tableRows, setTableRows] = useState<number>(4);
    const [tableCols, setTableCols] = useState<number>(4);
    const [tableHasHeader, setTableHasHeader] = useState<boolean>(true);
    const [tableZebra, setTableZebra] = useState<boolean>(true);
    const [tableHeaderBg, setTableHeaderBg] = useState<string>("#102a4c");
    const [tableHeaderColor, setTableHeaderColor] = useState<string>("#ffffff");
    const [tableBorderColor, setTableBorderColor] = useState<string>("#cbd5e1");
    const [tableCsvText, setTableCsvText] = useState<string>("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-in fade-in duration-150">
            <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4 backdrop-blur-xs">
                    <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/20 text-blue-400">
                            <Table size={20} />
                        </div>
                        <div>
                            <h3 className="font-display text-lg font-extrabold text-white flex items-center gap-2">
                                Interactive Table Builder & Data Import Studio
                                <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                                    Table Tool
                                </span>
                            </h3>
                            <p className="text-xs text-slate-400">
                                Generate custom grid tables, set header styling or import raw CSV / Excel data directly into HTML table
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

                {/* Mode Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950 px-6 py-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setTableActiveTab("builder")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${tableActiveTab === "builder"
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                    >
                        <Table size={14} />
                        <span>Visual Grid Builder</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setTableActiveTab("csv")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${tableActiveTab === "csv"
                            ? "bg-teal-600 text-white shadow-md"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                    >
                        <Grid size={14} />
                        <span>CSV / Excel File & Data Import</span>
                    </button>
                </div>

                {/* Body */}
                <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 overflow-hidden">
                    {/* Left Column Controls */}
                    <div className="lg:col-span-5 flex flex-col overflow-y-auto border-r border-slate-800 bg-slate-900/60 p-5 space-y-4 scrollbar-thin">
                        {tableActiveTab === "builder" ? (
                            <>
                                {/* Rows & Columns */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                            Number of Rows
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={30}
                                            value={tableRows}
                                            onChange={(e) => setTableRows(Math.max(1, Math.min(30, Number(e.target.value))))}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-100 outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                            Number of Columns
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={15}
                                            value={tableCols}
                                            onChange={(e) => setTableCols(Math.max(1, Math.min(15, Number(e.target.value))))}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-slate-100 outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Checkbox Toggles */}
                                <div className="space-y-2 pt-1">
                                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={tableHasHeader}
                                            onChange={(e) => setTableHasHeader(e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Include Header Row (&lt;th&gt;)</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={tableZebra}
                                            onChange={(e) => setTableZebra(e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Zebra Striping Row Colors</span>
                                    </label>
                                </div>

                                {/* Header Background Preset */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                        Header Background Color
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { name: "School Navy", bg: "#102a4c", text: "#ffffff" },
                                            { name: "Emerald Green", bg: "#059669", text: "#ffffff" },
                                            { name: "Royal Blue", bg: "#1a5d9c", text: "#ffffff" },
                                            { name: "Slate Light", bg: "#f1f5f9", text: "#0f172a" },
                                            { name: "Amber Gold", bg: "#d97706", text: "#ffffff" },
                                            { name: "Dark Slate", bg: "#0f172a", text: "#ffffff" },
                                        ].map((preset) => (
                                            <button
                                                key={preset.name}
                                                type="button"
                                                onClick={() => {
                                                    setTableHeaderBg(preset.bg);
                                                    setTableHeaderColor(preset.text);
                                                }}
                                                className={`flex items-center gap-2 p-2 rounded-xl border transition cursor-pointer text-xs font-bold ${tableHeaderBg === preset.bg
                                                    ? "border-blue-500 bg-blue-500/20 text-white ring-1 ring-blue-500"
                                                    : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                                                    }`}
                                            >
                                                <span className="h-4 w-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: preset.bg }} />
                                                <span>{preset.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Border Color */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                        Table Border Color
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { name: "Classic Gray", color: "#cbd5e1" },
                                            { name: "School Navy", color: "#102a4c" },
                                            { name: "Royal Blue", color: "#1a5d9c" },
                                            { name: "Soft Slate", color: "#e2e8f0" },
                                        ].map((b) => (
                                            <button
                                                key={b.name}
                                                type="button"
                                                onClick={() => setTableBorderColor(b.color)}
                                                className={`flex items-center gap-2 p-2 rounded-xl border transition cursor-pointer text-xs font-bold ${tableBorderColor === b.color
                                                    ? "border-blue-500 bg-blue-500/20 text-white ring-1 ring-blue-500"
                                                    : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700"
                                                    }`}
                                            >
                                                <span className="h-4 w-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: b.color }} />
                                                <span>{b.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* CSV Upload / Paste */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                        Upload CSV / Excel File
                                    </label>
                                    <input
                                        type="file"
                                        accept=".csv,.txt,.tsv,.xlsx,.xls,.docx"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                const content = event.target?.result as string;
                                                if (content) {
                                                    setTableCsvText(content);
                                                }
                                            };
                                            reader.readAsText(file);
                                        }}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-xs file:font-bold file:text-white hover:file:bg-blue-700 cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                                        Or Paste Raw CSV / TSV Data
                                    </label>
                                    <textarea
                                        rows={10}
                                        value={tableCsvText}
                                        onChange={(e) => setTableCsvText(e.target.value)}
                                        placeholder={`Paste tabular data copied from Excel or comma separated values:
S.No, Class, Students, Fee Status
1, Grade Nursery, 45, Paid
2, Grade KG, 50, Pending...`}
                                        className="w-full font-mono text-xs leading-relaxed rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-slate-200 outline-none focus:border-teal-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={tableHasHeader}
                                            onChange={(e) => setTableHasHeader(e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Treat First Line as Table Header</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={tableZebra}
                                            onChange={(e) => setTableZebra(e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Zebra Striping Row Colors</span>
                                    </label>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column: Live Table Preview (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col overflow-hidden bg-slate-950 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Eye size={14} className="text-blue-400" /> Live Interactive Table Preview:
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">Mode: {tableActiveTab}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-white p-5 scrollbar-thin">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: generateCustomTableHtml({
                                        rows: tableRows,
                                        cols: tableCols,
                                        hasHeader: tableHasHeader,
                                        zebra: tableZebra,
                                        borderColor: tableBorderColor,
                                        headerBg: tableHeaderBg,
                                        headerColor: tableHeaderColor,
                                        customData: tableActiveTab === "csv" && tableCsvText.trim() ? parseCsvTo2DArray(tableCsvText) : undefined,
                                    }),
                                }}
                            />
                        </div>

                        {/* Footer Controls */}
                        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const htmlSnippet = generateCustomTableHtml({
                                        rows: tableRows,
                                        cols: tableCols,
                                        hasHeader: tableHasHeader,
                                        zebra: tableZebra,
                                        borderColor: tableBorderColor,
                                        headerBg: tableHeaderBg,
                                        headerColor: tableHeaderColor,
                                        customData: tableActiveTab === "csv" && tableCsvText.trim() ? parseCsvTo2DArray(tableCsvText) : undefined,
                                    });
                                    insertHTML(htmlSnippet);
                                    onClose();
                                }}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg hover:brightness-110 transition cursor-pointer"
                            >
                                <Check size={16} />
                                <span>Apply & Insert Table</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
