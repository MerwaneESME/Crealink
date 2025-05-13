import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useNavigate } from 'react-router-dom';

// Types
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any;
  read: boolean;
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageDate: any;
  unreadCount: number;
}

// Données de test
const sampleContacts: Contact[] = [
  {
    id: 'user1',
    name: 'Thomas Martin',
    avatar: '',
    lastMessage: "J'ai pris connaissance de votre offre, je suis très intéressé !",
    lastMessageDate: { seconds: Date.now() / 1000 - 1800 },
    unreadCount: 2
  },
  {
    id: 'user2',
    name: 'Sophie Dubois',
    avatar: '',
    lastMessage: "Bonjour ! Est-ce que le projet est toujours d'actualité ?",
    lastMessageDate: { seconds: Date.now() / 1000 - 86400 },
    unreadCount: 0
  },
  {
    id: 'user3',
    name: 'Lucas Bernard',
    avatar: '',
    lastMessage: "Merci pour votre retour. Je vous envoie les fichiers demandés.",
    lastMessageDate: { seconds: Date.now() / 1000 - 172800 },
    unreadCount: 0
  },
  {
    id: 'user4',
    name: 'Emma Petit',
    avatar: '',
    lastMessage: "J'aimerais discuter du délai pour ce projet. Est-ce possible de l'étendre ?",
    lastMessageDate: { seconds: Date.now() / 1000 - 259200 },
    unreadCount: 0
  }
];

const sampleMessages: Record<string, Message[]> = {
  user1: [
    {
      id: 'm1',
      senderId: 'user1',
      receiverId: 'currentUser',
      content: "Bonjour, je suis intéressé par votre offre de montage vidéo.",
      timestamp: { seconds: Date.now() / 1000 - 7200 },
      read: true
    },
    {
      id: 'm2',
      senderId: 'currentUser',
      receiverId: 'user1',
      content: "Bonjour Thomas ! Merci pour votre intérêt. Avez-vous de l'expérience en montage de vidéos gaming ?",
      timestamp: { seconds: Date.now() / 1000 - 3600 },
      read: true
    },
    {
      id: 'm3',
      senderId: 'user1',
      receiverId: 'currentUser',
      content: "Oui, j'ai 3 ans d'expérience en montage de vidéos gaming, principalement pour des chaînes YouTube de jeux FPS et MOBA.",
      timestamp: { seconds: Date.now() / 1000 - 3300 },
      read: true
    },
    {
      id: 'm4',
      senderId: 'user1',
      receiverId: 'currentUser',
      content: "J'ai pris connaissance de votre offre, je suis très intéressé !",
      timestamp: { seconds: Date.now() / 1000 - 1800 },
      read: false
    }
  ],
  user2: [
    {
      id: 'm5',
      senderId: 'user2',
      receiverId: 'currentUser',
      content: "Bonjour ! Est-ce que le projet est toujours d'actualité ?",
      timestamp: { seconds: Date.now() / 1000 - 86400 },
      read: true
    }
  ],
  user3: [
    {
      id: 'm6',
      senderId: 'currentUser',
      receiverId: 'user3',
      content: "Bonjour Lucas, pourriez-vous m'envoyer des exemples de vos travaux précédents ?",
      timestamp: { seconds: Date.now() / 1000 - 259200 },
      read: true
    },
    {
      id: 'm7',
      senderId: 'user3',
      receiverId: 'currentUser',
      content: "Bonjour, bien sûr ! Voici le lien vers mon portfolio: https://portfolio-lucas.example.com",
      timestamp: { seconds: Date.now() / 1000 - 172800 + 3600 },
      read: true
    },
    {
      id: 'm8',
      senderId: 'currentUser',
      receiverId: 'user3',
      content: "Merci pour votre portfolio, j'aimerais voir plus spécifiquement vos travaux sur des projets similaires au mien.",
      timestamp: { seconds: Date.now() / 1000 - 172800 + 7200 },
      read: true
    },
    {
      id: 'm9',
      senderId: 'user3',
      receiverId: 'currentUser',
      content: "Merci pour votre retour. Je vous envoie les fichiers demandés.",
      timestamp: { seconds: Date.now() / 1000 - 172800 },
      read: true
    }
  ],
  user4: [
    {
      id: 'm10',
      senderId: 'user4',
      receiverId: 'currentUser',
      content: "J'aimerais discuter du délai pour ce projet. Est-ce possible de l'étendre ?",
      timestamp: { seconds: Date.now() / 1000 - 259200 },
      read: true
    }
  ]
};

export default function Messages() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simuler le chargement des contacts
    setContacts(sampleContacts);
  }, []);

  useEffect(() => {
    if (selectedContact) {
      setMessages(sampleMessages[selectedContact] || []);
      // Défiler vers le dernier message dans la zone de conversation
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [selectedContact]);

  const handleSelectConversation = (contactId: string) => {
    setSelectedContact(contactId);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;
    
    const newMsg: Message = {
      id: `new-${Date.now()}`,
      senderId: user?.uid || '',
      receiverId: selectedContact,
      content: newMessage,
      timestamp: { seconds: Date.now() / 1000 },
      read: false
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    // Défiler vers le dernier message dans la zone de conversation
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  };

  const formatMessageDate = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const formatContactDate = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Messages</h1>
        {user?.role === 'expert' && (
          <Button
            onClick={() => navigate('/jobs')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Trouver des projets
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste des conversations */}
        <div className="md:col-span-1 bg-black/50 rounded-lg border border-purple-500/20 p-4">
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleSelectConversation(contact.id)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedContact === contact.id
                    ? 'bg-purple-900/30 border border-purple-500/50'
                    : 'bg-black/50 border border-purple-500/20 hover:bg-purple-900/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center">
                      <span className="text-xl text-purple-400">
                        {getInitials(contact.name).charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {contact.name}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {contact.lastMessage}
                    </p>
                  </div>
                  {contact.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-purple-600 rounded-full">
                        {contact.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="md:col-span-2 bg-black/50 rounded-lg border border-purple-500/20">
          {selectedContact ? (
            <div className="flex flex-col h-[600px]">
              {/* En-tête de la conversation */}
              <div className="p-4 border-b border-purple-500/20">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
                      <span className="text-lg text-purple-400">
                        {getInitials(contacts.find(c => c.id === selectedContact)?.name || '').charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 
                      className="text-lg font-medium text-white cursor-pointer hover:text-purple-400 transition-colors"
                      onClick={() => handleUserClick(selectedContact)}
                    >
                      {contacts.find(c => c.id === selectedContact)?.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {formatContactDate(contacts.find(c => c.id === selectedContact)?.lastMessageDate.seconds || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 messages-container" ref={messagesEndRef}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === user?.uid
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {formatMessageDate(message.timestamp.seconds)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t border-purple-500/20">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 bg-black/50 border-purple-500/20 text-white"
                  />
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Envoyer
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center">
              <p className="text-gray-400">Sélectionnez une conversation pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 