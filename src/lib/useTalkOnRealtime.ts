"use client";

import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import { TalkOnComment, TalkOnInvitation, TalkOnRoom } from "@/types/talkon";

interface RealtimeCallbacks {
  onNewComment?: (comment: TalkOnComment) => void;
  onNewInvitation?: (invitation: TalkOnInvitation) => void;
  onNewRoom?: (room: TalkOnRoom) => void;
}

export function useTalkOnRealtime(
  roomId: string | null,
  callbacks: RealtimeCallbacks
) {
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const client = supabase;

    // 1. Subscribe to Rooms channel (Global)
    const roomsChannel = client
      .channel("public_rooms")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "rooms",
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            title: string;
            topic: string;
            country: string;
            language: string;
            moderator_handle: string;
            max_speakers: number;
            is_live: boolean;
            created_at: string;
          };

          if (row && callbacks.onNewRoom) {
            callbacks.onNewRoom({
              id: row.id,
              title: row.title,
              topic: row.topic,
              country: row.country,
              language: row.language,
              moderatorId: "mod-realtime",
              moderatorHandle: row.moderator_handle,
              maxSpeakers: row.max_speakers || 4,
              activeSpeakersCount: 1,
              listenersCount: 1,
              isLive: row.is_live,
              createdAt: new Date(row.created_at).getTime(),
            });
          }
        }
      )
      .subscribe();

    if (!roomId) {
      return () => {
        client.removeChannel(roomsChannel);
      };
    }

    // 2. Subscribe to room comments
    const commentsChannel = client
      .channel(`room_comments_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            room_id: string;
            user_id: string;
            user_handle: string;
            avatar_seed: string;
            text: string;
            likes_count: number;
            created_at: string;
          };

          const newComment: TalkOnComment = {
            id: row.id,
            roomId: row.room_id,
            userId: row.user_id,
            userHandle: row.user_handle,
            avatarSeed: row.avatar_seed,
            text: row.text,
            likesCount: row.likes_count || 0,
            likedByMe: false,
            createdAt: new Date(row.created_at).getTime(),
          };

          if (callbacks.onNewComment) {
            callbacks.onNewComment(newComment);
          }
        }
      )
      .subscribe();

    // 3. Subscribe to room invitations
    const invitationsChannel = client
      .channel(`room_invitations_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invitations",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            room_id: string;
            user_id: string;
            from_moderator_id: string;
            status: "pending" | "accepted" | "rejected" | "expired";
            created_at: string;
          };

          if (row && callbacks.onNewInvitation) {
            callbacks.onNewInvitation({
              id: row.id,
              roomId: row.room_id,
              userId: row.user_id,
              fromModeratorId: row.from_moderator_id,
              status: row.status,
              createdAt: new Date(row.created_at).getTime(),
            });
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(roomsChannel);
      client.removeChannel(commentsChannel);
      client.removeChannel(invitationsChannel);
    };
  }, [roomId, callbacks]);
}
