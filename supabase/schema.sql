-- ====================================================================
-- TalkOn Master Database Schema (Supabase PostgreSQL + Realtime)
-- 100% Free Tier Compatible
-- ====================================================================

-- 1. Profiles (Anonymous by default, privacy-preserving)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL,
  avatar_seed TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Rooms
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'Gündem',
  country TEXT NOT NULL DEFAULT 'Türkiye',
  language TEXT NOT NULL DEFAULT 'Türkçe',
  moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderator_handle TEXT NOT NULL,
  max_speakers INT DEFAULT 4,
  is_live BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Room Participants & Real-time Speaker State
CREATE TABLE IF NOT EXISTS public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  avatar_seed TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'listener', -- 'moderator' | 'speaker' | 'listener'
  speaker_state TEXT NOT NULL DEFAULT 'idle', -- 'idle' | 'invited' | 'accepted' | 'mic_check' | 'ready' | 'live_speaker'
  is_muted BOOLEAN DEFAULT true,
  is_speaking BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- 4. 15-Word Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_handle TEXT NOT NULL,
  avatar_seed TEXT NOT NULL,
  text VARCHAR(250) NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Comment Likes (Prevent duplicate likes)
CREATE TABLE IF NOT EXISTS public.comment_likes (
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

-- 6. Invitations (Comment-to-Invite State Machine)
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected' | 'expired'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- Enable Supabase Realtime for instant cross-device updates
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invitations;

-- Enable Row Level Security (RLS) - Public read/write for MVP
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert on rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on rooms" ON public.rooms FOR UPDATE USING (true);

CREATE POLICY "Allow public read on room_participants" ON public.room_participants FOR SELECT USING (true);
CREATE POLICY "Allow public all on room_participants" ON public.room_participants FOR ALL USING (true);

CREATE POLICY "Allow public read on comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on comments" ON public.comments FOR UPDATE USING (true);

CREATE POLICY "Allow public read on comment_likes" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Allow public all on comment_likes" ON public.comment_likes FOR ALL USING (true);

CREATE POLICY "Allow public read on invitations" ON public.invitations FOR SELECT USING (true);
CREATE POLICY "Allow public all on invitations" ON public.invitations FOR ALL USING (true);
