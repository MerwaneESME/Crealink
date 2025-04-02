import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Send as SendIcon, MoreHorizontalIcon, PaperclipIcon, SmileIcon } from 'lucide-react';

// Exemple de données pour les conversations
interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    online?: boolean;
  }[];
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  jobTitle: string;
  messages: Message[];
  unreadCount: number;
}

// Utilisateur connecté pour l'exemple (simulation d'un utilisateur authentifié)
const currentUser = {
  id: 'user-1',
  name: 'Admin',
  role: 'admin',
  avatar: ''
};

// Exemple de conversations
const sampleConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [
      {
        id: 'user-1',
        name: 'Admin',
        avatar: '',
        role: 'admin',
        online: true
      },
      {
        id: 'user-2',
        name: 'GameMaster',
        avatar: '',
        role: 'creator',
        online: true
      }
    ],
    lastMessage: {
      content: "Merci pour l'acceptation de ma candidature ! Quand pourrions-nous commencer ?",
      timestamp: '2025-03-27T14:30:00.000Z',
      senderId: 'user-2'
    },
    jobTitle: 'Recherche monteur vidéo pour ma chaîne gaming',
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-1',
        content: "Bonjour, j'ai vu votre candidature pour le poste de monteur vidéo et je suis intéressé par votre profil.",
        timestamp: '2025-03-27T10:15:00.000Z',
        read: true
      },
      {
        id: 'msg-2',
        senderId: 'user-2',
        content: "Bonjour ! Merci de votre retour. Je suis très enthousiaste à l'idée de travailler sur ce projet.",
        timestamp: '2025-03-27T11:20:00.000Z',
        read: true
      },
      {
        id: 'msg-3',
        senderId: 'user-1',
        content: "J'ai décidé d'accepter votre candidature. Vos références et votre portfolio sont impressionnants.",
        timestamp: '2025-03-27T13:45:00.000Z',
        read: true
      },
      {
        id: 'msg-4',
        senderId: 'user-2',
        content: "Merci pour l'acceptation de ma candidature ! Quand pourrions-nous commencer ?",
        timestamp: '2025-03-27T14:30:00.000Z',
        read: false
      }
    ],
    unreadCount: 1
  },
  {
    id: 'conv-2',
    participants: [
      {
        id: 'user-1',
        name: 'Admin',
        avatar: '',
        role: 'admin',
        online: true
      },
      {
        id: 'user-3',
        name: 'LifestyleQueen',
        avatar: '',
        role: 'creator',
        online: false
      }
    ],
    lastMessage: {
      content: "Je vous envoie les détails concernant le style de miniatures que je recherche.",
      timestamp: '2025-03-26T18:10:00.000Z',
      senderId: 'user-3'
    },
    jobTitle: 'Expert en thumbnails pour chaîne lifestyle',
    messages: [
      {
        id: 'msg-5',
        senderId: 'user-3',
        content: "Bonjour, suite à votre acceptation pour la création de miniatures, je voulais discuter du style que je recherche.",
        timestamp: '2025-03-26T15:30:00.000Z',
        read: true
      },
      {
        id: 'msg-6',
        senderId: 'user-1',
        content: "Bonjour, je serais ravi d'en savoir plus sur vos préférences et le style que vous souhaitez pour vos miniatures.",
        timestamp: '2025-03-26T16:15:00.000Z',
        read: true
      },
      {
        id: 'msg-7',
        senderId: 'user-3',
        content: "Je vous envoie les détails concernant le style de miniatures que je recherche.",
        timestamp: '2025-03-26T18:10:00.000Z',
        read: true
      }
    ],
    unreadCount: 0
  },
  {
    id: 'conv-3',
    participants: [
      {
        id: 'user-1',
        name: 'Admin',
        avatar: '',
        role: 'admin',
        online: true
      },
      {
        id: 'user-4',
        name: 'VoiceProStudio',
        avatar: '',
        role: 'expert',
        online: false
      }
    ],
    lastMessage: {
      content: "Je viens de terminer l'enregistrement du premier épisode. Vous pouvez le télécharger ici.",
      timestamp: '2025-03-25T09:45:00.000Z',
      senderId: 'user-4'
    },
    jobTitle: 'Voix-off pour documentaires éducatifs',
    messages: [
      {
        id: 'msg-8',
        senderId: 'user-1',
        content: "Bonjour, j'aimerais discuter des détails concernant l'enregistrement des voix-off pour ma série de documentaires.",
        timestamp: '2025-03-24T11:20:00.000Z',
        read: true
      },
      {
        id: 'msg-9',
        senderId: 'user-4',
        content: "Bonjour ! Je serais ravi de travailler sur ce projet. Pourriez-vous me donner plus de détails sur le ton et le style que vous recherchez ?",
        timestamp: '2025-03-24T13:30:00.000Z',
        read: true
      },
      {
        id: 'msg-10',
        senderId: 'user-1',
        content: "Bien sûr. Je cherche un ton posé et professionnel, mais chaleureux. Je vous envoie le script du premier épisode.",
        timestamp: '2025-03-24T14:15:00.000Z',
        read: true
      },
      {
        id: 'msg-11',
        senderId: 'user-4',
        content: "Je viens de terminer l'enregistrement du premier épisode. Vous pouvez le télécharger ici.",
        timestamp: '2025-03-25T09:45:00.000Z',
        read: false
      }
    ],
    unreadCount: 1
  }
];

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConversation) {
      // Ne pas faire défiler automatiquement lors de la sélection d'une conversation
      // Marquer les messages comme lus
      const updatedConversations = conversations.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            unreadCount: 0,
            messages: conv.messages.map(msg => ({
              ...msg,
              read: true
            }))
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: {
            content: newMessage,
            timestamp: new Date().toISOString(),
            senderId: currentUser.id
          }
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, newMsg],
        lastMessage: {
          content: newMessage,
          timestamp: new Date().toISOString(),
          senderId: currentUser.id
        }
      };
    });
    
    setNewMessage('');
    // Défiler vers le bas uniquement après l'envoi d'un message
    setTimeout(scrollToBottom, 100);
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatConversationDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short'
      }).format(date);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== currentUser.id);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <div className="flex flex-col md:flex-row h-[calc(100vh-240px)] gap-4 rounded-lg shadow-md overflow-hidden border border-purple-500/30 bg-gradient-to-br from-background via-purple-950/20 to-pink-950/20 backdrop-blur-sm">
          {/* Liste des conversations */}
          <div className="md:w-1/3 border-r border-purple-500/30">
            <div className="p-4 border-b border-purple-500/30 bg-purple-500/10">
              <h2 className="font-semibold text-lg">Conversations</h2>
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-4rem)] bg-background/30">
              {conversations.map(conversation => {
                const otherParticipant = getOtherParticipant(conversation);
                return (
                  <div 
                    key={conversation.id}
                    className={`p-4 hover:bg-purple-500/10 cursor-pointer border-b border-purple-500/20 ${selectedConversation?.id === conversation.id ? 'bg-purple-500/20' : ''}`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={otherParticipant?.avatar} />
                          <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {otherParticipant?.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold truncate">{otherParticipant?.name}</h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatConversationDate(conversation.lastMessage.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conversation.lastMessage.senderId === currentUser.id ? 'Vous: ' : ''}{conversation.lastMessage.content}
                        </p>
                        <div className="mt-1">
                          <p className="text-xs text-foreground/70 truncate italic">{conversation.jobTitle}</p>
                        </div>
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="flex justify-end mt-1">
                        <Badge variant="destructive" className="rounded-full px-2 text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Zone de messages */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col bg-background/50 backdrop-blur-sm">
              {/* En-tête de conversation */}
              <div className="p-4 border-b border-purple-500/30 flex items-center justify-between bg-purple-500/10">
                <div className="flex items-center gap-3">
                  {selectedConversation && getOtherParticipant(selectedConversation) && (
                    <>
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar} />
                          <AvatarFallback>{getOtherParticipant(selectedConversation)?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {getOtherParticipant(selectedConversation)?.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{getOtherParticipant(selectedConversation)?.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {getOtherParticipant(selectedConversation)?.online ? 'En ligne' : 'Hors ligne'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontalIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gradient-to-br from-background/90 to-purple-950/5">
                <div className="bg-gradient-to-r from-purple-600/30 to-pink-500/30 rounded-lg p-4 text-center mx-auto mb-4 border border-purple-500/20">
                  <h4 className="font-semibold">{selectedConversation.jobTitle}</h4>
                  <p className="text-sm text-muted-foreground">Début de votre conversation</p>
                </div>
                
                {selectedConversation.messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] ${
                        message.senderId === currentUser.id 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg shadow-md shadow-purple-500/20' 
                          : 'bg-muted/30 text-foreground rounded-tl-lg rounded-tr-lg rounded-br-lg'
                      } p-3`}
                    >
                      <p>{message.content}</p>
                      <div className="flex justify-end mt-1">
                        <span className="text-xs opacity-70">{formatMessageDate(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Saisie de message */}
              <form onSubmit={handleSendMessage} className="border-t border-purple-500/30 p-4 flex gap-2 bg-purple-950/15 backdrop-blur-sm">
                <Button variant="outline" size="icon" type="button" className="bg-background/30 hover:bg-purple-500/30 border-purple-500/30">
                  <PaperclipIcon className="h-5 w-5" />
                </Button>
                <Input 
                  placeholder="Écrivez votre message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-background/30 border-purple-500/30 placeholder:text-muted-foreground/50 focus-visible:ring-purple-500/50"
                />
                <Button variant="outline" size="icon" type="button" className="bg-background/30 hover:bg-purple-500/30 border-purple-500/30">
                  <SmileIcon className="h-5 w-5" />
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 shadow-sm shadow-purple-500/20">
                  <SendIcon className="h-5 w-5 mr-1" /> Envoyer
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h3>
                <p className="text-muted-foreground">
                  Choisissez une conversation dans la liste pour afficher les messages ou acceptez une offre d'emploi pour démarrer une nouvelle discussion.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Messages; 