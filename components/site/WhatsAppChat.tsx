"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCheck, MessageSquare, Send, X } from "lucide-react";
import { useSiteData } from "@/components/site/SiteDataProvider";
import { getWhatsAppConfig } from "@/lib/site-data";

export function WhatsAppChat() {
  const siteData = useSiteData();
  const config = getWhatsAppConfig(siteData);
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState("");

  if (!config.enabled) return null;

  const rawPhone = config.phone.replace(/[^0-9]/g, "");
  const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || userMessage || "Hello! I would like to inquire about Indian Public School.";
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const isLeft = config.position === "bottom-left";
  const positionClasses = isLeft
    ? "bottom-4 left-4 sm:bottom-6 sm:left-6"
    : "bottom-20 right-4 sm:bottom-24 sm:right-6";

  return (
    <div className={`fixed ${positionClasses} z-50 flex flex-col items-${isLeft ? "start" : "end"}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3 w-[330px] sm:w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="bg-[#075E54] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex size-11 items-center justify-center rounded-full bg-white/10 text-white border border-white/20">
                  <WhatsAppIcon className="size-6 fill-current text-emerald-400" />
                  <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-400 ring-2 ring-[#075E54]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight text-white">{config.agentName}</h4>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 mt-0.5">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {config.agentRole} · Online
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 space-y-3.5 bg-[#efeae2]/60 min-h-[220px] max-h-[320px] overflow-y-auto">
              <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-white p-3 shadow-sm border border-slate-100 text-xs text-slate-800 space-y-1">
                <p className="font-medium leading-relaxed">{config.welcomeMessage}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-1">
                  <span>Just now</span>
                  <CheckCheck className="size-3 text-emerald-600" />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              {config.presetMessages.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
                    Quick Inquiry Topics:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {config.presetMessages.map((msg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setUserMessage(msg);
                          handleSendMessage(msg);
                        }}
                        className="rounded-full border border-emerald-200 bg-white/90 hover:bg-emerald-50 text-[11px] font-semibold text-emerald-800 px-3 py-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-95 text-left"
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="flex size-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95"
                  aria-label="Send WhatsApp message"
                >
                  <Send className="size-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1">
                <span>Phone: {config.phone}</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <MessageSquare className="size-3" /> WhatsApp Direct
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Trigger Button - Styled exactly like user image */}
      <motion.button
        type="button"
        aria-label="Open WhatsApp Chat"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="relative group grid size-14 place-items-center rounded-full bg-[#1a365d] shadow-2xl transition-all duration-300 border border-slate-700/30"
      >
        <span className="relative grid size-10 place-items-center rounded-full bg-[#25D366] text-white ring-2 ring-white shadow-sm">
          <WhatsAppIcon className="size-6 fill-current text-white" />
        </span>

        {/* Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#1a365d]/40 animate-ping -z-10 group-hover:hidden" />

        {/* Notification Badge */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 shadow-md border-2 border-white">
            1
          </span>
        )}
      </motion.button>
    </div>
  );
}

function WhatsAppIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm.058 3.6a6.342 6.342 0 00-5.467 9.57l-.358 1.306 1.353-.355a6.342 6.342 0 104.472-10.521zm3.684 8.892c-.156.438-.913.842-1.26.877-.348.036-.788.163-2.617-.591-2.207-.91-3.606-3.18-3.716-3.328-.11-.148-.897-1.192-.897-2.274 0-1.082.568-1.615.77-1.834.202-.218.44-.273.587-.273.147 0 .294.002.422.008.136.006.32-.052.502.385.183.438.623 1.517.678 1.626.055.11.092.238.018.384-.073.146-.11.238-.22.366-.11.128-.231.286-.33.385-.11.11-.225.228-.097.447.128.219.57 1.01 1.226 1.593.843.748 1.554.981 1.774 1.09.219.11.348.092.477-.055.128-.146.55-.639.696-.858.147-.219.293-.183.495-.11.202.073 1.284.605 1.504.715.22.11.367.165.422.256.055.092.055.53-.101.968z"
      />
    </svg>
  );
}
