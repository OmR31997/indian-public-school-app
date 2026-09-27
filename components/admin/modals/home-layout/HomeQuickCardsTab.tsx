"use client";

import React from "react";
import { Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

interface HomeQuickCardsTabProps {
  homeObj: any;
  updateHome: (updater: (prev: any) => any) => void;
  addTopArrayItem: (key: string, defaultObj: any) => void;
  deleteTopArrayItem: (key: string, index: number) => void;
  moveTopArrayItem: (key: string, index: number, dir: "up" | "down") => void;
}

export function HomeQuickCardsTab({
  homeObj,
  updateHome,
  addTopArrayItem,
  deleteTopArrayItem,
  moveTopArrayItem,
}: HomeQuickCardsTabProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
            <i className="bi bi-grid-3x3-gap text-[#1a5d9c]" /> Quick Action Menu Cards ({(homeObj.menuCard || []).length})
          </h3>
          <button
            type="button"
            onClick={() => addTopArrayItem("menuCard", { heading: "New Action Card", subHeading: "Explore options", redirectUrl: "/about" })}
            className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
          >
            <Plus size={14} /> Add Action Card
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {(Array.isArray(homeObj.menuCard) ? homeObj.menuCard : []).map((card: any, idx: number) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-[#1a5d9c]">Card #{idx + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveTopArrayItem("menuCard", idx, "up")} disabled={idx === 0} className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                    <ArrowUp size={13} />
                  </button>
                  <button type="button" onClick={() => moveTopArrayItem("menuCard", idx, "down")} disabled={idx === homeObj.menuCard.length - 1} className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                    <ArrowDown size={13} />
                  </button>
                  <button type="button" onClick={() => deleteTopArrayItem("menuCard", idx)} className="rounded p-1 text-red-500 hover:text-red-700">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Heading"
                value={card.heading || ""}
                onChange={(e) => {
                  const cards = [...(homeObj.menuCard || [])];
                  cards[idx] = { ...cards[idx], heading: e.target.value };
                  updateHome((prev) => ({ ...prev, menuCard: cards }));
                }}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold outline-none"
              />
              <input
                type="text"
                placeholder="SubHeading"
                value={card.subHeading || ""}
                onChange={(e) => {
                  const cards = [...(homeObj.menuCard || [])];
                  cards[idx] = { ...cards[idx], subHeading: e.target.value };
                  updateHome((prev) => ({ ...prev, menuCard: cards }));
                }}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold outline-none"
              />
              <input
                type="text"
                placeholder="Redirect URL"
                value={card.redirectUrl || ""}
                onChange={(e) => {
                  const cards = [...(homeObj.menuCard || [])];
                  cards[idx] = { ...cards[idx], redirectUrl: e.target.value };
                  updateHome((prev) => ({ ...prev, menuCard: cards }));
                }}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
