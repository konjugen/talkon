export type UserRole = "moderator" | "speaker" | "listener";

export type SpeakerLifecycleState = 
  | "idle"             // Normal listener
  | "invited"          // Received invitation from moderator
  | "accepted"         // Accepted invite, NOT speaking yet
  | "mic_check"        // Performing local microphone test
  | "ready"            // Pressed "Hazırım", waiting to connect
  | "live_speaker";    // Active speaker on stage

export interface TalkOnUser {
  id: string;
  handle: string;
  avatarSeed: string;
  role: UserRole;
  isAnonymous: boolean;
  speakerState: SpeakerLifecycleState;
  isMuted: boolean;
  isSpeaking: boolean;
}

export interface TalkOnComment {
  id: string;
  roomId: string;
  userId: string;
  userHandle: string;
  avatarSeed: string;
  text: string;
  likesCount: number;
  likedByMe?: boolean;
  createdAt: number;
  isModeratorPicked?: boolean;
}

export interface TalkOnInvitation {
  id: string;
  roomId: string;
  userId: string;
  fromModeratorId: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: number;
}

export interface TalkOnRoom {
  id: string;
  title: string;
  topic: string;
  country: string;
  language: string;
  moderatorId: string;
  moderatorHandle: string;
  maxSpeakers: number;
  activeSpeakersCount: number;
  listenersCount: number;
  isLive: boolean;
  createdAt: number;
}
