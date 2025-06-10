import { SocialPlatform } from "@/types/profile";

export const SOCIAL_PLATFORMS: Record<SocialPlatform, {
  logo: string;
  defaultTitle: string;
  defaultButton: string;
  bgColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonHoverColor: string;
  iconColor: string;
}> = {
  youtube: {
    logo: '/icons/youtube.svg',
    defaultTitle: 'YouTube',
    defaultButton: "Subscribe",
    bgColor: 'bg-white',
    buttonColor: 'bg-[#FF0000]',
    buttonTextColor: 'text-white',
    buttonHoverColor: 'hover:bg-[#CC0000]',
    iconColor: 'text-[#FF0000]'
  },
  twitter: {
    logo: '/icons/twitter.svg',
    defaultTitle: 'Twitter',
    defaultButton: "S'abonner",
    bgColor: 'bg-black',
    buttonColor: 'bg-white',
    buttonTextColor: 'text-black',
    buttonHoverColor: 'hover:bg-neutral-200',
    iconColor: 'text-white'
  },
  instagram: {
    logo: '/icons/instagram.svg',
    defaultTitle: 'Instagram',
    defaultButton: "S'abonner",
    bgColor: 'bg-white',
    buttonColor: 'bg-[#0095F6]',
    buttonTextColor: 'text-white',
    buttonHoverColor: 'hover:bg-[#1877F2]',
    iconColor: 'text-black'
  },
  twitch: {
    logo: '/icons/twitch.svg',
    defaultTitle: 'Twitch',
    defaultButton: "S'abonner",
    bgColor: 'bg-[#0E0E10]',
    buttonColor: 'bg-[#9146FF]',
    buttonTextColor: 'text-white',
    buttonHoverColor: 'hover:bg-[#772CE8]',
    iconColor: 'text-white'
  },
  tiktok: {
    logo: '/icons/tiktok.svg',
    defaultTitle: 'TikTok',
    defaultButton: "S'abonner",
    bgColor: 'bg-white',
    buttonColor: 'bg-[#FE2C55]',
    buttonTextColor: 'text-white',
    buttonHoverColor: 'hover:bg-[#EF2950]',
    iconColor: 'text-black'
  }
}; 