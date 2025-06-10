// Vérifier si nous sommes côté client
const isClient = typeof window !== 'undefined';

export const API_KEYS = {
  YOUTUBE_API_KEY: import.meta.env.VITE_YOUTUBE_API_KEY || 'YOUR_YOUTUBE_API_KEY'
}; 