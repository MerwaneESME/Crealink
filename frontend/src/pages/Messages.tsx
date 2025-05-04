import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

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
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simuler un chargement depuis Firebase
    setLoading(true);
    setTimeout(() => {
      setContacts(sampleContacts);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    if (selectedContact) {
      setMessages(sampleMessages[selectedContact] || []);
      scrollToBottom();
    }
  }, [selectedContact]);

  const handleContactSelect = (contactId: string) => {
    setSelectedContact(contactId);
    
    // Marquer les messages comme lus
    const updatedContacts = contacts.map(contact => {
      if (contact.id === contactId) {
        return { ...contact, unreadCount: 0 };
      }
      return contact;
    });
    
    setContacts(updatedContacts);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;
    
    const newMsg: Message = {
      id: `new-${Date.now()}`,
      senderId: 'currentUser',
      receiverId: selectedContact,
      content: newMessage,
      timestamp: { seconds: Date.now() / 1000 },
      read: false
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      <Card className="shadow-sm">
        <div className="grid md:grid-cols-[300px_1fr] h-[600px]">
          {/* Liste des contacts */}
          <div className="border-r">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            
            {loading ? (
              <div className="flex justify-center items-center h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center p-6 text-gray-500">
                <p>Aucune conversation à afficher</p>
              </div>
            ) : (
              <ScrollArea className="h-[525px]">
                <div className="flex flex-col">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      className={`flex items-center p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 relative ${
                        selectedContact === contact.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                      }`}
                      onClick={() => handleContactSelect(contact.id)}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium truncate">{contact.name}</span>
                          <span className="text-xs text-gray-500">
                            {formatContactDate(contact.lastMessageDate.seconds)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                      </div>
                      {contact.unreadCount > 0 && (
                        <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full">
                          {contact.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          {/* Zone de messages */}
          <div className="flex flex-col">
            {selectedContact ? (
              <>
                <CardHeader className="py-3 border-b">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-2">
                      <AvatarImage 
                        src={contacts.find(c => c.id === selectedContact)?.avatar} 
                        alt={contacts.find(c => c.id === selectedContact)?.name} 
                      />
                      <AvatarFallback>
                        {getInitials(contacts.find(c => c.id === selectedContact)?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-base">
                      {contacts.find(c => c.id === selectedContact)?.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.senderId === 'currentUser' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.senderId === 'currentUser' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === 'currentUser' 
                              ? 'text-primary-foreground/80' 
                              : 'text-gray-500'
                          }`}>
                            {formatMessageDate(message.timestamp.seconds)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="border-t p-3 flex items-center">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Écrivez votre message..."
                    className="flex-1 mr-2"
                  />
                  <Button onClick={handleSendMessage} size="sm">
                    Envoyer
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="mb-4 w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Vos messages</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Sélectionnez une conversation pour afficher les messages ou commencez une nouvelle discussion depuis les offres d'emploi.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 