"use client";

import React from "react";
import { Mic, MicOff, ShieldAlert, Users, Radio, Globe } from "lucide-react";
import { TalkOnRoom, TalkOnUser } from "@/types/talkon";
import { Avatar } from "./Avatar";

interface RoomStageProps {
  room: TalkOnRoom;
  speakers: TalkOnUser[];
  listeners: TalkOnUser[];
}

export const RoomStage: React.FC<RoomStageProps> = ({
  room,
  speakers,
  listeners,
}) => {
  return (
    <div className="flex flex-col bg-neutral-900/40 rounded-2xl border border-neutral-800 p-4 shadow-inner">
      {/* Room Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Radio className="w-3 h-3 animate-pulse" />
              CANLI
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-800 text-neutral-300">
              <Globe className="w-3 h-3 text-neutral-400" />
              {room.country} • {room.language}
            </span>
            <span className="text-xs text-purple-400 font-medium">#{room.topic}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white truncate">{room.title}</h2>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-800/80 text-xs font-medium text-neutral-300 shrink-0">
          <Users className="w-4 h-4 text-neutral-400" />
          <span>{listeners.length + speakers.length}</span>
        </div>
      </div>

      {/* Stage: Speakers Podium */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Sahne ({speakers.length}/{room.maxSpeakers})
          </h3>
          <span className="text-[11px] text-neutral-500">Konuşmacı Koltukları</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {speakers.map((speaker) => {
            const isMod = speaker.role === "moderator";

            return (
              <div
                key={speaker.id}
                className={`relative flex flex-col items-center p-3 rounded-2xl bg-neutral-800/50 border transition-all ${
                  speaker.isSpeaking
                    ? "border-emerald-500 shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-500/30"
                    : "border-neutral-750 border-neutral-700/40"
                }`}
              >
                <div className="relative mb-2">
                  <Avatar seed={speaker.avatarSeed} size="lg" />

                  {/* Mic status badge */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-neutral-900 shadow-sm ${
                      speaker.isMuted
                        ? "bg-rose-500 text-white"
                        : "bg-emerald-500 text-white animate-pulse"
                    }`}
                  >
                    {speaker.isMuted ? (
                      <MicOff className="w-3 h-3" />
                    ) : (
                      <Mic className="w-3 h-3" />
                    )}
                  </div>
                </div>

                <div className="text-center w-full px-1">
                  <p className="text-xs font-semibold text-white truncate">
                    {speaker.handle}
                  </p>
                  <span
                    className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 ${
                      isMod
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    {isMod ? "Moderatör" : "Konuşmacı"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audience / Listeners Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Dinleyiciler ({listeners.length})
          </h3>
          <span className="text-[11px] text-neutral-500">Anonim Katılımcılar</span>
        </div>

        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-neutral-950/40 rounded-xl border border-neutral-800/60">
          {listeners.length === 0 ? (
            <p className="text-xs text-neutral-500 italic p-1">Henüz başka dinleyici yok.</p>
          ) : (
            listeners.map((listener) => (
              <div
                key={listener.id}
                title={listener.handle}
                className="group relative flex items-center"
              >
                <Avatar seed={listener.avatarSeed} size="sm" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
