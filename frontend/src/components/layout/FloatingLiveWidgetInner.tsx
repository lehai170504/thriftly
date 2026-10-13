'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LiveSessionResponse } from '@/features/live/types/live';
import { X, Play } from 'lucide-react';
import AgoraRTC, { AgoraRTCProvider, useJoin, useRemoteUsers, RemoteUser } from 'agora-rtc-react';
import { formatCurrency } from '@/lib/utils';
import { useAuctionSocket } from '@/features/auction/hooks/useAuctionSocket';

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || 'dummy_app_id';

// Create a separate client instance for the PiP widget
const pipClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export default function FloatingLiveWidgetInner({ session, onDismiss }: { session: LiveSessionResponse, onDismiss: () => void }) {
  return (
    <AgoraRTCProvider client={pipClient}>
      <FloatingLivePlayer session={session} onDismiss={onDismiss} />
    </AgoraRTCProvider>
  );
}

function FloatingLivePlayer({ session, onDismiss }: { session: LiveSessionResponse, onDismiss: () => void }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Use auction socket to get live bid price!
  const { currentHighestBid } = useAuctionSocket(session.productId);

  // Join channel anonymously (uid: null)
  useJoin({
    appid: appId,
    channel: session.agoraChannelName || '',
    token: null,
    uid: null,
  }, true);

  const remoteUsers = useRemoteUsers();
  const hostUser = remoteUsers.find(u => u.uid.toString() === session.hostId);

  const handleJoin = () => {
    router.push(`/auctions/${session.productId}`);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleJoin}
        className="fixed bottom-24 right-6 z-40 cursor-pointer overflow-hidden rounded-2xl bg-background border border-border shadow-2xl ring-1 ring-border/50 sm:bottom-8 sm:right-8 group w-64 h-96 flex flex-col shadow-[0_0_40px_-10px_rgba(225,29,72,0.5)] dark"
      >
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 z-50 rounded-full p-1.5 bg-background/40 backdrop-blur-md text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Live Badge */}
        <div className="absolute top-3 left-3 z-40 flex items-center gap-1.5 bg-destructive/90 backdrop-blur-md text-destructive-foreground px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-ping" />
          LIVE
        </div>

        {/* Content */}
        <div className="flex-1 relative bg-card overflow-hidden w-full h-full">
          {hostUser ? (
            // MUTE AUDIO in PiP to avoid annoying the user unexpectedly
            <RemoteUser user={hostUser} playVideo={true} playAudio={false} className="w-full h-full object-cover scale-105" />
          ) : (
            <img src={session.productThumbnail || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?seed=${session.productId}`} alt={session.productTitle || 'Live stream'} className="w-full h-full object-cover opacity-50" />
          )}

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-300 flex flex-col items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-2 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-primary-foreground ml-1" />
            </div>
            <p className="text-foreground font-bold text-sm">Vào xem ngay</p>
          </div>
        </div>

        {/* Product Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 via-background/60 to-transparent p-4 pt-12">
          <p className="text-foreground text-xs font-medium truncate mb-1 opacity-90">{session.productName || session.productTitle || ''}</p>
          <p className="text-amber-400 font-black text-lg drop-shadow-md">{formatCurrency(currentHighestBid || session.currentPrice || 0)}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
