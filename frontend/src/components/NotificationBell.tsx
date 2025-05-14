import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { notificationService, Notification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    console.log('NotificationBell - Setting up notification subscription');
    const unsubscribe = notificationService.subscribeToNotifications(user.uid, (newNotifications) => {
      console.log('NotificationBell - Received notifications:', newNotifications.length);
      setNotifications(newNotifications);
    });

    return () => {
      console.log('NotificationBell - Cleaning up subscription');
      unsubscribe();
    };
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (notification.link) {
        // Naviguer vers la conversation
        navigate(notification.link);
        
        // Attendre un court instant pour s'assurer que la navigation est effectuée
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Marquer comme lu et mettre à jour l'état local
        await notificationService.markAsRead(notification.id);
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        
        // Fermer le menu des notifications
        setShowNotifications(false);
      }
    } catch (error) {
      console.error('Erreur lors du traitement de la notification:', error);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // Empêcher la propagation du clic vers le parent
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // différence en secondes

    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative text-gray-300 hover:text-purple-400"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs" 
            variant="destructive"
          >
            {notifications.length}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-black/90 border border-purple-500/20 rounded-md shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-purple-500/20">
            <h3 className="font-medium">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">
                Aucune notification
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="p-3 border-b border-purple-500/10 hover:bg-purple-900/10 cursor-pointer relative group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-8">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteNotification(e, notification.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-purple-500/10 rounded"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 