"use client";

import React, { useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useSpeakingParticipants,
  useParticipants,
} from "@livekit/components-react";
import { Mic, Volume2, Wifi } from "lucide-react";

interface LiveKitAudioSessionProps {
  roomId: string;
  username: string;
  isOnStage: boolean;
  isMuted: boolean;
  onActiveSpeakersChange?: (speakingUsernames: string[]) => void;
}

// Internal component inside LiveKitRoom to manage tracks and speaking states
function AudioTrackController({
  isOnStage,
  isMuted,
  onActiveSpeakersChange,
}: {
  isOnStage: boolean;
  isMuted: boolean;
  onActiveSpeakersChange?: (speakingUsernames: string[]) => void;
}) {
  const { localParticipant } = useLocalParticipant();
  const speakingParticipants = useSpeakingParticipants();

  // Control local microphone track based on isOnStage & isMuted
  useEffect(() => {
    if (!localParticipant) return;

    if (isOnStage && !isMuted) {
      localParticipant.setMicrophoneEnabled(true).catch(console.error);
    } else {
      localParticipant.setMicrophoneEnabled(false).catch(console.error);
    }
  }, [localParticipant, isOnStage, isMuted]);

  // Report active speakers up to the parent stage
  useEffect(() => {
    if (!onActiveSpeakersChange) return;
    const speakerIds = speakingParticipants.map((p) => p.identity);
    onActiveSpeakersChange(speakerIds);
  }, [speakingParticipants, onActiveSpeakersChange]);

  return <RoomAudioRenderer />;
}

export const LiveKitAudioSession: React.FC<LiveKitAudioSessionProps> = ({
  roomId,
  username,
  isOnStage,
  isMuted,
  onActiveSpeakersChange,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchToken() {
      try {
        const res = await fetch(
          `/api/livekit-token?room=${encodeURIComponent(roomId)}&username=${encodeURIComponent(
            username
          )}&canPublish=${isOnStage}`
        );
        const data = await res.json();

        if (isCancelled) return;

        if (data.isConfigured && data.token && data.url) {
          setToken(data.token);
          setLivekitUrl(data.url);
          setIsConfigured(true);
        } else {
          setIsConfigured(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn("Could not fetch LiveKit token:", err);
          setIsConfigured(false);
        }
      }
    }

    fetchToken();

    return () => {
      isCancelled = true;
    };
  }, [roomId, username, isOnStage]);

  if (isConfigured === null) {
    return null;
  }

  if (!isConfigured || !token || !livekitUrl) {
    return (
      <div className="flex items-center justify-between text-[11px] px-3 py-1.5 bg-neutral-900/60 border border-neutral-800 rounded-xl text-neutral-400">
        <span className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-amber-400" />
          <span>Ses Altyapısı: Simülasyon Modu</span>
        </span>
        <span className="text-[10px] text-neutral-500">
          LiveKit anahtarları eklendiğinde tam WebRTC devreye girer
        </span>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitUrl}
      connect={true}
      audio={true}
      video={false}
      className="flex items-center justify-between text-[11px] px-3 py-1.5 bg-emerald-950/30 border border-emerald-900/50 rounded-xl text-emerald-300"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-emerald-200">LiveKit Canlı WebRTC Bağlı</span>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-emerald-400">
        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
        <span>HD Canlı Ses Aktif</span>
      </div>

      <AudioTrackController
        isOnStage={isOnStage}
        isMuted={isMuted}
        onActiveSpeakersChange={onActiveSpeakersChange}
      />
    </LiveKitRoom>
  );
};
