import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/auth-context';
import { useGame } from '../../context/game-context';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Send, Smile, Loader2, X, RefreshCw, Volume2, VolumeX, MoreHorizontal, Trash } from 'lucide-react';

// Type definitions
type MessageType = 'chat' | 'system' | 'reaction' | 'ping';

interface Message {
  id: string;
  type: MessageType;
  userId?: number;
  username?: string;
  text?: string;
  emoji?: string;
  timestamp: string;
}

// Chat component
const GameChat = () => {
  const { user } = useAuth();
  const { currentGame } = useGame();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]); 
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (!user || !currentGame) return;
    
    const connectWebSocket = () => {
      try {
        setIsConnecting(true);
        setIsError(false);
        
        // Create WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
          console.log('WebSocket connection established');
          setIsConnected(true);
          setIsConnecting(false);
          
          // Authenticate
          socket.send(JSON.stringify({
            type: 'auth',
            userId: user.id,
            username: user.username,
            gameId: currentGame.id
          }));
          
          // Join specific game chat
          socket.send(JSON.stringify({
            type: 'join-game',
            gameId: currentGame.id
          }));
        };
        
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Ignore ping messages
            if (data.type === 'ping') return;
            
            // Add message to list
            setMessages(prev => [
              ...prev, 
              {
                id: crypto.randomUUID(),
                ...data
              }
            ]);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        socket.onclose = () => {
          console.log('WebSocket connection closed');
          setIsConnected(false);
          setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
        };
        
        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsError(true);
          setIsConnected(false);
          setIsConnecting(false);
        };
        
        wsRef.current = socket;
        
        // Clean up on unmount
        return () => {
          socket.close();
        };
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
        setIsError(true);
        setIsConnecting(false);
        setTimeout(connectWebSocket, 5000); // Try again after 5 seconds
      }
    };
    
    connectWebSocket();
  }, [user, currentGame]);
  
  // Send chat message
  const sendMessage = () => {
    if (!messageInput.trim() || !wsRef.current || !isConnected) return;
    
    try {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        text: messageInput.trim()
      }));
      
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Send emoji reaction
  const sendReaction = (emoji: string) => {
    if (!wsRef.current || !isConnected) return;
    
    try {
      wsRef.current.send(JSON.stringify({
        type: 'reaction',
        emoji: emoji
      }));
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString(navigator.language, { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };
  
  // Handle input changes with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    
    // Send typing indicator
    if (!isTyping && e.target.value.length > 0 && wsRef.current && isConnected) {
      setIsTyping(true);
      
      try {
        wsRef.current.send(JSON.stringify({
          type: 'typing',
          isTyping: true
        }));
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
      
      // Clear typing indicator after 3 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        
        try {
          if (wsRef.current && isConnected) {
            wsRef.current.send(JSON.stringify({
              type: 'typing',
              isTyping: false
            }));
          }
        } catch (error) {
          console.error('Error sending typing indicator:', error);
        }
      }, 3000);
    }
  };
  
  // Toggle sound notifications
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };
  
  // Clear chat messages locally
  const clearChat = () => {
    if (confirm('Are you sure you want to clear your chat history? This will only affect your view.')) {
      setMessages([]);
    }
  };
  
  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
      
      // Reset unread count when becoming visible
      if (document.visibilityState === 'visible') {
        setUnreadCount(0);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Track unread messages when not visible
  useEffect(() => {
    if (!isVisible && messages.length > 0) {
      setUnreadCount(prev => prev + 1);
      
      // Play sound if enabled
      if (soundEnabled) {
        try {
          const audio = new Audio('data:audio/wav;base64,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');
          audio.play().catch(e => console.error('Error playing sound:', e));
        } catch (error) {
          console.error('Error playing notification sound:', error);
        }
      }
    }
  }, [messages, isVisible, soundEnabled]);
  
  // More emoji categories for the picker
  const emojiCategories = {
    smileys: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '🥰', '😍', '😘'],
    gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '👋', '🤚', '🖐️', '👏', '🙌'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'],
    food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '⛳', '🎣', '🎽']
  };
  
  // Quick emoji reactions
  const quickEmojis = ['👍', '❤️', '😂', '😮', '👏', '🎉'];
  
  return (
    <div className="w-full h-full flex flex-col bg-white shadow-md rounded-lg">
      <div className="p-3 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h3 className="text-xl font-bold">Game Chat</h3>
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-1 rounded hover:bg-gray-100"
              title={soundEnabled ? "Mute notifications" : "Enable notifications"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            
            <button
              onClick={clearChat}
              className="p-1 rounded hover:bg-gray-100"
              title="Clear chat history"
            >
              <Trash size={16} />
            </button>
            
            <span className={`text-xs px-2 py-1 rounded-full ${
              isConnected 
                ? 'bg-green-100 text-green-800' 
                : isConnecting 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
            }`}>
              {isConnected 
                ? 'Connected' 
                : isConnecting 
                  ? 'Connecting...' 
                  : isError 
                    ? 'Error' 
                    : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex-grow p-3 overflow-hidden">
        <div className="h-[300px] w-full pr-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
              No messages yet. Be the first to say hello!
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`mb-2 ${
                    message.type === 'system' 
                      ? 'px-2 py-1 text-center text-sm text-gray-500' 
                      : message.type === 'reaction' 
                        ? 'text-center' 
                        : message.userId === user?.id 
                          ? 'flex flex-row-reverse' 
                          : 'flex flex-row'
                  }`}
                >
                  {message.type === 'system' ? (
                    <div className="italic">
                      {message.text}
                    </div>
                  ) : message.type === 'reaction' ? (
                    <div className="text-2xl">
                      {message.emoji} <span className="text-xs text-gray-500">{message.username}</span>
                    </div>
                  ) : (
                    <>
                      <div className={`flex ${message.userId === user?.id ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[80%]`}>
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {message.username?.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        
                        <div className={`flex flex-col ${message.userId === user?.id ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">
                              {message.userId === user?.id ? 'You' : message.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          
                          <div className={`px-3 py-2 rounded-lg text-sm ${
                            message.userId === user?.id 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100'
                          }`}>
                            {message.text}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {typingUsers.length > 0 && (
                <div className="text-xs text-gray-500 italic px-2">
                  {typingUsers.length === 1 
                    ? `${typingUsers[0]} is typing...` 
                    : `${typingUsers.length} people are typing...`}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      
      <div className="p-3 border-t">
        <div className="flex justify-between items-center">
          <div className="flex gap-1 flex-wrap py-1 mb-2">
            {quickEmojis.map((emoji) => (
              <button 
                key={emoji} 
                className="px-2 py-1 text-lg border rounded hover:bg-gray-100 disabled:opacity-50"
                onClick={() => sendReaction(emoji)}
                disabled={!isConnected}
              >
                {emoji}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              disabled={!isConnected}
            >
              <Smile className="h-4 w-4" />
            </button>
            
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="absolute bottom-10 right-0 bg-white border rounded-lg shadow-lg p-2 z-10"
                style={{ width: '250px' }}
              >
                <div className="flex flex-col gap-2">
                  {Object.entries(emojiCategories).map(([category, emojis]) => (
                    <div key={category} className="emoji-category">
                      <div className="text-xs font-bold text-gray-500 mb-1 capitalize">{category}</div>
                      <div className="flex flex-wrap gap-1">
                        {emojis.map(emoji => (
                          <button
                            key={emoji}
                            className="p-1 text-xl hover:bg-gray-100 rounded"
                            onClick={() => {
                              sendReaction(emoji);
                              setShowEmojiPicker(false);
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex w-full gap-2">
          <textarea 
            value={messageInput} 
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={
              !user 
                ? "Please log in to chat" 
                : !isConnected 
                  ? "Reconnecting..." 
                  : "Type your message..."
            }
            className="w-full p-2 border rounded min-h-[40px] max-h-[120px] resize-none disabled:bg-gray-100"
            disabled={!isConnected || !user}
          />
          <button 
            onClick={sendMessage} 
            disabled={!messageInput.trim() || !isConnected || !user} 
            className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameChat;