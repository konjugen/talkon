"use client";

import React from "react";
import { Mic, Check, X } from "lucide-react";

interface InvitationBannerProps {
  moderatorHandle: string;
  onAccept: () => void;
  onReject: () => void;
}

export const InvitationBanner: React.FC<InvitationBannerProps> = ({
  moderatorHandle,
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border border-purple-500/50 backdrop-blur-md rounded-2xl p-4 shadow-2xl text-white animate-in slide-in-from-top-6 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0 text-purple-300">
          <Mic className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-purple-100">Konuşma Daveti!</h4>
          <p className="text-xs text-purple-200/80 truncate">
            <span className="font-medium text-white">{moderatorHandle}</span> sizi sahneye davet etti.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onReject}
            className="p-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 transition-colors"
            title="Reddet"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={onAccept}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Check className="w-3.5 h-3.5" />
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
};
