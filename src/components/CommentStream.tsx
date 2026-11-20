"use client";

import React, { useState, useEffect } from "react";
import { Heart, Mic, Clock, History } from "lucide-react";
import { TalkOnComment } from "@/types/talkon";
import { Avatar } from "./Avatar";

interface CommentStreamProps {
  comments: TalkOnComment[];
  currentUserId: string;
  isModerator: boolean;
  onLikeComment: (commentId: string) => void;
  onInviteUser: (userId: string, userHandle: string) => void;
}

export const CommentStream: React.FC<CommentStreamProps> = ({
  comments,
  currentUserId,
  isModerator,
  onLikeComment,
  onInviteUser,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [now, setNow] = useState<number>(0);

  // Update clock every 2 seconds to handle 20s visual expiration smoothly
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Visual filter: Only show comments created in last 20 seconds, unless history mode is on
  const visibleComments = showHistory || now === 0
    ? comments
    : comments.filter((c) => now - c.createdAt < 20000);

  return (
    <div className="flex flex-col h-full">
      {/* Header with History toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-neutral-500" />
          <span>{showHistory ? "Tüm Yorum Geçmişi" : "Canlı Akış (15-20 sn kaybolur)"}</span>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          <span>{showHistory ? "Canlıya Dön" : "Geçmiş"}</span>
        </button>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {visibleComments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 text-xs">
            <p>Henüz yorum yok ya da süresi doldu.</p>
            <p className="mt-1 text-neutral-600">Aşağıdaki kutudan max 15 kelimelik bir fikir paylaşın!</p>
          </div>
        ) : (
          visibleComments.map((comment) => {
            const ageSeconds = Math.floor((now - comment.createdAt) / 1000);
            const isFading = !showHistory && ageSeconds > 15;

            return (
              <div
                key={comment.id}
                className={`group flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800/80 transition-all duration-500 ${
                  isFading ? "opacity-35 scale-[0.98]" : "opacity-100"
                }`}
              >
                <Avatar seed={comment.avatarSeed} size="sm" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-medium text-neutral-300 truncate">
                      {comment.userHandle}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {ageSeconds < 60 ? `${ageSeconds} sn` : `${Math.floor(ageSeconds / 60)} dk`}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-100 font-normal break-words leading-relaxed">
                    {comment.text}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-800/50">
                    {/* Like button */}
                    <button
                      onClick={() => onLikeComment(comment.id)}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${
                        comment.likedByMe
                          ? "text-rose-500 font-semibold"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          comment.likedByMe ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                      <span>{comment.likesCount}</span>
                    </button>

                    {/* Moderator Invite button (Comment-to-Invite mechanic) */}
                    {isModerator && comment.userId !== currentUserId && (
                      <button
                        onClick={() => onInviteUser(comment.userId, comment.userHandle)}
                        className="opacity-90 hover:opacity-100 flex items-center gap-1 text-[11px] font-medium bg-purple-900/60 hover:bg-purple-800 text-purple-200 px-2 py-1 rounded-lg border border-purple-700/50 transition-all"
                      >
                        <Mic className="w-3 h-3" />
                        <span>Davet Et</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
