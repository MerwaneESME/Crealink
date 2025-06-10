import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  user: {
    photoURL?: string | null;
    displayName?: string | null;
    name?: string;
  };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = "md", className = "" }) => {
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const sizeClasses = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-full w-full text-4xl"
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={user.photoURL || undefined} className="object-cover" />
      <AvatarFallback className="bg-purple-900/30 text-purple-200 flex items-center justify-center">
        {getInitials(user.displayName || user.name || '?')}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar; 