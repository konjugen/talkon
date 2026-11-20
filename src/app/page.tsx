"use client";

import React, { useState } from "react";
import { 
  Radio, 
  Sparkles, 
  Plus, 
  Globe, 
  Compass, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { TalkOnRoom, TalkOnUser, TalkOnComment, TalkOnInvitation } from "@/types/talkon";
import { countWords } from "@/lib/utils";
import { RoomStage } from "@/components/RoomStage";
import { CommentStream } from "@/components/CommentStream";
import { ControlsBar } from "@/components/ControlsBar";
import { MicCheckModal } from "@/components/MicCheckModal";
import { InvitationBanner } from "@/components/InvitationBanner";
import { IdentitySwitcher } from "@/components/IdentitySwitcher";

// Predefined A/B test identities (as defined in TalkOn Master Spec M0)
const initialIdentities: TalkOnUser[] = [
  {
    id: "user-mod-1",
    handle: "Saru #01",
    avatarSeed: "SaruMod",
    role: "moderator",
    isAnonymous: false,
    speakerState: "live_speaker",
    isMuted: false,
    isSpeaking: true,
  },
  {
    id: "user-listener-2",
    handle: "GeceBaykuşu #14",
    avatarSeed: "GeceBaykusu",
    role: "listener",
    isAnonymous: true,
    speakerState: "idle",
    isMuted: true,
    isSpeaking: false,
  },
  {
    id: "user-listener-3",
    handle: "MeraklıPusula #88",
    avatarSeed: "MerakliPusula",
    role: "listener",
    isAnonymous: true,
    speakerState: "idle",
    isMuted: true,
    isSpeaking: false,
  },
];

const initialRoom: TalkOnRoom = {
  id: "room-tr-gundem",
  title: "TR. Türkiye Gündemi, Teknoloji ve Gelecek",
  topic: "Gündem",
  country: "Türkiye",
  language: "Türkçe",
  moderatorId: "user-mod-1",
  moderatorHandle: "Saru #01",
  maxSpeakers: 5,
  activeSpeakersCount: 1,
  listenersCount: 12,
  isLive: true,
  createdAt: 1732100000000,
};

const initialComments: TalkOnComment[] = [
  {
    id: "c-1",
    roomId: "room-tr-gundem",
    userId: "user-listener-2",
    userHandle: "GeceBaykuşu #14",
    avatarSeed: "GeceBaykusu",
    text: "Yapay zeka araçlarının hızlı yayılmasıyla birlikte geliştirme süreleri inanılmaz kısaldı bence.",
    likesCount: 5,
    likedByMe: false,
    createdAt: 1732100000000,
  },
  {
    id: "c-2",
    roomId: "room-tr-gundem",
    userId: "user-listener-3",
    userHandle: "MeraklıPusula #88",
    avatarSeed: "MerakliPusula",
    text: "Anonim kalabilmek insanların çok daha dürüst fikir belirtmesini sağlıyor.",
    likesCount: 3,
    likedByMe: true,
    createdAt: 1732100000000,
  },
];

export default function TalkOnApp() {
  const [identities, setIdentities] = useState<TalkOnUser[]>(initialIdentities);
  const [currentUserId, setCurrentUserId] = useState<string>("user-mod-1");
  const [room, setRoom] = useState<TalkOnRoom>(initialRoom);
  const [comments, setComments] = useState<TalkOnComment[]>(initialComments);
  const [invitations, setInvitations] = useState<TalkOnInvitation[]>([]);
  const [showMicCheck, setShowMicCheck] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Active current user
  const currentUser = identities.find((u) => u.id === currentUserId) || identities[0];
  const isModerator = currentUser.role === "moderator";
  const isOnStage = currentUser.speakerState === "live_speaker";

  // Stage speakers & Audience listeners
  const speakers = identities.filter((u) => u.speakerState === "live_speaker");
  const listeners = identities.filter((u) => u.speakerState !== "live_speaker");

  // Check if current user has a pending invitation
  const activeInvitation = invitations.find(
    (inv) => inv.userId === currentUser.id && inv.status === "pending"
  );

  // Switch identity (A/B testing)
  const handleSwitchIdentity = (newUser: TalkOnUser) => {
    setCurrentUserId(newUser.id);
  };

  // Add a new comment (Strictly max 15 words)
  const handleSendComment = (text: string) => {
    if (countWords(text) > 15 || !text.trim()) return;

    const newComment: TalkOnComment = {
      id: `c-${Date.now()}`,
      roomId: room.id,
      userId: currentUser.id,
      userHandle: currentUser.handle,
      avatarSeed: currentUser.avatarSeed,
      text: text.trim(),
      likesCount: 0,
      likedByMe: false,
      createdAt: Date.now(),
    };

    setComments((prev) => [newComment, ...prev]);
  };

  // Toggle comment like (+1 / -1)
  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const nextLiked = !c.likedByMe;
        return {
          ...c,
          likedByMe: nextLiked,
          likesCount: nextLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
        };
      })
    );
  };

  // Moderator invites user to speak (Comment-to-Invite mechanic)
  const handleInviteUser = (targetUserId: string, targetUserHandle: string) => {
    if (!isModerator || targetUserId === currentUser.id) return;

    // Create or update invitation
    const newInvitation: TalkOnInvitation = {
      id: `inv-${Date.now()}`,
      roomId: room.id,
      userId: targetUserId,
      fromModeratorId: currentUser.id,
      status: "pending",
      createdAt: Date.now(),
    };

    setInvitations((prev) => [...prev.filter((i) => i.userId !== targetUserId), newInvitation]);

    // Update user's speaker state
    setIdentities((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, speakerState: "invited" } : u))
    );
  };

  // Listener accepts invitation -> Opens Mic Check (CRITICAL INVARIANT: ACCEPTED != LIVE SPEAKER)
  const handleAcceptInvite = () => {
    if (!activeInvitation) return;

    setInvitations((prev) =>
      prev.map((inv) => (inv.id === activeInvitation.id ? { ...inv, status: "accepted" } : inv))
    );

    setIdentities((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, speakerState: "mic_check" } : u
      )
    );

    setShowMicCheck(true);
  };

  // Listener rejects invitation
  const handleRejectInvite = () => {
    if (!activeInvitation) return;

    setInvitations((prev) =>
      prev.map((inv) => (inv.id === activeInvitation.id ? { ...inv, status: "rejected" } : inv))
    );

    setIdentities((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, speakerState: "idle" } : u))
    );
  };

  // User completes mic check and presses "Hazırım" -> Transitions to Live Speaker on stage!
  const handleMicReady = () => {
    setShowMicCheck(false);

    setIdentities((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              role: "speaker",
              speakerState: "live_speaker",
              isMuted: false,
              isSpeaking: false,
            }
          : u
      )
    );
  };

  // Toggle Mute / Unmute
  const handleToggleMute = () => {
    setIdentities((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, isMuted: !u.isMuted } : u
      )
    );
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-900/40">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                TalkOn
              </h1>
              <span className="text-[10px] text-purple-400 block -mt-1 font-medium">
                Live Social Audio
              </span>
            </div>
          </div>
        </div>

        {/* Identity Switcher & Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 text-xs text-neutral-300 transition-colors"
            title="Sıfırdan Mimari & Text-to-Live Rehberi"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Text-to-Live Rehberi</span>
          </button>

          <IdentitySwitcher
            currentUser={currentUser}
            identities={identities}
            onSwitchIdentity={handleSwitchIdentity}
          />
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5 flex flex-col md:grid md:grid-cols-12 gap-4 pb-20 md:pb-5">
        {/* Left Column: Room Stage & Podium */}
        <section className="md:col-span-7 flex flex-col gap-4">
          <RoomStage
            room={room}
            speakers={speakers}
            listeners={listeners}
          />

          {/* Quick Explanation for TalkOn Philosophy */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 text-xs text-neutral-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-200">TalkOn Konuşma Felsefesi (Comment-to-Invite)</p>
              <p className="mt-0.5 text-neutral-400 leading-relaxed">
                Dinleyicilerde klasik el kaldırma yoktur. Dinleyici en fazla 15 kelimelik kısa bir fikir yazar. Moderatör beğendiği yorumun sahibini sahneye davet eder.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: 15-Word Comment Stream */}
        <section className="md:col-span-5 flex flex-col bg-neutral-900/40 rounded-2xl border border-neutral-800 overflow-hidden min-h-[380px] md:min-h-[500px]">
          <CommentStream
            comments={comments}
            currentUserId={currentUser.id}
            isModerator={isModerator}
            onLikeComment={handleLikeComment}
            onInviteUser={handleInviteUser}
          />
        </section>
      </div>

      {/* Fixed Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <ControlsBar
          isOnStage={isOnStage}
          isMuted={currentUser.isMuted}
          onToggleMute={handleToggleMute}
          onSendComment={handleSendComment}
          onLeaveRoom={() => alert("Oda oturumu sonlandırıldı.")}
        />
      </div>

      {/* Pending Invitation Banner */}
      {activeInvitation && (
        <InvitationBanner
          moderatorHandle={room.moderatorHandle}
          onAccept={handleAcceptInvite}
          onReject={handleRejectInvite}
        />
      )}

      {/* Mic Check & PreJoin Modal */}
      <MicCheckModal
        isOpen={showMicCheck}
        onReady={handleMicReady}
        onCancel={() => {
          setShowMicCheck(false);
          setIdentities((prev) =>
            prev.map((u) => (u.id === currentUser.id ? { ...u, speakerState: "idle" } : u))
          );
        }}
      />

      {/* Text-to-Live & Architecture Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              TalkOn: Sıfırdan Mimari & Text-to-Live
            </h3>

            <div className="space-y-4 text-xs text-neutral-300">
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <h4 className="font-semibold text-white mb-1">🚀 100% Ücretsiz Servisler:</h4>
                <ul className="space-y-1.5 list-disc list-inside text-neutral-300">
                  <li><strong className="text-purple-300">Frontend:</strong> Next.js 15 (Turbopack + Tailwind v4)</li>
                  <li><strong className="text-purple-300">Veritabanı & State:</strong> Supabase Free Tier (PostgreSQL + Realtime)</li>
                  <li><strong className="text-purple-300">Canlı Ses (M10):</strong> LiveKit Cloud (10.000 dk/ay ücretsiz)</li>
                  <li><strong className="text-purple-300">Hosting & CI/CD:</strong> Vercel + GitHub (Otomatik 30 sn canlı)</li>
                </ul>
              </div>

              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <h4 className="font-semibold text-white mb-1">💬 Text-to-Live Nasıl Çalışır?</h4>
                <p className="leading-relaxed">
                  Siz sadece sohbete Türkçe olarak ne istediğinizi yazarsınız (örn: <em>&quot;Oda başlığına emoji ekle, renkleri mavi yap&quot;</em>). Antigravity kodu yazar, derler ve GitHub&apos;a pushlar. Vercel 30 saniye içinde yeni versiyonu canlıya basar!
                </p>
              </div>

              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <h4 className="font-semibold text-white mb-1">🧪 A/B Testi Nasıl Yapılır?</h4>
                <p className="leading-relaxed">
                  Sağ üstteki <strong>Moderatör / Dinleyici</strong> butonlarıyla rolleri anında değiştirebilirsiniz. Moderatör olarak yorumdan davet gönderip, dinleyiciye geçerek gerçek mikrofon testini deneyimleyebilirsiniz.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs transition-colors"
            >
              Anladım, Kapat
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
