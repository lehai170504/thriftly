/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { BidRequest, BidResponse } from '@/features/auction/types/auction';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { stopStompReconnect, websocketUrl } from '@/lib/websocket';
import { useAuth } from '@/contexts/AuthContext';

export const useAuctionSocket = (auctionId: string) => {
  const { isAuthenticated } = useAuth();
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [bids, setBids] = useState<BidResponse[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentHighestBid, setCurrentHighestBid] = useState<number>(0);

  useEffect(() => {
    if (!auctionId) return;

    // Fetch bid history first
    api.get<BidResponse[]>(`/auctions/${auctionId}/bids`)
      .then(res => {
        setBids(res.data);
        if (res.data.length > 0) {
          setCurrentHighestBid(Math.max(...res.data.map(b => b.bidAmount)));
        }
      })
      .catch(err => console.error("Failed to fetch bid history", err));

    if (!isAuthenticated) {
      setStompClient(null);
      setIsConnected(false);
      return;
    }

    // Initialize Stomp Client directly with WebSocket
    // This ensures HttpOnly cookies are automatically sent during the WebSocket handshake
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
      console.log('Connected to WebSocket!');

      // Subscribe to the auction topic
      client.subscribe(`/topic/auction/${auctionId}`, (message) => {
        if (message.body) {
          const newBid: BidResponse = JSON.parse(message.body);
          setBids((prevBids) => [newBid, ...prevBids]);
          setCurrentHighestBid((prev) => Math.max(prev, newBid.bidAmount));
        }
      });

      // Subscribe to error queue
      client.subscribe(`/user/queue/errors`, (message) => {
        if (message.body) {
          toast.error(message.body);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      setIsConnected(false);
      stopStompReconnect(client);
    };

    client.onWebSocketClose = () => setIsConnected(false);

    client.activate();
    setStompClient(client);

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [auctionId, isAuthenticated]);

  const placeBid = useCallback((amount: number) => {
    if (stompClient && stompClient.connected) {
      const bidRequest: BidRequest = {
        auctionSessionId: auctionId,
        bidAmount: amount,
      };
      stompClient.publish({
        destination: '/app/auction/bid',
        body: JSON.stringify(bidRequest),
      });
    } else {
      console.error('STOMP client is not connected');
    }
  }, [stompClient, auctionId]);

  return { bids, isConnected, placeBid, currentHighestBid };
};
