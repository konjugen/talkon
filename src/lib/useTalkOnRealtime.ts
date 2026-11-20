"use client";

import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import { TalkOnComment, TalkOnInvitation, TalkOnRoom } from "@/types/talkon";

interface RealtimeCallbacks {
  onNewComment?: (comment: TalkOnComment) => void;
  onNewInvitation?: (invitation: TalkOnInvitation) => void;
  onRoomUpdated?: (room: TalkOnRoom) => void;
}

export function useTalkOnRealtime(
  roomId: string | null,
  callbacks: RealtimeCallbacks
) {
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !roomId) return;

    // Subscribe to comments
    const commentsChannel = supabase
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

    // Subscribe to invitations
    const invitationsChannel = supabase
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

    const client = supabase;
    return () => {
      client?.removeChannel(commentsChannel);
      client?.removeChannel(invitationsChannel);
    };
  }, [roomId, callbacks]);
}
