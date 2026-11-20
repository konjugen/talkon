"use client";

import React, { useState } from "react";
import { Mic, MicOff, Send, LogOut, AlertCircle } from "lucide-react";
import { countWords } from "@/lib/utils";

interface ControlsBarProps {
  isOnStage: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onSendComment: (text: string) => void;
  onLeaveRoom: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  isOnStage,
  isMuted,
  onToggleMute,
  onSendComment,
  onLeaveRoom,
}) => {
  const [commentText, setCommentText] = useState("");
  const wordCount = countWords(commentText);
  const isOverLimit = wordCount > 15;
  const canSend = commentText.trim().length > 0 && !isOverLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    onSendComment(commentText.trim());
    setCommentText("");
  };

  return (
    <div className="bg-neutral-900/90 border-t border-neutral-800 p-3 backdrop-blur-md">
      <div className="max-w-2xl mx-auto flex flex-col gap-2">
        {/* Comment Input Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Fikrini paylaş (en fazla 15 kelime)..."
              className={`w-full px-4 py-2.5 pr-20 rounded-xl bg-neutral-950 border text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                isOverLimit
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-neutral-800 focus:border-purple-500"
              }`}
            />
            {/* Word count badge */}
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                isOverLimit
                  ? "bg-rose-500/20 text-rose-400 font-semibold"
                  : wordCount === 15
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-neutral-800 text-neutral-400"
              }`}
            >
              {wordCount} / 15
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSend}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white transition-colors flex items-center justify-center shrink-0 shadow-md shadow-purple-950/50"
            title="Gönder"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {isOverLimit && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 px-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Yorumunuz 15 kelimeden uzun olamaz. Lütfen kısaltın.</span>
          </div>
        )}

        {/* Action Controls (Mute & Leave) */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {isOnStage ? (
              <button
                onClick={onToggleMute}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isMuted
                    ? "bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30"
                    : "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30"
                }`}
              >
                {isMuted ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    <span>Mikrofon Kapalı</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mikrofon Açık</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-[11px] text-neutral-500">
                Dinleyici Modu (Sadece dinliyorsunuz)
              </span>
            )}
          </div>

          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ayrıl</span>
          </button>
        </div>
      </div>
    </div>
  );
};
