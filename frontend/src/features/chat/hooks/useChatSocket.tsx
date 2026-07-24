import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useQueryClient } from '@tanstack/react-query';
import { ChatMessageDto } from '@/features/chat/types/chat';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { MessageCircle } from 'lucide-react';

export const useChatSocket = (
  isAuthenticated: boolean, 
  currentUsername?: string, 
  disabled: boolean = false,
  onTyping?: (username: string) => void
) => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !currentUsername || disabled) return;

    const client = new Client({
      brokerURL: `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081/ws'}/auction/websocket`,
      beforeConnect: () => {
        const userStr = Cookies.get('user');
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            if (userObj.token) {
              client.connectHeaders = { Authorization: `Bearer ${userObj.token}` };
            }
          } catch (e) { }
        }
      },
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to Chat WebSocket!');

      client.subscribe('/user/queue/messages', (message) => {
        const payload = JSON.parse(message.body);

        if (payload.type === 'READ_RECEIPT') {
          queryClient.invalidateQueries({ queryKey: ['chatHistory', payload.reader] });
          queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
          return;
        }

        if (payload.type === 'TYPING') {
          if (onTyping && payload.senderUsername !== currentUsername) {
            onTyping(payload.senderUsername);
          }
          return;
        }

        const chatMsg: ChatMessageDto = payload;

        // Determine the other user in the conversation
        const otherUsername = chatMsg.senderUsername === currentUsername
          ? chatMsg.receiverUsername
          : chatMsg.senderUsername;

        // Append to history cache
        queryClient.setQueryData(['chatHistory', otherUsername], (old: ChatMessageDto[] | undefined) => {
          if (!old) return [chatMsg];
          // Prevent duplicate append if multiple hooks are active
          const exists = old.some(m => m.timestamp === chatMsg.timestamp && m.content === chatMsg.content && m.senderUsername === chatMsg.senderUsername);
          if (exists) return old;
          return [...old, chatMsg];
        });

        // Invalidate conversations to bring this user to top
        queryClient.invalidateQueries({ queryKey: ['chatConversations'] });

        if (chatMsg.senderUsername !== currentUsername) {
          toast.info(`Tin nhắn mới từ ${chatMsg.senderUsername}`, {
            description: (
              <span className="text-neutral-900 text-[15px] font-medium block mt-1">
                {chatMsg.imageUrl ? '[Hình ảnh]' : (chatMsg.content.length > 50 ? chatMsg.content.substring(0, 50) + '...' : chatMsg.content)}
              </span>
            ),
            icon: <MessageCircle className="w-5 h-5 text-primary" />,
          });

          // Play notification sound safely
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio autoplay blocked by browser', e));
          } catch (error) { }
        }
      });
    };

    client.onStompError = (frame) => {
      const errMsg = frame.headers['message'] || '';
      if (!errMsg.includes('ExecutorSubscribableChannel')) {
        console.error('Chat Broker reported error: ' + errMsg);
      }
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [isAuthenticated, currentUsername, queryClient, disabled, onTyping]);

  const sendMessage = (receiverUsername: string, content: string, imageUrl?: string) => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          receiverUsername,
          content,
          imageUrl
        }),
      });
    }
  };

  const sendTyping = (receiverUsername: string) => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({
          receiverUsername,
        }),
      });
    }
  };

  return { sendMessage, sendTyping };
};
