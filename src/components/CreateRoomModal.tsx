"use client";

import React, { useState } from "react";
import { X, Radio, Sparkles } from "lucide-react";
import { TalkOnRoom } from "@/types/talkon";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: Omit<TalkOnRoom, "id" | "moderatorId" | "moderatorHandle" | "activeSpeakersCount" | "listenersCount" | "isLive" | "createdAt">) => void;
}

const TOPICS = [
  "Gündem",
  "Teknoloji & Yapay Zeka",
  "Ekonomi & Finans",
  "Gece İtirafları",
  "Felsefe & Yaşam",
  "Tarih & Kültür",
  "Podcast & Sohbet",
];

const COUNTRIES = [
  { name: "Türkiye", flag: "🇹🇷", lang: "Türkçe" },
  { name: "France", flag: "🇫🇷", lang: "Français" },
  { name: "Italy", flag: "🇮🇹", lang: "Italiano" },
  { name: "Global", flag: "🌍", lang: "English" },
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
}) => {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [maxSpeakers, setMaxSpeakers] = useState<number>(4);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateRoom({
      title: title.trim(),
      topic,
      country: selectedCountry.name,
      language: selectedCountry.lang,
      maxSpeakers,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Yeni Ses Odası Başlat</h3>
            <p className="text-xs text-neutral-400">Moderatör siz olacaksınız</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Oda Başlığı
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Gece İtirafları: En Büyük Pişmanlığınız..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Konu / Kategori
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 text-sm text-white focus:outline-none transition-colors"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Ülke & Dil
              </label>
              <select
                value={selectedCountry.name}
                onChange={(e) => {
                  const c = COUNTRIES.find((cntry) => cntry.name === e.target.value);
                  if (c) setSelectedCountry(c);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 text-xs text-white focus:outline-none transition-colors"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name} ({c.lang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Maks. Konuşmacı
              </label>
              <select
                value={maxSpeakers}
                onChange={(e) => setMaxSpeakers(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 text-xs text-white focus:outline-none transition-colors"
              >
                <option value={2}>2 Konuşmacı (Birebir)</option>
                <option value={4}>4 Konuşmacı (Panel)</option>
                <option value={6}>6 Konuşmacı (Tartışma)</option>
                <option value={8}>8 Konuşmacı (Açık Masa)</option>
              </select>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Odayı Başlat ve Canlıya Geç
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
