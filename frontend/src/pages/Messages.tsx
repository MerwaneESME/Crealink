import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { messageService, Message, Conversation } from '../services/messageService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { X } from 'lucide-react';
import { notificationService } from '../services/notificationService';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [recipientDetails, setRecipientDetails] = useState<Record<string, { name: string, avatar?: string }>>({});
  const [previousMessagesLength, setPreviousMessagesLength] = useState<number>(0);
  const [conversationToClose, setConversationToClose] = useState<string | null>(null);

  // Récupérer le destinataire des paramètres d'URL (si on vient d'un profil)
  const recipientId = searchParams.get('recipient');
  const recipientName = searchParams.get('name');

  useEffect(() => {
    if (!user) return;

    console.log('Configuration des écouteurs pour l\'utilisateur:', user.uid);
    console.log('URL params:', {
      conversationId: searchParams.get('id'),
      recipientId: searchParams.get('recipient'),
      recipientName: searchParams.get('name')
    });

    // Si on a un destinataire dans l'URL, créer ou récupérer la conversation
    if (recipientId && recipientName) {
      console.log('Destinataire trouvé dans l\'URL:', recipientId, recipientName);
      handleStartConversation(recipientId, recipientName);
    }

    // Écouter les conversations en temps réel
    const unsubscribe = messageService.subscribeToConversations(user.uid, (newConversations) => {
      console.log('Nouvelles conversations reçues:', newConversations.length);
      
      // Si on arrive depuis une notification, ouvrir la conversation correspondante
      const conversationIdFromUrl = searchParams.get('id');
      if (conversationIdFromUrl) {
        console.log('Recherche de la conversation:', conversationIdFromUrl);
        const targetConversation = newConversations.find(conv => conv.id === conversationIdFromUrl);
        
        if (targetConversation) {
          console.log('Conversation trouvée, ouverture:', conversationIdFromUrl);
          setCurrentConversation(conversationIdFromUrl);
          
          // Nettoyer l'URL après avoir ouvert la conversation
          navigate('/messages', { replace: true });
        } else {
          console.log('Conversation non trouvée:', conversationIdFromUrl);
        }
      }

      setConversations(newConversations);
      setLoading(false);
    });

    return () => {
      console.log('Nettoyage des écouteurs');
      unsubscribe();
    };
  }, [user, recipientId, recipientName, searchParams, navigate]);

  useEffect(() => {
    if (!currentConversation || !user) return;

    console.log('Setting up message subscription for conversation:', currentConversation);

    // Écouter les messages de la conversation courante en temps réel
    const unsubscribe = messageService.subscribeToMessages(currentConversation, async (newMessages) => {
      // Vérifier s'il y a de nouveaux messages
      if (newMessages.length > messages.length) {
        console.log('New messages received:', newMessages.length - messages.length);
        
        // Récupérer le dernier message
        const lastMessage = newMessages[newMessages.length - 1];
        console.log('Last message:', lastMessage);
      }
      setMessages(newMessages);
    });

    // Marquer les messages comme lus
    messageService.markConversationAsRead(currentConversation, user.uid);

    return () => {
      console.log('Cleaning up message subscription');
      unsubscribe();
    };
  }, [currentConversation, user, messages.length]);

  const handleStartConversation = async (userId: string, userName: string) => {
    try {
      if (!user) return;
      
      console.log('Démarrage d\'une conversation avec:', userId);
      const conversationId = await messageService.getOrCreateConversation(user.uid, userId);
      console.log('ID de conversation:', conversationId);
      
      setCurrentConversation(conversationId);
      
      // Mettre à jour les détails du destinataire
      setRecipientDetails(prev => ({
        ...prev,
        [userId]: { name: userName }
      }));
      
      // Nettoyer les paramètres d'URL
      navigate('/messages', { replace: true });
    } catch (error) {
      console.error('Erreur lors du démarrage de la conversation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation || !user) return;

    try {
      await messageService.sendMessage(currentConversation, user.uid, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const getRecipientId = (conversation: Conversation): string => {
    if (!user) return '';
    return conversation.participants.find(id => id !== user.uid) || '';
  };

  const getRecipientName = (conversation: Conversation) => {
    if (!user) return 'Utilisateur inconnu';
    const recipientId = conversation.participants.find(id => id !== user.uid);
    if (!recipientId) return 'Utilisateur inconnu';
    
    // Utiliser les détails des participants stockés dans la conversation
    if (conversation.participantsDetails?.[recipientId]) {
      return conversation.participantsDetails[recipientId].name;
    }
    
    return recipientDetails[recipientId]?.name || 'Utilisateur inconnu';
  };

  const formatMessageDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, 'HH:mm');
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return format(date, 'EEEE', { locale: fr });
    } else {
      return format(date, 'dd MMM', { locale: fr });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Fonction pour gérer la fermeture d'une conversation
  const handleCloseConversation = async () => {
    if (!conversationToClose || !user) return;

    try {
      console.log('Fermeture de la conversation:', conversationToClose);
      await messageService.closeConversation(conversationToClose, user.uid);
      
      setConversationToClose(null);
      if (currentConversation === conversationToClose) {
        setCurrentConversation(null);
      }
    } catch (error) {
      console.error('Erreur lors de la fermeture de la conversation:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950/20 pt-24">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-purple-900/10 border-purple-500/20">
            <CardHeader>
              <CardTitle>Accès refusé</CardTitle>
              <p className="text-gray-400">
                Vous devez être connecté pour accéder à la messagerie.
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-gradient-to-b from-black to-purple-950/20 overflow-hidden">
      <div className="container mx-auto h-full pt-20 pb-4 px-4 flex flex-col">
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 flex-shrink-0">
          Messages
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Liste des conversations */}
          <div className="md:col-span-1 bg-purple-900/10 rounded-lg border border-purple-500/20 overflow-hidden flex flex-col">
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto" />
                    <p className="mt-2 text-sm text-gray-400">Chargement des conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Aucune conversation</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 rounded-lg relative group ${
                        currentConversation === conversation.id
                          ? 'bg-purple-900/30 border border-purple-500/50'
                          : 'bg-zinc-800/50 border border-purple-500/20 hover:bg-purple-900/20'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConversationToClose(conversation.id);
                        }}
                        className="absolute right-2 top-2 p-1.5 rounded-full bg-purple-900/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-800 z-10"
                      >
                        <X className="h-4 w-4 text-purple-200" />
                      </button>
                      <div
                        onClick={() => setCurrentConversation(conversation.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {conversation.participantsDetails?.[getRecipientId(conversation)]?.avatar ? (
                              <Avatar className="h-12 w-12">
                                <AvatarImage 
                                  src={conversation.participantsDetails[getRecipientId(conversation)].avatar} 
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-purple-900/50 text-purple-200">
                                  {getInitials(getRecipientName(conversation))}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-purple-900/50 text-purple-200">
                                  {getInitials(getRecipientName(conversation))}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {getRecipientName(conversation)}
                            </p>
                            {conversation.lastMessage && (
                              <>
                                <p className="text-sm text-gray-400 truncate">
                                  {conversation.lastMessage.content}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatMessageDate(conversation.lastMessage.createdAt)}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Zone de conversation */}
          <div className="md:col-span-2 bg-purple-900/10 rounded-lg border border-purple-500/20 flex flex-col overflow-hidden">
            {currentConversation ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <div className="p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user.uid ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderId === user.uid
                              ? 'bg-purple-600/90 ml-2'
                              : 'bg-zinc-800/90 mr-2'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {message.senderId !== user.uid && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                {message.senderDetails?.avatar ? (
                                  <AvatarImage src={message.senderDetails.avatar} />
                                ) : (
                                  <AvatarFallback className="bg-purple-900/50 text-purple-200">
                                    {getInitials(message.senderDetails?.name || 'U')}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            )}
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <p className={`text-sm mb-1 break-words ${
                                message.senderId === user.uid
                                  ? 'text-white/90'
                                  : 'text-white/90'
                              }`}>
                                {message.content}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatMessageDate(message.createdAt)}
                              </p>
                            </div>
                            {message.senderId === user.uid && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                {message.senderDetails?.avatar ? (
                                  <AvatarImage src={message.senderDetails.avatar} />
                                ) : (
                                  <AvatarFallback className="bg-purple-900/50 text-purple-200">
                                    {getInitials(message.senderDetails?.name || 'U')}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Zone de saisie */}
                <div className="p-4 border-t border-purple-500/20 flex-shrink-0">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 bg-zinc-800/50 border-purple-500/20 focus:border-purple-500 text-white"
                    />
                    <Button 
                      type="submit" 
                      className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
                      disabled={!newMessage.trim()}
                    >
                      Envoyer
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">
                  Sélectionnez une conversation pour commencer
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Boîte de dialogue de confirmation */}
      <AlertDialog 
        open={!!conversationToClose} 
        onOpenChange={(open) => {
          if (!open) setConversationToClose(null);
        }}
      >
        <AlertDialogContent className="bg-zinc-900 border border-purple-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Fermer la conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Êtes-vous sûr de vouloir fermer cette conversation ? 
              Les messages seront conservés mais la conversation sera retirée de votre liste.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white hover:bg-zinc-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseConversation}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 