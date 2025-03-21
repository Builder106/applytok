import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { type User, type Message } from '@shared/schema';

export default function Messages() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    
    fetchUser();
  }, []);
  
  // Fetch conversations/users the current user has messaged with
  const { data: conversations, isLoading: conversationsLoading } = useQuery<{ user: User, lastMessage: Message }[]>({
    queryKey: ["/api/messages"],
    enabled: !!currentUser,
  });
  
  // Fetch messages for selected user
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: [`/api/messages/${selectedUser?.id}`],
    enabled: !!selectedUser,
  });
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    try {
      await apiRequest('POST', '/api/messages', {
        receiverId: selectedUser.id,
        content: newMessage,
      });
      
      setNewMessage('');
      refetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  return (
    <div className="h-screen bg-secondary text-white pb-16 flex flex-col">
      <div className="p-4 border-b border-gray-dark">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>
      
      {!selectedUser ? (
        // User list view
        <div className="flex-1 overflow-auto">
          {conversationsLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-16 w-full rounded-md bg-gray-dark" />
              <Skeleton className="h-16 w-full rounded-md bg-gray-dark" />
              <Skeleton className="h-16 w-full rounded-md bg-gray-dark" />
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div>
              {conversations.map((conv) => (
                <button
                  key={conv.user.id}
                  className="w-full p-4 flex items-center gap-3 border-b border-gray-dark hover:bg-dark"
                  onClick={() => setSelectedUser(conv.user)}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-dark overflow-hidden">
                    {conv.user.profileImage ? (
                      <img 
                        src={conv.user.profileImage} 
                        alt={conv.user.fullName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                        {conv.user.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{conv.user.fullName}</div>
                    <div className="text-sm text-gray-medium truncate">{conv.lastMessage.content}</div>
                  </div>
                  <div className="text-xs text-gray-medium">
                    {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <i className="ri-chat-3-line text-4xl text-gray-medium mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-gray-medium text-center">
                Start conversations with employers or job seekers by applying to positions or reaching out directly.
              </p>
            </div>
          )}
        </div>
      ) : (
        // Chat view
        <>
          <div className="p-4 border-b border-gray-dark flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedUser(null)}
              className="text-white"
            >
              <i className="ri-arrow-left-line"></i>
            </Button>
            <div className="w-10 h-10 rounded-full bg-gray-dark overflow-hidden">
              {selectedUser.profileImage ? (
                <img 
                  src={selectedUser.profileImage} 
                  alt={selectedUser.fullName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                  {selectedUser.fullName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold">{selectedUser.fullName}</div>
              <div className="text-xs text-gray-medium">{selectedUser.headline}</div>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {messagesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4 rounded-md bg-gray-dark ml-auto" />
                <Skeleton className="h-10 w-3/4 rounded-md bg-gray-dark" />
                <Skeleton className="h-10 w-3/4 rounded-md bg-gray-dark ml-auto" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isMine = message.senderId === currentUser?.id;
                  
                  return (
                    <div 
                      key={message.id} 
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[75%] rounded-lg px-4 py-2 ${
                          isMine ? 'bg-accent text-white' : 'bg-dark text-white'
                        }`}
                      >
                        <div>{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-medium">No messages yet. Start the conversation!</p>
              </div>
            )}
          </ScrollArea>
          
          <div className="p-4 border-t border-gray-dark">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-dark border-gray-dark text-white"
              />
              <Button onClick={handleSendMessage}>
                <i className="ri-send-plane-line"></i>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
