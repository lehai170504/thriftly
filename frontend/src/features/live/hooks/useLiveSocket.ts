import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { LiveChatMessage } from '../types/live';
import { stopStompReconnect, websocketUrl } from '@/lib/websocket';
import { useAuth } from '@/contexts/AuthContext';

export const useLiveSocket = (liveSessionId: string) => {
  const { isAuthenticated } = useAuth();
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [reactions, setReactions] = useState<{ id: string, emoji: string }[]>([]);

  useEffect(() => {
    if (!liveSessionId || !isAuthenticated) return;

    const client = new Client({
      brokerURL: websocketUrl(),
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      console.log('Connected to Live Chat WebSocket!');

      client.subscribe(`/topic/live/${liveSessionId}`, (message) => {
        if (message.body) {
          const chatMsg: LiveChatMessage = JSON.parse(message.body);
          if (chatMsg.type === 'CHAT' || chatMsg.type === 'BID_UPDATE') {
            setMessages((prev) => [...prev, chatMsg]);
          } else if (chatMsg.type === 'REACTION' && chatMsg.content) {
            const reactionId = Date.now().toString() + Math.random().toString();
            setReactions((prev) => [...prev, { id: reactionId, emoji: chatMsg.content! }]);
            // Auto remove reaction after animation completes (e.g. 2s)
            setTimeout(() => {
              setReactions((prev) => prev.filter(r => r.id !== reactionId));
            }, 2000);
          }
          if (chatMsg.viewerCount !== undefined) {
            setViewerCount(chatMsg.viewerCount);
          }
        }
      });

      // Send JOIN message
      client.publish({
        destination: `/app/live.chat/${liveSessionId}`,
        body: JSON.stringify({ type: 'JOIN' }),
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      setIsConnected(false);
      stopStompReconnect(client);
    };

    client.onWebSocketClose = () => setIsConnected(false);

    client.activate();
    setStompClient(client);

    return () => {
      if (client.active) {
        // Send LEAVE message
        if (client.connected) {
          client.publish({
            destination: `/app/live.chat/${liveSessionId}`,
            body: JSON.stringify({ type: 'LEAVE' }),
          });
        }
        client.deactivate();
      }
    };
  }, [isAuthenticated, liveSessionId]);

  const sendMessage = useCallback((content: string) => {
    if (stompClient && stompClient.connected && content.trim()) {
      const chatMsg = { type: 'CHAT', content };

      stompClient.publish({
        destination: `/app/live.chat/${liveSessionId}`,
        body: JSON.stringify(chatMsg),
      });
    }
  }, [stompClient, liveSessionId]);

  const sendReaction = useCallback((emoji: string) => {
    if (stompClient && stompClient.connected) {
      const chatMsg = { type: 'REACTION', content: emoji };

      stompClient.publish({
        destination: `/app/live.chat/${liveSessionId}`,
        body: JSON.stringify(chatMsg),
      });
    }
  }, [stompClient, liveSessionId]);

  return { messages, viewerCount, isConnected, sendMessage, sendReaction, reactions };
};
