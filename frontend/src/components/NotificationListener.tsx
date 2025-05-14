import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, Notification } from '@/services/notificationService';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotificationListener() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const subscriptionRef = useRef<(() => void) | null>(null);

  const handleNotifications = useCallback((notifications: Notification[]) => {
    console.log('NotificationListener - Received notifications:', {
      count: notifications.length,
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title
      }))
    });

    // Afficher les toasts pour toutes les notifications non lues
    notifications.forEach((notification) => {
      if (!notification.read) {
        console.log('NotificationListener - Showing toast for notification:', notification.id);
        toast({
          title: notification.title,
          description: notification.content,
          action: notification.link ? (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                navigate(notification.link as string);
                notificationService.markAsRead(notification.id);
              }}
            >
              Voir
            </Button>
          ) : undefined,
          duration: 5000,
        });
      }
    });
  }, [toast, navigate]);

  useEffect(() => {
    console.log('NotificationListener - Component mounted');
    console.log('Current user state:', user ? { uid: user.uid, role: user.role } : 'No user');

    if (!user) {
      console.log('NotificationListener - No user, skipping subscription');
      return;
    }

    // Nettoyage de la souscription précédente
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }

    console.log('NotificationListener - Setting up notification subscription');
    const unsubscribe = notificationService.subscribeToNotifications(user.uid, handleNotifications);
    subscriptionRef.current = unsubscribe;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [user, handleNotifications]);

  // Ce composant ne rend rien visuellement
  return null;
} 