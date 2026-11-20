import { supabase, isSupabaseConfigured } from "./supabase";
import { TalkOnComment, TalkOnInvitation, TalkOnRoom } from "@/types/talkon";

export async function persistRoom(room: TalkOnRoom): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from("rooms").insert([
      {
        id: room.id.startsWith("room-") ? undefined : room.id,
        title: room.title,
        topic: room.topic,
        country: room.country,
        language: room.language,
        moderator_handle: room.moderatorHandle,
        max_speakers: room.maxSpeakers,
        is_live: room.isLive,
      },
    ]);
  } catch (err) {
    console.error("Failed to persist room to Supabase:", err);
  }
}

export async function persistComment(comment: TalkOnComment): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from("comments").insert([
      {
        room_id: comment.roomId,
        user_handle: comment.userHandle,
        avatar_seed: comment.avatarSeed,
        text: comment.text,
        likes_count: 0,
      },
    ]);
  } catch (err) {
    console.error("Failed to persist comment to Supabase:", err);
  }
}

export async function persistInvitation(inv: TalkOnInvitation): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from("invitations").insert([
      {
        room_id: inv.roomId,
        user_id: inv.userId,
        status: inv.status,
      },
    ]);
  } catch (err) {
    console.error("Failed to persist invitation to Supabase:", err);
  }
}
