import { SocialPlatform } from "@/types/profile";
import { API_KEYS } from "@/config/apiKeys";

interface SocialStats {
  subscriberCount?: string;
  platform: SocialPlatform;
  profileImage?: string;
  channelName?: string;
}

// Fonction pour extraire l'ID de la chaîne YouTube depuis une URL
const extractYoutubeChannelId = (url: string): string | null => {
  // Nettoyer l'URL
  const cleanUrl = url.trim().toLowerCase();

  // Différents patterns possibles pour les URLs YouTube
  const patterns = [
    /youtube\.com\/@([^\/\?]+)/,           // Format @username
    /youtube\.com\/channel\/([^\/\?]+)/,    // Format channel/ID
    /youtube\.com\/c\/([^\/\?]+)/,          // Format c/username
    /youtube\.com\/user\/([^\/\?]+)/,       // Format user/username
    /youtube\.com\/([^\/\?]+)/              // Format direct username
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Fonction pour extraire le nom d'utilisateur TikTok depuis une URL
const extractTiktokUsername = (url: string): string | null => {
  const match = url.match(/tiktok\.com\/@([^\/\?]+)/);
  return match ? match[1] : null;
};

// Fonction pour extraire le nom d'utilisateur Twitch depuis une URL
const extractTwitchUsername = (url: string): string | null => {
  const match = url.match(/twitch\.tv\/([^\/\?]+)/);
  return match ? match[1] : null;
};

// Fonction pour extraire le nom d'utilisateur Instagram depuis une URL
const extractInstagramUsername = (url: string): string | null => {
  const match = url.match(/instagram\.com\/([^\/\?]+)/);
  return match ? match[1] : null;
};

export const socialService = {
  // Fonction pour formater le nombre d'abonnés
  formatSubscriberCount: (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  },

  // Fonction pour récupérer les informations d'une chaîne YouTube
  getYoutubeChannelInfo: async (channelId: string): Promise<{ id: string; stats: any } | null> => {
    try {
      console.log('Tentative de récupération des infos pour:', channelId);
      console.log('Utilisation de la clé API:', API_KEYS.YOUTUBE_API_KEY);

      // D'abord, essayons de récupérer l'ID de la chaîne si c'est un nom d'utilisateur
      let realChannelId = channelId;
      if (!channelId.startsWith('UC')) {
        const usernameUrl = new URL('https://www.googleapis.com/youtube/v3/channels');
        usernameUrl.searchParams.append('part', 'id');
        usernameUrl.searchParams.append('forUsername', channelId);
        usernameUrl.searchParams.append('key', API_KEYS.YOUTUBE_API_KEY);

        const response = await fetch(usernameUrl.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin
          }
        });
        const data = await response.json();
        console.log('Réponse de la recherche par username:', data);
        if (data.items && data.items.length > 0) {
          realChannelId = data.items[0].id;
        }
      }

      // Maintenant, récupérons les statistiques et les informations de la chaîne
      const channelUrl = new URL('https://www.googleapis.com/youtube/v3/channels');
      channelUrl.searchParams.append('part', 'snippet,statistics');
      channelUrl.searchParams.append('id', realChannelId);
      channelUrl.searchParams.append('key', API_KEYS.YOUTUBE_API_KEY);

      const response = await fetch(channelUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      });
      const data = await response.json();
      console.log('Réponse de la recherche par ID:', data);

      if (!data.items || data.items.length === 0) {
        console.log('Aucune donnée trouvée pour cet ID');
        return null;
      }

      return {
        id: realChannelId,
        stats: data.items[0]
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des informations YouTube:', error);
      return null;
    }
  },

  // Fonction pour récupérer les statistiques d'une plateforme
  getStats: async (platform: SocialPlatform, url: string): Promise<SocialStats | null> => {
    try {
      console.log('Récupération des stats pour:', platform, url);
      let stats: SocialStats = { platform };

      switch (platform) {
        case 'youtube': {
          const channelId = extractYoutubeChannelId(url);
          console.log('ID de chaîne extrait:', channelId);
          if (!channelId) return null;

          const channelInfo = await socialService.getYoutubeChannelInfo(channelId);
          console.log('Informations de la chaîne:', channelInfo);
          if (channelInfo) {
            const { stats: channelStats } = channelInfo;
            stats.subscriberCount = socialService.formatSubscriberCount(
              parseInt(channelStats.statistics.subscriberCount)
            );
            stats.profileImage = channelStats.snippet.thumbnails.default.url;
            stats.channelName = channelStats.snippet.title;
          }
          break;
        }

        case 'twitch': {
          const username = extractTwitchUsername(url);
          if (!username) return null;

          // Ici, vous devrez implémenter l'appel à l'API Twitch
          // Nécessite une clé API Twitch
          // const response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
          //   headers: {
          //     'Client-ID': 'YOUR_CLIENT_ID',
          //     'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
          //   }
          // });
          // const data = await response.json();
          // stats.subscriberCount = socialService.formatSubscriberCount(data.data[0].followers);
          // stats.profileImage = data.data[0].profile_image_url;
          break;
        }

        case 'tiktok': {
          const username = extractTiktokUsername(url);
          if (!username) return null;

          // TikTok n'a pas d'API publique officielle pour les statistiques
          // Vous devrez peut-être utiliser un service tiers ou laisser l'utilisateur
          // entrer manuellement ces informations
          break;
        }

        case 'instagram': {
          const username = extractInstagramUsername(url);
          if (!username) return null;

          // Instagram/Meta a des restrictions strictes sur l'accès aux données
          // Vous devrez peut-être utiliser l'API Graph de Facebook avec
          // les autorisations appropriées
          break;
        }
      }

      console.log('Stats finales:', stats);
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }
}; 