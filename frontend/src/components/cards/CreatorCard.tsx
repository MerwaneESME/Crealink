import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Globe, Users, Youtube, Instagram, Twitch } from 'lucide-react';
import { User } from "@/contexts/AuthContext";
import { getCreatorTypeName, getCreatorSubTypeName, getAudienceRangeLabel } from "@/lib/utils/creators";

interface CreatorCardProps {
  creator: User;
  compact?: boolean;
}

const TikTokIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 5 17.65a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, compact = false }) => {
  return (
    <Card className="bg-purple-900/10 border-purple-500/20 hover:bg-purple-900/20 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-purple-900/30 border-2 border-purple-500/30">
            {creator.photoURL ? (
              <img 
                src={creator.photoURL} 
                alt={`${creator.displayName || 'Créateur'}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-900/50">
                <span className="text-2xl text-purple-300">
                  {(creator.displayName || 'C')[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <CardTitle className="text-white text-lg">
              {creator.displayName || creator.name}
            </CardTitle>
            
            {creator.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-300">{Number(creator.rating).toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {creator.creator?.mainType && (
          <div className="flex flex-col space-y-1 mb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-400" />
              <span className="text-white font-medium">
                {getCreatorTypeName(creator.creator.mainType)}
              </span>
            </div>
            {creator.creator?.subType && (
              <span className="text-sm text-purple-300 ml-6">
                {getCreatorSubTypeName(creator.creator.mainType, creator.creator.subType)}
              </span>
            )}
          </div>
        )}

        {creator.creator?.audienceSize && (
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300">
              {getAudienceRangeLabel(creator.creator.audienceSize)}
            </span>
          </div>
        )}

        {!compact && creator.creator?.description && (
          <p className="text-sm text-gray-300 mb-4 line-clamp-2">
            {creator.creator.description}
          </p>
        )}

        <div className="flex gap-3">
          {creator.youtube && (
            <a 
              href={creator.youtube.startsWith('http') ? creator.youtube : `https://${creator.youtube}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </a>
          )}
          {creator.tiktok && (
            <a 
              href={creator.tiktok.startsWith('http') ? creator.tiktok : `https://${creator.tiktok}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <TikTokIcon />
            </a>
          )}
          {creator.instagram && (
            <a 
              href={creator.instagram.startsWith('http') ? creator.instagram : `https://${creator.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-400 transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
          {creator.twitch && (
            <a 
              href={creator.twitch.startsWith('http') ? creator.twitch : `https://${creator.twitch}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-400 transition-colors"
            >
              <Twitch className="h-5 w-5" />
            </a>
          )}
        </div>

        {!compact && creator.creator?.platforms && creator.creator.platforms.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {creator.creator.platforms.map((platform, index) => (
              <Badge 
                key={index}
                className="bg-purple-900/30 text-purple-300 hover:bg-purple-800/50"
              >
                {platform}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreatorCard; 