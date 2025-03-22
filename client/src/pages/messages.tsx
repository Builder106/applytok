import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/hooks/use-supabase';
import { type User, type Message } from '@shared/schema';
import AuthModal from '@/components/AuthModal';

export default function Messages() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, subscribeToMessages } = useSupabase();
  
  // Fetch conversations/users the current user has messaged with
  const { data: conversations, isLoading: conversationsLoading } = useQuery<{ user: User, lastMessage: Message }[]>({
    queryKey: ['/api/messages/conversations'],
    enabled: !!user,
  });
  
  // Fetch messages for selected user
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedUser?.id],
    enabled: !!user && !!selectedUser,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUser!.id,
          content,
        }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  // Subscribe to real-time messages
  useEffect(() => {
    if (!user) return;

    const subscription = subscribeToMessages(user.id, (message) => {
      // If message is from/to selected user, update messages
      if (selectedUser && (message.senderId.toString() === selectedUser.id.toString() || message.receiverId.toString() === selectedUser.id.toString())) {
        queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedUser.id] });
      }
      // Update conversations list
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, selectedUser, queryClient, subscribeToMessages]);

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary text-white flex items-center justify-center p-4">
        <div className="text-center">
          <i className="ri-message-2-line text-4xl mb-4"></i>
          <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-medium mb-4">Please sign in to view your messages</p>
          <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-secondary text-white">
      {!selectedUser ? (
        // Conversations list
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          
          {conversationsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-md bg-gray-dark" />
              <Skeleton className="h-16 w-full rounded-md bg-gray-dark" />
              <Skeleton className="h-16 w-full rounded-md bg-gray-dark" />
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="space-y-4">
              {conversations.map(({ user: conversationUser, lastMessage }) => (
                <div
                  key={conversationUser.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-dark cursor-pointer hover:bg-gray-dark/50 transition-colors"
                  onClick={() => setSelectedUser(conversationUser)}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-dark overflow-hidden">
                    {conversationUser.profileImage ? (
                      <img 
                        src={conversationUser.profileImage} 
                        alt={conversationUser.fullName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                        {conversationUser.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{conversationUser.fullName}</div>
                    <div className="text-sm text-gray-medium truncate">
                      {lastMessage.senderId.toString() === user.id.toString() ? 'You: ' : ''}{lastMessage.content}
                    </div>
                  </div>
                  <div className="text-xs text-gray-medium">
                    {lastMessage.createdAt && new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="ri-message-2-line text-3xl text-gray-medium mb-2"></i>
              <p className="text-gray-medium">No messages yet</p>
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
          
          <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
            {messagesLoading ? (
              <div className="space-y-4 p-4">
                <Skeleton className="h-12 w-3/4 rounded-md bg-gray-dark" />
                <Skeleton className="h-12 w-2/3 rounded-md bg-gray-dark ml-auto" />
                <Skeleton className="h-12 w-3/4 rounded-md bg-gray-dark" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId.toString() === user.id.toString() ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] rounded-lg p-3 ${
                      message.senderId.toString() === user.id.toString()
                        ? 'bg-primary text-white' 
                        : 'bg-dark'
                    }`}>
                      <div>{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.createdAt && new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
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
              <Button onClick={handleSendMessage} disabled={sendMessageMutation.isPending}>
                <i className="ri-send-plane-line"></i>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
