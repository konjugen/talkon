import { supabase, isSupabaseConfigured } from "./supabase";
import { TalkOnComment, TalkOnInvitation, TalkOnRoom } from "@/types/talkon";

export async function fetchRoomsFromDb(): Promise<TalkOnRoom[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((r) => ({
      id: r.id,
      title: r.title,
      topic: r.topic,
      country: r.country,
      language: r.language,
      moderatorId: r.moderator_id || "mod-seed",
      moderatorHandle: r.moderator_handle || "Moderatör",
      maxSpeakers: r.max_speakers || 4,
      activeSpeakersCount: 1,
      listenersCount: 5,
      isLive: r.is_live,
      createdAt: new Date(r.created_at).getTime(),
    }));
  } catch (err) {
    console.error("Failed to fetch rooms from Supabase:", err);
    return [];
  }
}

export async function fetchCommentsFromDb(roomId: string): Promise<TalkOnComment[]> {
  if (!isSupabaseConfigured || !supabase || !roomId) return [];

  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map((c) => ({
      id: c.id,
      roomId: c.room_id,
      userId: c.user_id || "anon",
      userHandle: c.user_handle,
      avatarSeed: c.avatar_seed,
      text: c.text,
      likesCount: c.likes_count || 0,
      likedByMe: false,
      createdAt: new Date(c.created_at).getTime(),
    }));
  } catch (err) {
    console.error("Failed to fetch comments from Supabase:", err);
    return [];
  }
}

export async function persistRoom(room: TalkOnRoom): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from("rooms")
      .insert([
        {
          title: room.title,
          topic: room.topic,
          country: room.country,
          language: room.language,
          moderator_handle: room.moderatorHandle,
          max_speakers: room.maxSpeakers,
          is_live: room.isLive,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Failed to persist room to Supabase:", error);
      return null;
    }
    return data.id;
  } catch (err) {
    console.error("Failed to persist room to Supabase:", err);
    return null;
  }
}

export async function persistComment(comment: TalkOnComment): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          room_id: comment.roomId,
          user_handle: comment.userHandle,
          avatar_seed: comment.avatarSeed,
          text: comment.text,
          likes_count: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Failed to persist comment to Supabase:", error);
      return null;
    }
    return data.id;
  } catch (err) {
    console.error("Failed to persist comment to Supabase:", err);
    return null;
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
