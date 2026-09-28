"use client";

import React, { useState, useMemo } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  UploadCloud,
  ImageIcon,
} from "lucide-react";
import fallbackSiteData from "@/public/cloud-datasource.json";
import { RecordItem } from "../types/admin.types";
import { API_URL } from "../config/admin.config";
import { HomeHeroTab } from "./home-layout/HomeHeroTab";

export function HomeLayoutEditorModal({
  token,
  record,
  saving,
  onClose,
  onSave,
}: {
  token: string;
  record: RecordItem | null;
  saving: boolean;
  onClose: () => void;
  onSave: (value: Record<string, unknown>) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    | "header"
    | "footer"
    | "whatsapp"
    | "hero"
    | "banner"
    | "quickCards"
    | "video"
    | "sec1"
    | "sec2"
    | "sec3"
    | "sec4"
    | "sec5"
    | "sec6"
    | "sec7"
    | "sec8"
    | "sec9"
    | "sec10"
    | "rawJson"
  >("header");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");

  const initialValue = useMemo(() => {
    let val = record?.value;
    if (typeof val === "string") {
      try {
        val = JSON.parse(val);
      } catch {
        val = null;
      }
    }
    if (val && typeof val === "object" && "home" in val && Array.isArray((val as any).home)) {
      return val as any;
    }
    return fallbackSiteData as any;
  }, [record]);

  const [datasource, setDatasource] = useState<any>(initialValue);
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(initialValue, null, 2));

  const homeObj = useMemo(() => {
    return datasource?.home?.[0] || {};
  }, [datasource]);

  const updateHome = (updater: (prevHomeObj: any) => any) => {
    const updatedHomeObj = updater({ ...homeObj });
    const updatedDs = { ...datasource, home: [updatedHomeObj] };
    setDatasource(updatedDs);
    setJsonText(JSON.stringify(updatedDs, null, 2));
  };

  const uploadImage = async (file: File, album = "Home", folder?: string): Promise<string> => {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("album", album);
      if (folder) {
        formData.append("folder", folder);
      }

      const res = await axios.post(`${API_URL}/uploads`, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data?.data ?? res.data;
      const url = data?.url || (Array.isArray(data?.fileUrl) ? data.fileUrl[0] : data?.fileUrl);
      if (!url) throw new Error("No URL returned from upload");
      return url;
    } catch (err) {
      setUploadError(axios.isAxiosError(err) ? String(err.response?.data?.message || err.message) : "Upload failed.");
      return "";
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    let finalVal = datasource;
    if (activeTab === "rawJson") {
      try {
        finalVal = JSON.parse(jsonText);
      } catch {
        setUploadError("Invalid JSON syntax in Raw JSON Editor tab");
        return;
      }
    }

    const homeList = Array.isArray(finalVal.home) ? [...finalVal.home] : [{}];
    const firstHome = { ...(homeList[0] || {}) };
    const currentIdentity = { ...(firstHome.identity || {}) };

    const headerObj = { ...(finalVal.header || currentIdentity.header || {}) };
    const footerObj = { ...(finalVal.footer || currentIdentity.footer || {}) };
    const waObj = { ...(finalVal.whatsapp || currentIdentity.whatsapp || {}) };
    const logoObj = { ...(finalVal.site_logo || currentIdentity.site_logo || {}) };
    const certObj = { ...(finalVal.certified_board || currentIdentity.certified_board || {}) };
    const trustObj = { ...(finalVal.trust_board || currentIdentity.trust_board || {}) };

    firstHome.identity = {
      ...currentIdentity,
      header: headerObj,
      footer: footerObj,
      whatsapp: waObj,
      site_logo: logoObj,
      certified_board: certObj,
      trust_board: trustObj,
    };
    homeList[0] = firstHome;

    finalVal = {
      ...finalVal,
      header: headerObj,
      footer: footerObj,
      whatsapp: waObj,
      site_logo: logoObj,
      certified_board: certObj,
      trust_board: trustObj,
      home: homeList,
    };

    onSave({
      key: record?.key || "site_datasource",
      category: record?.category || "Content",
      description: record?.description || "Full home page layout configuration datasource",
      status: "Active",
      value: finalVal,
      isPublic: true,
    });
  };

  const updateHeaderField = (field: string, val: string) => {
    setDatasource((prev: any) => {
      const homeList = Array.isArray(prev?.home) ? [...prev.home] : [{}];
      const firstHome = { ...(homeList[0] || {}) };
      const identityObj = { ...(firstHome.identity || {}) };
      const headerObj = { ...(identityObj.header || prev?.header || {}), [field]: val };

      identityObj.header = headerObj;
      firstHome.identity = identityObj;
      homeList[0] = firstHome;

      const next = {
        ...prev,
        header: headerObj,
        home: homeList,
      };
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const updateFooterField = (field: string, val: string) => {
    setDatasource((prev: any) => {
      const homeList = Array.isArray(prev?.home) ? [...prev.home] : [{}];
      const firstHome = { ...(homeList[0] || {}) };
      const identityObj = { ...(firstHome.identity || {}) };
      const footerObj = { ...(identityObj.footer || prev?.footer || {}), [field]: val };

      identityObj.footer = footerObj;
      firstHome.identity = identityObj;
      homeList[0] = firstHome;

      const next = {
        ...prev,
        footer: footerObj,
        home: homeList,
      };
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const updateWhatsAppField = (field: string, val: any) => {
    setDatasource((prev: any) => {
      const homeList = Array.isArray(prev?.home) ? [...prev.home] : [{}];
      const firstHome = { ...(homeList[0] || {}) };
      const identityObj = { ...(firstHome.identity || {}) };
      const waObj = { ...(identityObj.whatsapp || prev?.whatsapp || {}), [field]: val };

      identityObj.whatsapp = waObj;
      firstHome.identity = identityObj;
      homeList[0] = firstHome;

      const next = {
        ...prev,
        whatsapp: waObj,
        home: homeList,
      };
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const addItemToSection = (secKey: string, defaultObj: any) => {
    updateHome((prev) => {
      const secList = [...(prev[secKey] || [{}])];
      const listKey = secList[0]?.list ? "list" : "cardItem";
      const items = [...(secList[0]?.[listKey] || [])];
      items.push(defaultObj);
      secList[0] = { ...secList[0], [listKey]: items };
      return { ...prev, [secKey]: secList };
    });
  };

  const deleteItemFromSection = (secKey: string, index: number) => {
    updateHome((prev) => {
      const secList = [...(prev[secKey] || [{}])];
      const listKey = secList[0]?.list ? "list" : "cardItem";
      const items = (secList[0]?.[listKey] || []).filter((_: any, i: number) => i !== index);
      secList[0] = { ...secList[0], [listKey]: items };
      return { ...prev, [secKey]: secList };
    });
  };

  const moveItemInSection = (secKey: string, index: number, dir: "up" | "down") => {
    updateHome((prev) => {
      const secList = [...(prev[secKey] || [{}])];
      const listKey = secList[0]?.list ? "list" : "cardItem";
      const items = [...(secList[0]?.[listKey] || [])];
      const targetIdx = dir === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= items.length) return prev;
      const temp = items[index];
      items[index] = items[targetIdx];
      items[targetIdx] = temp;
      secList[0] = { ...secList[0], [listKey]: items };
      return { ...prev, [secKey]: secList };
    });
  };

  const addTopArrayItem = (key: string, defaultObj: any) => {
    updateHome((prev) => {
      const list = [...(prev[key] || [])];
      list.push(defaultObj);
      return { ...prev, [key]: list };
    });
  };

  const deleteTopArrayItem = (key: string, index: number) => {
    updateHome((prev) => {
      const list = (prev[key] || []).filter((_: any, i: number) => i !== index);
      return { ...prev, [key]: list };
    });
  };

  const moveTopArrayItem = (key: string, index: number, dir: "up" | "down") => {
    updateHome((prev) => {
      const list = [...(prev[key] || [])];
      const targetIdx = dir === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, [key]: list };
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 shrink-0 rounded-t-3xl">
          <div>
            <h2 className="font-display text-xl font-bold text-[#102a4c] flex items-center gap-2">
              <LayoutDashboard className="text-amber-500" size={20} />
              Home Page Complete Layout & Content Manager
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dynamically add, remove, reorder, edit cards and upload images for any section.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50/90 p-3 overflow-x-auto scrollbar-thin shrink-0 whitespace-nowrap">
          {[
            { id: "header", label: "Header Config", icon: "bi-card-heading" },
            { id: "footer", label: "Footer Config", icon: "bi-layout-text-window" },
            { id: "whatsapp", label: "WhatsApp Widget", icon: "bi-whatsapp" },
            { id: "hero", label: "Hero Poster", icon: "bi-person-standing" },
            { id: "banner", label: "Banner Slider", icon: "bi-flag-fill" },
            { id: "quickCards", label: "Quick Cards", icon: "bi-grid-3x3-gap" },
            { id: "video", label: "Intro Video Setup", icon: "bi-camera-video-fill" },
            { id: "sec1", label: "Sec 1: About", icon: "bi-building" },
            { id: "sec2", label: "Sec 2: Key Stats", icon: "bi-bar-chart-fill" },
            { id: "sec3", label: "Sec 3: Why Choose", icon: "bi-star-fill" },
            { id: "sec4", label: "Sec 4: Academics", icon: "bi-book-fill" },
            { id: "sec5", label: "Sec 5: Activities", icon: "bi-activity" },
            { id: "sec6", label: "Sec 6: Campus", icon: "bi-building-fill" },
            { id: "sec7", label: "Sec 7: Student Life", icon: "bi-people-fill" },
            { id: "sec8", label: "Sec 8: Courses", icon: "bi-mortarboard-fill" },
            { id: "sec9", label: "Sec 9: Director Message", icon: "bi-person-badge-fill" },
            { id: "sec10", label: "Sec 10: News & Notices", icon: "bi-newspaper" },
            { id: "rawJson", label: "Raw JSON", icon: "bi-code-slash" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition border whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#1a5d9c] bg-[#1a5d9c] text-white shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <i className={`bi ${tab.icon}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {uploadError && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 flex items-center justify-between">
              <span>{uploadError}</span>
              <button type="button" onClick={() => setUploadError("")} className="text-red-500 hover:text-red-700">
                <X size={14} />
              </button>
            </div>
          )}

          {/* TAB: Header */}
          {activeTab === "header" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                  <i className="bi bi-card-heading text-[#1a5d9c]" /> Website Header & Navigation Top Bar Configuration
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500">Top Announcement / Notice Bar Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Admissions Open for Session 2026-27 | Apply Online Today"
                      value={datasource?.home?.[0]?.identity?.header?.noticeText || datasource?.header?.noticeText || ""}
                      onChange={(e) => updateHeaderField("noticeText", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Helpline / Contact Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +91-9876543210"
                      value={datasource?.home?.[0]?.identity?.header?.phone || datasource?.header?.phone || ""}
                      onChange={(e) => updateHeaderField("phone", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Official Support Email</label>
                    <input
                      type="text"
                      placeholder="e.g. info@indianpublicschool.in"
                      value={datasource?.home?.[0]?.identity?.header?.email || datasource?.header?.email || ""}
                      onChange={(e) => updateHeaderField("email", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Header Action Button Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Apply Now"
                      value={datasource?.home?.[0]?.identity?.header?.ctaText || datasource?.header?.ctaText || ""}
                      onChange={(e) => updateHeaderField("ctaText", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Header Action Button Target Link</label>
                    <input
                      type="text"
                      placeholder="e.g. /admission"
                      value={datasource?.home?.[0]?.identity?.header?.ctaUrl || datasource?.header?.ctaUrl || ""}
                      onChange={(e) => updateHeaderField("ctaUrl", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Footer */}
          {activeTab === "footer" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                  <i className="bi bi-layout-text-window text-[#1a5d9c]" /> Website Footer & Contact Info Configuration
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500">Footer About Snippet</label>
                    <textarea
                      rows={2}
                      placeholder="Brief introduction displayed in website footer"
                      value={datasource?.home?.[0]?.identity?.footer?.aboutText || datasource?.footer?.aboutText || ""}
                      onChange={(e) => updateFooterField("aboutText", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none resize-y"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500">Campus Address</label>
                    <input
                      type="text"
                      placeholder="e.g. IPS Main Campus, School Road, City Center"
                      value={datasource?.home?.[0]?.identity?.footer?.address || datasource?.footer?.address || ""}
                      onChange={(e) => updateFooterField("address", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Footer Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +91-9876543210"
                      value={datasource?.home?.[0]?.identity?.footer?.phone || datasource?.footer?.phone || ""}
                      onChange={(e) => updateFooterField("phone", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Footer Email</label>
                    <input
                      type="text"
                      placeholder="e.g. contact@indianpublicschool.in"
                      value={datasource?.home?.[0]?.identity?.footer?.email || datasource?.footer?.email || ""}
                      onChange={(e) => updateFooterField("email", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <label className="text-xs font-bold text-[#102a4c] flex items-center gap-1.5">
                          <i className="bi bi-clock-history text-[#1a5d9c]"></i> School Office Timings Schedule
                        </label>
                        <p className="text-[11px] text-slate-500">Configure day-wise working hours for admissions and administration office</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDatasource((prev: any) => {
                            const next = { ...prev };
                            const contactUs = { ...(next["contact-us"] || {}) };
                            const timings = { ...(contactUs["office-timings"] || {}) };
                            let newKey = "Sunday";
                            let counter = 1;
                            while (newKey in timings) {
                              newKey = `New Day ${counter++}`;
                            }
                            timings[newKey] = "8:00 AM - 2:00 PM";
                            contactUs["office-timings"] = timings;
                            next["contact-us"] = contactUs;
                            const summaryText = Object.entries(timings).map(([k, v]) => `${k}: ${v}`).join(" | ");
                            next.footer = { ...(next.footer || {}), officeHours: summaryText };
                            setJsonText(JSON.stringify(next, null, 2));
                            return next;
                          });
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1a5d9c] hover:bg-blue-100 transition cursor-pointer"
                      >
                        <Plus size={14} /> Add Timing Slot
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(() => {
                        const contactUs = datasource?.["contact-us"] as Record<string, any> | undefined;
                        const officeTimings = (contactUs?.["office-timings"] as Record<string, string>) || {
                          "Monday-Friday": "7:30 AM - 5:00 PM",
                          "Saturday": "9:00 AM - 1:00 PM",
                          "Sunday": "8:00 AM - 2:00 PM",
                        };
                        const entries = Object.entries(officeTimings);

                        if (entries.length === 0) {
                          return <p className="text-xs text-slate-400 italic">No office timing slots added yet. Click &quot;Add Timing Slot&quot; above.</p>;
                        }

                        return entries.map(([dayKey, timeVal], idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
                            <div className="w-full sm:w-1/3">
                              <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Days Range</label>
                              <input
                                type="text"
                                placeholder="e.g. Monday-Friday"
                                value={dayKey}
                                onChange={(e) => {
                                  const newDayKey = e.target.value;
                                  setDatasource((prev: any) => {
                                    const next = { ...prev };
                                    const cUs = { ...(next["contact-us"] || {}) };
                                    const oldTimings = { ...(cUs["office-timings"] || {}) };
                                    const newTimings: Record<string, string> = {};
                                    Object.entries(oldTimings).forEach(([k, v]) => {
                                      if (k === dayKey) {
                                        newTimings[newDayKey] = v as string;
                                      } else {
                                        newTimings[k] = v as string;
                                      }
                                    });
                                    cUs["office-timings"] = newTimings;
                                    next["contact-us"] = cUs;
                                    const summaryText = Object.entries(newTimings).map(([k, v]) => `${k}: ${v}`).join(" | ");
                                    next.footer = { ...(next.footer || {}), officeHours: summaryText };
                                    setJsonText(JSON.stringify(next, null, 2));
                                    return next;
                                  });
                                }}
                                className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold outline-none focus:border-[#1a5d9c]"
                              />
                            </div>
                            <div className="w-full sm:flex-1">
                              <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Operating Hours</label>
                              <input
                                type="text"
                                placeholder="e.g. 7:30 AM - 5:00 PM"
                                value={timeVal}
                                onChange={(e) => {
                                  const newTimeVal = e.target.value;
                                  setDatasource((prev: any) => {
                                    const next = { ...prev };
                                    const cUs = { ...(next["contact-us"] || {}) };
                                    const timings = { ...(cUs["office-timings"] || {}) };
                                    timings[dayKey] = newTimeVal;
                                    cUs["office-timings"] = timings;
                                    next["contact-us"] = cUs;
                                    const summaryText = Object.entries(timings).map(([k, v]) => `${k}: ${v}`).join(" | ");
                                    next.footer = { ...(next.footer || {}), officeHours: summaryText };
                                    setJsonText(JSON.stringify(next, null, 2));
                                    return next;
                                  });
                                }}
                                className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold outline-none focus:border-[#1a5d9c]"
                              />
                            </div>
                            <button
                              type="button"
                              title="Delete Timing Slot"
                              onClick={() => {
                                setDatasource((prev: any) => {
                                  const next = { ...prev };
                                  const cUs = { ...(next["contact-us"] || {}) };
                                  const timings = { ...(cUs["office-timings"] || {}) };
                                  delete timings[dayKey];
                                  cUs["office-timings"] = timings;
                                  next["contact-us"] = cUs;
                                  const summaryText = Object.entries(timings).map(([k, v]) => `${k}: ${v}`).join(" | ");
                                  next.footer = { ...(next.footer || {}), officeHours: summaryText };
                                  setJsonText(JSON.stringify(next, null, 2));
                                  return next;
                                });
                              }}
                              className="self-end sm:self-center p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Copyright Notice</label>
                    <input
                      type="text"
                      placeholder="e.g. © 2026 Indian Public School. All Rights Reserved."
                      value={datasource?.footer?.copyright || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, copyright: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Affiliation / Board Registration Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Affiliated to CBSE, New Delhi"
                      value={datasource?.footer?.affiliation || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, affiliation: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Facebook URL</label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/..."
                      value={datasource?.footer?.facebook || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, facebook: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Instagram URL</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/..."
                      value={datasource?.footer?.instagram || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, instagram: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">YouTube Channel URL</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/..."
                      value={datasource?.footer?.youtube || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, youtube: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Twitter / X URL</label>
                    <input
                      type="text"
                      placeholder="https://twitter.com/..."
                      value={datasource?.footer?.twitter || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDatasource((prev: any) => {
                          const next = { ...prev, footer: { ...prev?.footer, twitter: val } };
                          setJsonText(JSON.stringify(next, null, 2));
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WhatsApp */}
          {activeTab === "whatsapp" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-whatsapp text-emerald-600 text-lg" /> Floating WhatsApp Chat Widget Configuration
                  </h3>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                    <input
                      type="checkbox"
                      checked={(datasource?.home?.[0]?.identity?.whatsapp?.enabled ?? datasource?.whatsapp?.enabled) !== false}
                      onChange={(e) => updateWhatsAppField("enabled", e.target.checked)}
                      className="size-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">Enable Floating WhatsApp Widget</span>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">WhatsApp Contact Phone Number (Default: +91 97351 81684)</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 97351 81684"
                      value={datasource?.home?.[0]?.identity?.whatsapp?.phone || datasource?.whatsapp?.phone || "+91 97351 81684"}
                      onChange={(e) => updateWhatsAppField("phone", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Helpdesk Agent / Desk Name</label>
                    <input
                      type="text"
                      placeholder="e.g. IPS Admissions & Support"
                      value={datasource?.home?.[0]?.identity?.whatsapp?.agentName || datasource?.whatsapp?.agentName || "IPS Admissions & Support"}
                      onChange={(e) => updateWhatsAppField("agentName", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Agent Role / Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. Official Helpdesk"
                      value={datasource?.home?.[0]?.identity?.whatsapp?.agentRole || datasource?.whatsapp?.agentRole || "Official Helpdesk"}
                      onChange={(e) => updateWhatsAppField("agentRole", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Widget Position on Screen</label>
                    <select
                      value={datasource?.home?.[0]?.identity?.whatsapp?.position || datasource?.whatsapp?.position || "bottom-left"}
                      onChange={(e) => updateWhatsAppField("position", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    >
                      <option value="bottom-left">Bottom Left (Recommended)</option>
                      <option value="bottom-right">Bottom Right (Stacked)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500">Welcome Greeting Message</label>
                    <textarea
                      rows={2}
                      placeholder="Greeting text displayed when visitor opens chat box"
                      value={datasource?.home?.[0]?.identity?.whatsapp?.welcomeMessage || datasource?.whatsapp?.welcomeMessage || "Hello! Welcome to Indian Public School. How can we assist you with admissions or campus details today?"}
                      onChange={(e) => updateWhatsAppField("welcomeMessage", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none resize-y focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500">Quick Inquiry Topic Options (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="Admission Inquiry, Fee Structure, Schedule Campus Visit, General Query"
                      value={
                        Array.isArray(datasource?.home?.[0]?.identity?.whatsapp?.presetMessages)
                          ? datasource.home[0].identity.whatsapp.presetMessages.join(", ")
                          : Array.isArray(datasource?.whatsapp?.presetMessages)
                            ? datasource.whatsapp.presetMessages.join(", ")
                            : "Admission Inquiry, Fee Structure, Schedule Campus Visit, General Query"
                      }
                      onChange={(e) => {
                        const items = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                        updateWhatsAppField("presetMessages", items);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Hero */}
          {activeTab === "hero" && (
            <HomeHeroTab homeObj={homeObj} updateHome={updateHome} uploadImage={uploadImage} />
          )}

          {/* TAB: Banners */}
          {activeTab === "banner" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-flag-fill text-[#1a5d9c]" /> Sliding Banner Posters
                  </h3>
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#102a4c]">
                    <UploadCloud size={14} /> Upload New Banner Poster
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file);
                          if (url) {
                            const currentUrls = Array.isArray(homeObj.banner?.fileUrls)
                              ? homeObj.banner.fileUrls
                              : Array.isArray(homeObj.banner)
                                ? homeObj.banner.map((b: any) => typeof b === "string" ? b : b.fileUrl)
                                : [];
                            updateHome((prev) => ({
                              ...prev,
                              banner: { ...(typeof prev.banner === "object" && !Array.isArray(prev.banner) ? prev.banner : {}), fileUrls: [...currentUrls, url] },
                            }));
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    Array.isArray(homeObj.banner?.fileUrls)
                      ? homeObj.banner.fileUrls
                      : Array.isArray(homeObj.banner)
                        ? homeObj.banner
                        : []
                  ).map((item: any, idx: number) => {
                    const imgUrl = typeof item === "string" ? item : item?.fileUrl || "";
                    return (
                      <div key={idx} className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgUrl} alt={`Banner ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const currentList = Array.isArray(homeObj.banner?.fileUrls)
                              ? homeObj.banner.fileUrls
                              : Array.isArray(homeObj.banner)
                                ? homeObj.banner
                                : [];
                            const updated = currentList.filter((_: any, i: number) => i !== idx);
                            if (Array.isArray(homeObj.banner?.fileUrls)) {
                              updateHome((prev) => ({ ...prev, banner: { ...prev.banner, fileUrls: updated } }));
                            } else {
                              updateHome((prev) => ({ ...prev, banner: updated }));
                            }
                          }}
                          className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Quick Cards */}
          {activeTab === "quickCards" && (
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
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Redirect URL (e.g. /admissions)"
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
          )}

          {/* TAB: Section 1 */}
          {activeTab === "sec1" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                  <i className="bi bi-building text-[#1a5d9c]" /> Section 1: About Our School
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Section Title</label>
                    <input
                      type="text"
                      value={homeObj["section-1"]?.[0]?.heading || ""}
                      onChange={(e) => {
                        const sec = [...(homeObj["section-1"] || [{}])];
                        sec[0] = { ...sec[0], heading: e.target.value };
                        updateHome((prev) => ({ ...prev, "section-1": sec }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Sub Heading</label>
                    <input
                      type="text"
                      value={homeObj["section-1"]?.[0]?.subHeading || ""}
                      onChange={(e) => {
                        const sec = [...(homeObj["section-1"] || [{}])];
                        sec[0] = { ...sec[0], subHeading: e.target.value };
                        updateHome((prev) => ({ ...prev, "section-1": sec }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Description Paragraph 1</label>
                    <textarea
                      rows={3}
                      value={homeObj["section-1"]?.[0]?.description?.[0] || ""}
                      onChange={(e) => {
                        const sec = [...(homeObj["section-1"] || [{}])];
                        const desc = [...(sec[0].description || ["", ""])];
                        desc[0] = e.target.value;
                        sec[0] = { ...sec[0], description: desc };
                        updateHome((prev) => ({ ...prev, "section-1": sec }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">Description Paragraph 2</label>
                    <textarea
                      rows={3}
                      value={homeObj["section-1"]?.[0]?.description?.[1] || ""}
                      onChange={(e) => {
                        const sec = [...(homeObj["section-1"] || [{}])];
                        const desc = [...(sec[0].description || ["", ""])];
                        desc[1] = e.target.value;
                        sec[0] = { ...sec[0], description: desc };
                        updateHome((prev) => ({ ...prev, "section-1": sec }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Mission & Vision Cards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500">Mission & Vision Cards</label>
                    <button
                      type="button"
                      onClick={() => addItemToSection("section-1", { heading: "New Pillar", description: "Pillar details", redirectUrl: "/about" })}
                      className="flex items-center gap-1 text-xs font-bold text-[#1a5d9c] hover:underline"
                    >
                      <Plus size={13} /> Add Card
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(Array.isArray(homeObj["section-1"]?.[0]?.cardItem) ? homeObj["section-1"][0].cardItem : []).map((card: any, idx: number) => (
                      <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400">Pillar #{idx + 1}</span>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => moveItemInSection("section-1", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                              <ArrowUp size={12} />
                            </button>
                            <button type="button" onClick={() => moveItemInSection("section-1", idx, "down")} disabled={idx === homeObj["section-1"][0].cardItem.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                              <ArrowDown size={12} />
                            </button>
                            <button type="button" onClick={() => deleteItemFromSection("section-1", idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={card.heading || ""}
                          onChange={(e) => {
                            const sec = [...(homeObj["section-1"] || [{}])];
                            const cards = [...(sec[0].cardItem || [])];
                            cards[idx] = { ...cards[idx], heading: e.target.value };
                            sec[0] = { ...sec[0], cardItem: cards };
                            updateHome((prev) => ({ ...prev, "section-1": sec }));
                          }}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold outline-none"
                        />
                        <textarea
                          rows={2}
                          value={card.description || ""}
                          onChange={(e) => {
                            const sec = [...(homeObj["section-1"] || [{}])];
                            const cards = [...(sec[0].cardItem || [])];
                            cards[idx] = { ...cards[idx], description: e.target.value };
                            sec[0] = { ...sec[0], cardItem: cards };
                            updateHome((prev) => ({ ...prev, "section-1": sec }));
                          }}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campus Photo */}
                <div className="flex items-center gap-4 pt-2">
                  {homeObj["section-1"]?.[0]?.briefCard?.[0]?.fileUrl && (
                    <div className="relative h-20 w-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={homeObj["section-1"][0].briefCard[0].fileUrl} alt="Campus Aerial" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-[#1a5d9c] hover:bg-blue-50">
                    <UploadCloud size={16} /> Upload Campus Cover Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await uploadImage(file);
                          if (url) {
                            const sec = [...(homeObj["section-1"] || [{}])];
                            const briefCard = [...(sec[0].briefCard || [{}])];
                            briefCard[0] = { ...briefCard[0], fileUrl: url };
                            sec[0] = { ...sec[0], briefCard };
                            updateHome((prev) => ({ ...prev, "section-1": sec }));
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 2 */}
          {activeTab === "sec2" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-bar-chart-fill text-[#1a5d9c]" /> Section 2: Key Statistics Counters ({(homeObj["section-2"] || []).length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => addTopArrayItem("section-2", { count: "100+", heading: "New Stat", "sub-heading": "Stat description" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Stat Counter
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {(Array.isArray(homeObj["section-2"]) ? homeObj["section-2"] : []).map((stat: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-bold text-slate-400">Stat #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveTopArrayItem("section-2", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveTopArrayItem("section-2", idx, "down")} disabled={idx === homeObj["section-2"].length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => deleteTopArrayItem("section-2", idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Count (e.g. 1000+)"
                        value={stat.count || ""}
                        onChange={(e) => {
                          const stats = [...(homeObj["section-2"] || [])];
                          stats[idx] = { ...stats[idx], count: e.target.value };
                          updateHome((prev) => ({ ...prev, "section-2": stats }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-[#1a5d9c] outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Heading"
                        value={stat.heading || ""}
                        onChange={(e) => {
                          const stats = [...(homeObj["section-2"] || [])];
                          stats[idx] = { ...stats[idx], heading: e.target.value };
                          updateHome((prev) => ({ ...prev, "section-2": stats }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 3 */}
          {activeTab === "sec3" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-star-fill text-[#1a5d9c]" /> Section 3: Why Choose IPS ({(homeObj["section-3"]?.[0]?.cardItem || []).length} Cards)
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemToSection("section-3", { heading: "New Commitment", description: "Commitment details", icoUrl: "", redirectUrl: "/about" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Commitment Card
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(Array.isArray(homeObj["section-3"]?.[0]?.cardItem) ? homeObj["section-3"][0].cardItem : []).map((card: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-bold text-slate-400">Card #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveItemInSection("section-3", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveItemInSection("section-3", idx, "down")} disabled={idx === homeObj["section-3"][0].cardItem.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => deleteItemFromSection("section-3", idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={card.heading || ""}
                        onChange={(e) => {
                          const sec3 = [...(homeObj["section-3"] || [{}])];
                          const cards = [...(sec3[0].cardItem || [])];
                          cards[idx] = { ...cards[idx], heading: e.target.value };
                          sec3[0] = { ...sec3[0], cardItem: cards };
                          updateHome((prev) => ({ ...prev, "section-3": sec3 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold outline-none"
                      />
                      <textarea
                        rows={2}
                        value={card.description || ""}
                        onChange={(e) => {
                          const sec3 = [...(homeObj["section-3"] || [{}])];
                          const cards = [...(sec3[0].cardItem || [])];
                          cards[idx] = { ...cards[idx], description: e.target.value };
                          sec3[0] = { ...sec3[0], cardItem: cards };
                          updateHome((prev) => ({ ...prev, "section-3": sec3 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 4 */}
          {activeTab === "sec4" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-book-fill text-[#1a5d9c]" /> Section 4: Academic Journey Stages ({(homeObj["section-4"]?.[0]?.cardItem || []).length} Stages)
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemToSection("section-4", { heading: "Grade X – XII", mainHeading: "New Stage", description: "Stage curriculum details" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Academic Stage
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(Array.isArray(homeObj["section-4"]?.[0]?.cardItem) ? homeObj["section-4"][0].cardItem : []).map((stage: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-bold text-slate-400">Stage #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveItemInSection("section-4", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveItemInSection("section-4", idx, "down")} disabled={idx === homeObj["section-4"][0].cardItem.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => deleteItemFromSection("section-4", idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Grade range"
                          value={stage.heading || ""}
                          onChange={(e) => {
                            const sec4 = [...(homeObj["section-4"] || [{}])];
                            const stages = [...(sec4[0].cardItem || [])];
                            stages[idx] = { ...stages[idx], heading: e.target.value };
                            sec4[0] = { ...sec4[0], cardItem: stages };
                            updateHome((prev) => ({ ...prev, "section-4": sec4 }));
                          }}
                          className="w-1/2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Stage title"
                          value={stage.mainHeading || ""}
                          onChange={(e) => {
                            const sec4 = [...(homeObj["section-4"] || [{}])];
                            const stages = [...(sec4[0].cardItem || [])];
                            stages[idx] = { ...stages[idx], mainHeading: e.target.value };
                            sec4[0] = { ...sec4[0], cardItem: stages };
                            updateHome((prev) => ({ ...prev, "section-4": sec4 }));
                          }}
                          className="w-1/2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-[#1a5d9c] outline-none"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={stage.description || ""}
                        onChange={(e) => {
                          const sec4 = [...(homeObj["section-4"] || [{}])];
                          const stages = [...(sec4[0].cardItem || [])];
                          stages[idx] = { ...stages[idx], description: e.target.value };
                          sec4[0] = { ...sec4[0], cardItem: stages };
                          updateHome((prev) => ({ ...prev, "section-4": sec4 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 5 */}
          {activeTab === "sec5" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-activity text-[#1a5d9c]" /> Section 5: Co-Curricular Activities ({(homeObj["section-5"]?.[0]?.cardItem || []).length} Cards)
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemToSection("section-5", { heading: "New Activity", description: "Activity details", redirectUrl: "/about" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Activity
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(Array.isArray(homeObj["section-5"]?.[0]?.cardItem) ? homeObj["section-5"][0].cardItem : []).map((activity: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-bold text-slate-400">Activity #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveItemInSection("section-5", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveItemInSection("section-5", idx, "down")} disabled={idx === homeObj["section-5"][0].cardItem.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => deleteItemFromSection("section-5", idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={activity.heading || ""}
                        onChange={(e) => {
                          const sec5 = [...(homeObj["section-5"] || [{}])];
                          const cards = [...(sec5[0].cardItem || [])];
                          cards[idx] = { ...cards[idx], heading: e.target.value };
                          sec5[0] = { ...sec5[0], cardItem: cards };
                          updateHome((prev) => ({ ...prev, "section-5": sec5 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold outline-none"
                      />
                      <textarea
                        rows={2}
                        value={activity.description || ""}
                        onChange={(e) => {
                          const sec5 = [...(homeObj["section-5"] || [{}])];
                          const cards = [...(sec5[0].cardItem || [])];
                          cards[idx] = { ...cards[idx], description: e.target.value };
                          sec5[0] = { ...sec5[0], cardItem: cards };
                          updateHome((prev) => ({ ...prev, "section-5": sec5 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 6 */}
          {activeTab === "sec6" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-building-fill text-[#1a5d9c]" /> Section 6: Campus Infrastructure Cards ({(homeObj["section-6"]?.[0]?.cardItem || []).length} Cards)
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemToSection("section-6", { title: "New Facility", "sub-title": "Facility features", fileUrl: "" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Facility Card
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(Array.isArray(homeObj["section-6"]?.[0]?.cardItem) ? homeObj["section-6"][0].cardItem : []).map((infra: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-bold text-slate-400">Facility #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveItemInSection("section-6", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveItemInSection("section-6", idx, "down")} disabled={idx === homeObj["section-6"][0].cardItem.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => deleteItemFromSection("section-6", idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={infra.title || ""}
                        onChange={(e) => {
                          const sec6 = [...(homeObj["section-6"] || [{}])];
                          const cards = [...(sec6[0].cardItem || [])];
                          cards[idx] = { ...cards[idx], title: e.target.value };
                          sec6[0] = { ...sec6[0], cardItem: cards };
                          updateHome((prev) => ({ ...prev, "section-6": sec6 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold outline-none"
                      />
                      <input
                        type="text"
                        value={infra["sub-title"] || ""}
                        onChange={(e) => {
                          const sec6 = [...(homeObj["section-6"] || [{}])];
                          const cards = [...(sec6[0].cardItem || [])];
                          cards[idx] = { ...cards[idx], "sub-title": e.target.value };
                          sec6[0] = { ...sec6[0], cardItem: cards };
                          updateHome((prev) => ({ ...prev, "section-6": sec6 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs outline-none"
                      />
                      <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-1 text-[11px] font-bold text-[#1a5d9c] hover:bg-blue-50">
                        <UploadCloud size={13} /> Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImage(file);
                              if (url) {
                                const sec6 = [...(homeObj["section-6"] || [{}])];
                                const cards = [...(sec6[0].cardItem || [])];
                                cards[idx] = { ...cards[idx], fileUrl: url };
                                sec6[0] = { ...sec6[0], cardItem: cards };
                                updateHome((prev) => ({ ...prev, "section-6": sec6 }));
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 7 */}
          {activeTab === "sec7" && (() => {
            const sec7Data = homeObj["section-7"]?.[0] || {};
            const cardsList: Array<{ title?: string; heading?: string; fileUrl: string }> = Array.isArray(sec7Data.cardItem)
              ? sec7Data.cardItem
              : [];
            const descText = Array.isArray(sec7Data.description)
              ? sec7Data.description[0] || ""
              : typeof sec7Data.description === "string"
                ? sec7Data.description
                : "";

            return (
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                      <i className="bi bi-people-fill text-[#1a5d9c]" /> Section 7: Student Life Showcase
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-[#1a5d9c] border border-blue-100">
                      {cardsList.length} {cardsList.length === 1 ? "Image" : "Images"} configured
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Eyebrow / Sub-Heading</label>
                      <input
                        type="text"
                        placeholder="e.g. Student Life"
                        value={sec7Data.heading || ""}
                        onChange={(e) => {
                          const sec7 = [...(homeObj["section-7"] || [{}])];
                          sec7[0] = { ...sec7[0], heading: e.target.value };
                          updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1a5d9c]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Main Heading</label>
                      <input
                        type="text"
                        placeholder="e.g. A day here is never quiet"
                        value={sec7Data.mainHeading || ""}
                        onChange={(e) => {
                          const sec7 = [...(homeObj["section-7"] || [{}])];
                          sec7[0] = { ...sec7[0], mainHeading: e.target.value };
                          updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-[#1a5d9c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Section Description</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Assemblies, house matches, rehearsals, science fairs and quiet reading corners..."
                      value={descText}
                      onChange={(e) => {
                        const sec7 = [...(homeObj["section-7"] || [{}])];
                        sec7[0] = { ...sec7[0], description: [e.target.value] };
                        updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#1a5d9c] resize-none"
                    />
                  </div>
                </div>

                {/* Section 7 Images Grid Editor */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-[#102a4c]">Student Life Showcase Photos</h4>
                      <p className="text-[11px] text-slate-500">Upload multiple photos to display in the Student Life section masonry grid.</p>
                    </div>

                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1a5d9c] px-4 py-2 text-xs font-bold text-white hover:bg-[#124272] transition-colors shadow-sm">
                      <Plus size={16} /> Add Image(s)
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;
                          const currentCards = [...(homeObj["section-7"]?.[0]?.cardItem || [])];
                          for (const file of files) {
                            const url = await uploadImage(file);
                            if (url) {
                              const autoTitle = file.name
                                .replace(/\.[^/.]+$/, "")
                                .replace(/[-_]/g, " ")
                                .trim();
                              currentCards.push({ title: autoTitle, fileUrl: url });
                            }
                          }
                          const sec7 = [...(homeObj["section-7"] || [{}])];
                          sec7[0] = { ...sec7[0], cardItem: currentCards };
                          updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                          e.target.value = "";
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {cardsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center">
                      <ImageIcon className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-600">No Student Life images added yet</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Click &quot;Add Image(s)&quot; above to upload photos for this section.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {cardsList.map((card, cardIdx) => (
                        <div
                          key={`sec7-card-${cardIdx}`}
                          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 p-3 hover:border-slate-300 transition-all shadow-xs"
                        >
                          <div className="space-y-3">
                            <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                              {card.fileUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={card.fileUrl}
                                  alt={card.title || card.heading || `Student Life ${cardIdx + 1}`}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                  No image
                                </div>
                              )}
                              <span className="absolute top-2 left-2 rounded-lg bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                                #{cardIdx + 1}
                              </span>
                            </div>

                            <input
                              type="text"
                              placeholder="Image Caption / Title"
                              value={card.title || card.heading || ""}
                              onChange={(e) => {
                                const sec7 = [...(homeObj["section-7"] || [{}])];
                                const cards = [...(sec7[0].cardItem || [])];
                                cards[cardIdx] = { ...cards[cardIdx], title: e.target.value };
                                sec7[0] = { ...sec7[0], cardItem: cards };
                                updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#1a5d9c]"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200/60">
                            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-[#1a5d9c] hover:underline">
                              <UploadCloud size={14} /> Change Photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await uploadImage(file);
                                    if (url) {
                                      const sec7 = [...(homeObj["section-7"] || [{}])];
                                      const cards = [...(sec7[0].cardItem || [])];
                                      cards[cardIdx] = { ...cards[cardIdx], fileUrl: url };
                                      sec7[0] = { ...sec7[0], cardItem: cards };
                                      updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                                    }
                                  }
                                }}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                const sec7 = [...(homeObj["section-7"] || [{}])];
                                const cards = (sec7[0].cardItem || []).filter((_: any, idx: number) => idx !== cardIdx);
                                sec7[0] = { ...sec7[0], cardItem: cards };
                                updateHome((prev) => ({ ...prev, "section-7": sec7 }));
                              }}
                              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete photo"
                            >
                              <Trash2 size={13} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* TAB: Video Setup */}
          {activeTab === "video" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-camera-video-fill text-[#1a5d9c]" /> Campus Introduction Video Setup
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                    Controls IntroVideo section &amp; site_datasource media
                  </span>
                </div>

                {(() => {
                  const secVid = homeObj["section-video"]?.[0] || {};
                  const sec8 = homeObj["section-8"]?.[0] || {};
                  const eyebrowVal = secVid.eyebrow || sec8.videoEyebrow || "Discover IPS";
                  const titleVal = secVid.title || secVid.heading || sec8.videoTitle || "Experience life at Indian Public School";
                  const descVal = secVid.description || sec8.videoDescription || "Take a look at the campus, learning spaces and student life.";
                  const FALLBACK_SEED_VIDEO = "https://www.indianpublicschool.in/assets/img/IPS.mp4";
                  let videoUrlVal = secVid.introFileUrl || secVid.videoUrl || sec8.introFileUrl || sec8.videoUrl;
                  if (!videoUrlVal || videoUrlVal === "/IPSIntroVideo.mp4") {
                    videoUrlVal = FALLBACK_SEED_VIDEO;
                  }
                  const folderVal = secVid.cloudinaryFolder || sec8.cloudinaryFolder || "indian-public-school/assets/Videos";

                  const updateVideoData = (updates: Record<string, any>) => {
                    updateHome((prev) => {
                      const prevVid = prev["section-video"]?.[0] || {};
                      const prevSec8 = prev["section-8"]?.[0] || {};
                      const newVid = { ...prevVid, ...updates };
                      const newSec8 = { ...prevSec8, ...updates };
                      return {
                        ...prev,
                        "section-video": [newVid],
                        "section-8": [newSec8],
                      };
                    });
                  };

                  const autoPlayVal = secVid.autoPlay ?? sec8.autoPlay ?? true;
                  const loopVal = secVid.loop ?? sec8.loop ?? true;
                  const mutedVal = secVid.muted ?? sec8.muted ?? true;
                  const controlsVal = secVid.controls ?? sec8.controls ?? true;
                  const posterVal = secVid.poster || sec8.poster || secVid.posterUrl || sec8.posterUrl || "";

                  return (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Eyebrow Tagline</label>
                          <input
                            type="text"
                            placeholder="e.g. Discover IPS"
                            value={eyebrowVal}
                            onChange={(e) => updateVideoData({ eyebrow: e.target.value, videoEyebrow: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1a5d9c]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Main Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Experience life at Indian Public School"
                            value={titleVal}
                            onChange={(e) => updateVideoData({ title: e.target.value, heading: e.target.value, videoTitle: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#1a5d9c]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Description</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Take a look at the campus, learning spaces and student life."
                          value={descVal}
                          onChange={(e) => updateVideoData({ description: e.target.value, videoDescription: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#1a5d9c]"
                        />
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                        <label className="text-[11px] font-bold text-[#102a4c] flex items-center gap-1.5">
                          Video Playback Controls &amp; Player Settings
                        </label>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-100 transition">
                            <input
                              type="checkbox"
                              checked={autoPlayVal}
                              onChange={(e) => updateVideoData({ autoPlay: e.target.checked })}
                              className="rounded text-[#1a5d9c] focus:ring-[#1a5d9c]"
                            />
                            <span>AutoPlay Video on Load</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-100 transition">
                            <input
                              type="checkbox"
                              checked={loopVal}
                              onChange={(e) => updateVideoData({ loop: e.target.checked })}
                              className="rounded text-[#1a5d9c] focus:ring-[#1a5d9c]"
                            />
                            <span>Loop Video Continuously</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-100 transition">
                            <input
                              type="checkbox"
                              checked={mutedVal}
                              onChange={(e) => updateVideoData({ muted: e.target.checked })}
                              className="rounded text-[#1a5d9c] focus:ring-[#1a5d9c]"
                            />
                            <span>Mute Audio by Default</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-100 transition">
                            <input
                              type="checkbox"
                              checked={controlsVal}
                              onChange={(e) => updateVideoData({ controls: e.target.checked })}
                              className="rounded text-[#1a5d9c] focus:ring-[#1a5d9c]"
                            />
                            <span>Show Player Controls (Play/Pause, Sound)</span>
                          </label>
                        </div>

                        <div className="space-y-1 pt-1">
                          <label className="text-[11px] font-bold text-slate-600">Video Poster / Thumbnail Frame URL (Optional)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="e.g. https://res.cloudinary.com/.../poster.jpg"
                              value={posterVal}
                              onChange={(e) => updateVideoData({ poster: e.target.value, posterUrl: e.target.value })}
                              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono outline-none focus:border-[#1a5d9c]"
                            />
                            <label className="flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#1a5d9c] hover:bg-blue-50 shrink-0">
                              <UploadCloud size={14} /> Upload Thumbnail
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await uploadImage(file, "Home", folderVal);
                                    if (url) {
                                      updateVideoData({ poster: url, posterUrl: url });
                                    }
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-[#102a4c] flex items-center gap-1.5">
                            Cloudinary Target Storage Location / Folder
                          </label>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                            Direct Cloudinary Upload
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. indian-public-school/assets/Videos"
                          value={folderVal}
                          onChange={(e) => updateVideoData({ cloudinaryFolder: e.target.value })}
                          className="w-full rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 outline-none focus:border-[#1a5d9c]"
                        />
                        <p className="text-[11px] text-slate-500">
                          Videos uploaded here will be stored in your Cloudinary account at path: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">{folderVal}</code>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-600">Video File URL (Cloudinary Link or MP4 Path)</label>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            placeholder="e.g. https://res.cloudinary.com/.../IPSIntroVideo.mp4"
                            value={videoUrlVal}
                            onChange={(e) => updateVideoData({ introFileUrl: e.target.value, videoUrl: e.target.value })}
                            className="flex-1 min-w-[240px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-[#1a5d9c]"
                          />
                          <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-blue-500 bg-[#1a5d9c] px-4 py-2 text-xs font-bold text-white hover:bg-[#102a4c] transition shrink-0 shadow-xs">
                            <UploadCloud size={16} /> Upload Video to Cloudinary
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await uploadImage(file, "Videos", folderVal);
                                  if (url) {
                                    updateVideoData({ introFileUrl: url, videoUrl: url });
                                  }
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          {videoUrlVal && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Are you sure you want to remove the video from your layout?")) {
                                  updateVideoData({ introFileUrl: "", videoUrl: "" });
                                }
                              }}
                              className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 hover:text-red-700 transition shrink-0"
                            >
                              <Trash2 size={14} /> Delete Video
                            </button>
                          )}
                        </div>
                      </div>

                      {videoUrlVal && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-600">Live Video Preview</label>
                            {videoUrlVal.includes("cloudinary.com") && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Hosted on Cloudinary
                              </span>
                            )}
                          </div>
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 aspect-video max-h-64 flex items-center justify-center">
                            <video
                              key={videoUrlVal}
                              controls
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="h-full w-full object-contain"
                            >
                              <source src={videoUrlVal} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB: Section 8 */}
          {activeTab === "sec8" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-mortarboard-fill text-[#1a5d9c]" /> Section 8: Our Courses ({(homeObj["section-8"]?.[0]?.cardItem || []).length} Level Cards)
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemToSection("section-8", { title: "New Level", description: "Course level details", fileUrl: "" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Course Level
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {(Array.isArray(homeObj["section-8"]?.[0]?.cardItem) ? homeObj["section-8"][0].cardItem : []).map((course: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="text-[11px] font-bold text-slate-400">Course Level #{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveItemInSection("section-8", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp size={12} />
                          </button>
                          <button type="button" onClick={() => moveItemInSection("section-8", idx, "down")} disabled={idx === homeObj["section-8"][0].cardItem.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" onClick={() => deleteItemFromSection("section-8", idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {course.fileUrl && (
                          <div className="relative h-16 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={course.fileUrl} alt={course.title} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={course.title || ""}
                          onChange={(e) => {
                            const sec8 = [...(homeObj["section-8"] || [{}])];
                            const cards = [...(sec8[0].cardItem || [])];
                            cards[idx] = { ...cards[idx], title: e.target.value };
                            sec8[0] = { ...sec8[0], cardItem: cards };
                            updateHome((prev) => ({ ...prev, "section-8": sec8 }));
                          }}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold outline-none"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={course.description || ""}
                        onChange={(e) => {
                          const sec8 = [...(homeObj["section-8"] || [{}])];
                          const cards = [...(sec8[0].cardItem || [])];
                          cards[idx] = { ...cards[idx], description: e.target.value };
                          sec8[0] = { ...sec8[0], cardItem: cards };
                          updateHome((prev) => ({ ...prev, "section-8": sec8 }));
                        }}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs outline-none"
                      />
                      <label className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-1 text-[11px] font-bold text-[#1a5d9c] hover:bg-blue-50">
                        <UploadCloud size={13} /> Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImage(file);
                              if (url) {
                                const sec8 = [...(homeObj["section-8"] || [{}])];
                                const cards = [...(sec8[0].cardItem || [])];
                                cards[idx] = { ...cards[idx], fileUrl: url };
                                sec8[0] = { ...sec8[0], cardItem: cards };
                                updateHome((prev) => ({ ...prev, "section-8": sec8 }));
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 9 */}
          {activeTab === "sec9" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                  <i className="bi bi-person-badge-fill text-[#1a5d9c]" /> Section 9: Best CBSE School / Director Message
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Heading"
                    value={homeObj["section-9"]?.[0]?.heading || ""}
                    onChange={(e) => {
                      const sec9 = [...(homeObj["section-9"] || [{}])];
                      sec9[0] = { ...sec9[0], heading: e.target.value };
                      updateHome((prev) => ({ ...prev, "section-9": sec9 }));
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none"
                  />
                  <input
                    type="text"
                    placeholder="SubHeading"
                    value={homeObj["section-9"]?.[0]?.subHeading || ""}
                    onChange={(e) => {
                      const sec9 = [...(homeObj["section-9"] || [{}])];
                      sec9[0] = { ...sec9[0], subHeading: e.target.value };
                      updateHome((prev) => ({ ...prev, "section-9": sec9 }));
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder="Description"
                  value={homeObj["section-9"]?.[0]?.description || ""}
                  onChange={(e) => {
                    const sec9 = [...(homeObj["section-9"] || [{}])];
                    sec9[0] = { ...sec9[0], description: e.target.value };
                    updateHome((prev) => ({ ...prev, "section-9": sec9 }));
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Director Photo */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">Director / Intro Photo</span>
                    <div className="flex items-center gap-3">
                      {homeObj["section-9"]?.[0]?.fileUrls?.[0] && (
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={homeObj["section-9"][0].fileUrls[0]} alt="Director" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-[#1a5d9c] hover:bg-blue-50">
                        <UploadCloud size={14} /> Upload Director Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImage(file);
                              if (url) {
                                const sec9 = [...(homeObj["section-9"] || [{}])];
                                sec9[0] = { ...sec9[0], fileUrls: [url] };
                                updateHome((prev) => ({ ...prev, "section-9": sec9 }));
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Admissions Banner Background */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 block">Admissions Banner Background</span>
                    <div className="flex items-center gap-3">
                      {homeObj["section-9"]?.[0]?.bgImageUrl && (
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={homeObj["section-9"][0].bgImageUrl} alt="Banner Background" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-[#1a5d9c] hover:bg-blue-50">
                        <UploadCloud size={14} /> Upload Banner Background
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await uploadImage(file);
                              if (url) {
                                const sec9 = [...(homeObj["section-9"] || [{}])];
                                sec9[0] = { ...sec9[0], bgImageUrl: url };
                                updateHome((prev) => ({ ...prev, "section-9": sec9 }));
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Section 10 */}
          {activeTab === "sec10" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#102a4c] flex items-center gap-2">
                    <i className="bi bi-newspaper text-[#1a5d9c]" /> Section 10: News & Notice Board Items ({(homeObj["section-10"]?.[0]?.list || []).length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemToSection("section-10", { title: "New School Notice / Announcement", createdAt: new Date().toISOString(), redirectUrl: "/news" })}
                    className="flex items-center gap-1 rounded-xl bg-[#1a5d9c] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#102a4c]"
                  >
                    <Plus size={14} /> Add Notice Item
                  </button>
                </div>

                <div className="space-y-3">
                  {(Array.isArray(homeObj["section-10"]?.[0]?.list) ? homeObj["section-10"][0].list : []).map((news: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                      <div className="flex flex-col items-center gap-0.5 shrink-0">
                        <button type="button" onClick={() => moveItemInSection("section-10", idx, "up")} disabled={idx === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                          <ArrowUp size={12} />
                        </button>
                        <button type="button" onClick={() => moveItemInSection("section-10", idx, "down")} disabled={idx === homeObj["section-10"][0].list.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">
                          <ArrowDown size={12} />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Notice / Event Title"
                        value={news.title || ""}
                        onChange={(e) => {
                          const sec10 = [...(homeObj["section-10"] || [{}])];
                          const list = [...(sec10[0].list || [])];
                          list[idx] = { ...list[idx], title: e.target.value };
                          sec10[0] = { ...sec10[0], list };
                          updateHome((prev) => ({ ...prev, "section-10": sec10 }));
                        }}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Target Link / PDF URL"
                        value={news.redirectUrl || ""}
                        onChange={(e) => {
                          const sec10 = [...(homeObj["section-10"] || [{}])];
                          const list = [...(sec10[0].list || [])];
                          list[idx] = { ...list[idx], redirectUrl: e.target.value };
                          sec10[0] = { ...sec10[0], list };
                          updateHome((prev) => ({ ...prev, "section-10": sec10 }));
                        }}
                        className="w-1/3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => deleteItemFromSection("section-10", idx)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                        title="Delete Notice Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Raw JSON */}
          {activeTab === "rawJson" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                <i className="bi bi-code-slash text-[#1a5d9c]" /> Advanced Raw JSON Schema Editor for all sections
              </p>
              <textarea
                rows={22}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-emerald-400 outline-none leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <span className="text-xs text-slate-500 font-medium">
            Editing <strong className="text-[#1a5d9c]">{activeTab}</strong> — edits update the live datasource instantly.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? <span className="animate-spin">⏳</span> : null}
              <span>Save & Publish Layout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
