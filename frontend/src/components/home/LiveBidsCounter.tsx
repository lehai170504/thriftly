'use client';

import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { stopStompReconnect, websocketUrl } from '@/lib/websocket';
import { useAuth } from '@/contexts/AuthContext';

interface LiveBidsCounterProps {
  productId?: string;
}

export function LiveBidsCounter({ productId }: LiveBidsCounterProps) {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!productId || !isAuthenticated) return;

    const client = new Client({
      brokerURL: websocketUrl(),
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      client.subscribe(`/topic/auction/${productId}/bids-count`, (message) => {
        if (message.body) {
          const newCount = parseInt(message.body, 10);
          setCount(newCount);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error:', frame.headers?.message);
      setIsConnected(false);
      stopStompReconnect(client);
    };

    client.onWebSocketClose = () => setIsConnected(false);

    client.activate();
    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [isAuthenticated, productId]);

  if (!productId || !isAuthenticated) return null;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border bg-background/50 backdrop-blur-sm ${isConnected
          ? 'border-emerald-500/30 text-foreground shadow-[0_0_10px_rgba(16,185,129,0.1)]'
          : 'border-amber-500/30 text-muted-foreground'
        }`}>
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`}></span>
        {isConnected ? `${count} người tham gia` : 'Đang kết nối...'}
      </div>
    </div>
  );
}
