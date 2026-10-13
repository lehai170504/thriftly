import type { Client } from '@stomp/stompjs';

export const websocketUrl = (): string => {
  const browserOrigin = typeof window === 'undefined'
    ? 'ws://localhost:8081'
    : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
  const configured = process.env.NEXT_PUBLIC_WS_URL || browserOrigin;
  const base = configured.replace(/\/$/, '').replace(/\/ws$/, '');
  return `${base}/ws/auction`;
};

export const stopStompReconnect = (client: Client): void => {
  client.reconnectDelay = 0;
  if (client.active) void client.deactivate();
};
