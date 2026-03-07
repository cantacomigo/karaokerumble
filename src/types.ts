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

export type Screen = 'dashboard' | 'videos' | 'analytics' | 'settings' | 'upload' | 'player' | 'home';
