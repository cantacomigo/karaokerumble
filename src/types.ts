export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  date: string;
  description: string;
  author: string;
  authorAvatar: string;
  subscribers: string;
  likes: string;
  embedCode?: string;
  category?: string;
  mp3_url?: string;
  backing_vocal_url?: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  plan: 'free' | 'pro' | 'Administrador';
  viewCount: number;
  memberSince: string;
  isAdmin?: boolean;
  planExpiresAt?: string | null;
}

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  video_id: string;
  position: number;
  video: Video;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  items?: PlaylistItem[];
}

export type Screen = 'dashboard' | 'videos' | 'analytics' | 'settings' | 'upload' | 'player' | 'home' | 'playlists';
