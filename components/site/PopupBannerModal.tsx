"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSiteData } from "@/components/site/SiteDataProvider";
import { getPopupBannerConfig } from "@/lib/site-data";
import { openAdmissionModal } from "@/components/site/AdmissionApplicationModal";

export function PopupBannerModal() {
  const siteData = useSiteData();
  const config = getPopupBannerConfig(siteData);

  const [isOpen, setIsOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (!config.enabled || !config.imageUrl) return;

    if (config.onlyOncePerSession) {
      const dismissed = sessionStorage.getItem("ips_popup_dismissed");
      if (dismissed === "true") return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, Math.max(500, config.delaySeconds * 1000));

    return () => clearTimeout(timer);
  }, [config.enabled, config.imageUrl, config.delaySeconds, config.onlyOncePerSession]);

  const handleClose = () => {
    setIsOpen(false);
    if (config.onlyOncePerSession) {
      sessionStorage.setItem("ips_popup_dismissed", "true");
    }
  };

  const handleEnquiry = () => {
    setIsOpen(false);
    if (config.onlyOncePerSession) {
      sessionStorage.setItem("ips_popup_dismissed", "true");
    }
    openAdmissionModal();
  };

  // Helper functions for dynamic sizing
  const getMaxWidthClass = () => {
    switch (config.modalWidth) {
      case "sm":
        return "max-w-md";
      case "md":
        return "max-w-lg";
      case "lg":
        return "max-w-xl";
      case "xl":
        return "max-w-3xl";
      case "full":
        return "max-w-[92vw]";
      case "custom":
        return "";
      default:
        return "max-w-xl";
    }
  };

  const getAspectRatioClass = () => {
    switch (config.aspectRatio) {
      case "16/9":
        return "aspect-[16/9]";
      case "16/10":
        return "aspect-[16/10]";
      case "4/3":
        return "aspect-[4/3]";
      case "1/1":
        return "aspect-square";
      case "3/2":
        return "aspect-[3/2]";
      case "2/1":
        return "aspect-[2/1]";
      default:
        return "aspect-[16/10]";
    }
  };

  if (!isOpen || !config.enabled || !config.imageUrl) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#082A52]/80 backdrop-blur-md transition-opacity"
          />

          {/* Dynamic Full-Bleed Poster Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full ${getMaxWidthClass()} ${getAspectRatioClass()} overflow-hidden border border-amber-400/30 bg-slate-950 text-white shadow-2xl my-auto flex flex-col justify-end transition-all group`}
            style={{
              maxWidth: (config.modalWidth === "custom" || config.imageWidth) ? `${config.imageWidth}px` : undefined,
              height: config.imageMaxHeight ? `${config.imageMaxHeight}px` : undefined,
              borderRadius: `${config.imageBorderRadius || 24}px`,
            }}
          >
            {/* Background Image Poster */}
            <img
              src={config.imageUrl}
              alt={config.title || "Indian Public School Announcement"}
              className={`absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                config.showImageZoomOnClick ? "cursor-zoom-in" : ""
              }`}
              style={{
                objectFit: config.imageFit || "cover",
                objectPosition: config.imagePosition || "center",
              }}
              onClick={() => config.showImageZoomOnClick && setIsLightboxOpen(true)}
            />

            {/* Dark Scrim Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent pointer-events-none" />

            {/* Bottom Overlay Content Area */}
            <div className="relative z-10 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              {/* Title & Subtitle */}
              <div className="space-y-0.5 max-w-[62%] sm:max-w-[55%]">
                {config.title && (
                  <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
                    {config.title}
                  </h2>
                )}
                {config.subtitle && (
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#F4C430] uppercase tracking-wider drop-shadow-xs">
                    {config.subtitle}
                  </p>
                )}
              </div>

              {/* Action Buttons: Enquiry (Gold/Amber - Left) & Close (Red - Right) */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {/* Enquiry Button - Amber/Gold Pill */}
                <button
                  type="button"
                  onClick={handleEnquiry}
                  className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-[11px] sm:text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md shadow-amber-500/20 border border-amber-400/40 cursor-pointer transform active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <i className="bi bi-pencil-square text-xs text-[#F4C430]" />
                  {config.enquiryButtonText || "Enquiry Now"}
                </button>

                {/* Close Button - Red Pill (Right Side) */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-[11px] sm:text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md shadow-red-600/20 border border-red-400/40 cursor-pointer transform active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <i className="bi bi-x-lg text-[10px]" />
                  {config.closeButtonText || "Close"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Fullscreen Lightbox when clicking image */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-5 right-5 z-10 grid size-10 place-items-center rounded-full bg-red-600 text-white hover:bg-red-700 transition cursor-pointer border border-red-400/40 shadow-xl"
              title="Close Full Image"
            >
              <i className="bi bi-x-lg text-base" />
            </button>
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={config.imageUrl}
              alt="Full Announcement Poster"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
