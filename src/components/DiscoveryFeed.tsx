"use client";

import React, { useState } from "react";
import { Radio, Users, Globe, Plus, Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { TalkOnRoom, TalkOnUser } from "@/types/talkon";
import { Avatar } from "./Avatar";

interface DiscoveryFeedProps {
  rooms: TalkOnRoom[];
  onSelectRoom: (roomId: string) => void;
  onOpenCreateModal: () => void;
  currentUser: TalkOnUser;
}

const COUNTRIES = [
  { id: "all", label: "Tüm Ülkeler", flag: "🌍" },
  { id: "Türkiye", label: "Türkiye", flag: "🇹🇷" },
  { id: "France", label: "France", flag: "🇫🇷" },
  { id: "Italy", label: "Italy", flag: "🇮🇹" },
];

const TOPICS = [
  "Tümü",
  "Gündem",
  "Teknoloji & Yapay Zeka",
  "Ekonomi & Finans",
  "Gece İtirafları",
  "Felsefe & Yaşam",
  "Tarih & Kültür",
];

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({
  rooms,
  onSelectRoom,
  onOpenCreateModal,
  currentUser,
}) => {
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("Tümü");

  const filteredRooms = rooms.filter((room) => {
    const matchesCountry =
      selectedCountry === "all" || room.country === selectedCountry;
    const matchesTopic =
      selectedTopic === "Tümü" || room.topic === selectedTopic;
    return matchesCountry && matchesTopic;
  });

  return (
    <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Hero / Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-neutral-900/60 to-indigo-950/30 border border-purple-900/30 shadow-xl backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-2">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Canlı Ses & Fikir Odaları</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Konuşmaları Keşfet & Katıl
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-lg leading-relaxed">
            Dinleyin, en fazla 15 kelimelik kısa fikirler paylaşın veya moderatörün davetiyle sahneye çıkıp konuşun.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="self-start sm:self-center px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-purple-950/60 flex items-center gap-2 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Oda Başlat</span>
        </button>
      </div>

      {/* Country Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {COUNTRIES.map((country) => {
          const isActive = selectedCountry === country.id;
          return (
            <button
              key={country.id}
              onClick={() => setSelectedCountry(country.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-purple-600 text-white shadow-md shadow-purple-950/50"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-850"
              }`}
            >
              <span>{country.flag}</span>
              <span>{country.label}</span>
            </button>
          );
        })}
      </div>

      {/* Topic Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TOPICS.map((topic) => {
          const isActive = selectedTopic === topic;
          return (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-neutral-100 text-neutral-950 font-semibold"
                  : "bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-neutral-800/60"
              }`}
            >
              #{topic}
            </button>
          );
        })}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRooms.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-neutral-900/30 rounded-3xl border border-neutral-800 p-8">
            <Radio className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-300">Bu kategoride açık oda bulunamadı</p>
            <p className="text-xs text-neutral-500 mt-1">Hemen ilk odayı siz başlatabilirsiniz.</p>
            <button
              onClick={onOpenCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors"
            >
              Oda Oluştur
            </button>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className="group cursor-pointer flex flex-col justify-between p-5 rounded-3xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-purple-500/40 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-purple-950/20"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Radio className="w-2.5 h-2.5 animate-pulse" />
                      CANLI
                    </span>
                    <span className="text-xs text-purple-400 font-medium">#{room.topic}</span>
                  </div>

                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-neutral-500" />
                    {room.country}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                  {room.title}
                </h3>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-800/80">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar seed={room.moderatorHandle} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-200 truncate">
                      {room.moderatorHandle}
                    </p>
                    <span className="text-[10px] text-neutral-500">Moderatör</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-neutral-400">
                    <Users className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{room.listenersCount + room.activeSpeakersCount}</span>
                  </div>

                  <button className="px-3 py-1.5 rounded-xl bg-purple-600/20 group-hover:bg-purple-600 text-purple-300 group-hover:text-white text-xs font-semibold flex items-center gap-1 transition-all">
                    <span>Katıl</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
