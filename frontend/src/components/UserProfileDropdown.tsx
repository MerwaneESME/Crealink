import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircle2, LogOut, Settings, MessageSquare, User, Bell, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const UserProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(2); // Exemple de notification
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link to="/login">Connexion</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Inscription</Link>
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'creator':
        return 'Créateur';
      case 'expert':
        return 'Expert';
      case 'influencer':
        return 'Influenceur';
      default:
        return 'Utilisateur';
    }
  };

  const getDashboardLink = (role: string) => {
    switch (role) {
      case 'creator':
      case 'influencer':
        return '/creator-dashboard';
      default:
        return '';
    }
  };

  // Ajouter un log pour déboguer
  console.log('User role:', user.role);
  console.log('Should show dashboard:', user.role === 'creator' || user.role === 'expert' || user.role === 'influencer');

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        asChild
        className="relative"
        aria-label="Notifications"
      >
        <Link to="/notifications">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] text-xs">
            3
          </Badge>
        </Link>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        asChild
        className="relative"
        aria-label="Messages"
      >
        <Link to="/messages">
          <MessageSquare className="h-5 w-5" />
          {unreadMessages > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] text-xs">
              {unreadMessages}
            </Badge>
          )}
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-10 w-10 rounded-full"
            aria-label="Profil"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-purple-900/10 border-purple-500/20">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.displayName || user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {getDashboardLink(user.role) && (
            <DropdownMenuItem asChild>
              <Link to={getDashboardLink(user.role)} className="cursor-pointer hover:bg-purple-900/30">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer hover:bg-purple-900/30">
              <User className="mr-2 h-4 w-4" />
              Profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/messages" className="cursor-pointer hover:bg-purple-900/30">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:bg-red-900/20">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfileDropdown; 