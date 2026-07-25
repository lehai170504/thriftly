'use client';

import { useState } from 'react';
import { LiveSessionResponse } from '@/features/live/api/liveApi';
import { useJoin, useRemoteUsers, RemoteUser } from 'agora-rtc-react';
import { useAuctionSocket } from '@/features/auction/hooks/useAuctionSocket';
import { useLiveSocket } from '@/features/live/hooks/useLiveSocket';
import { Heart, Share2, Users, Gavel } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || 'dummy_app_id';

interface LiveFeedItemProps {
  session: LiveSessionResponse;
  isActive: boolean;
}

export default function LiveFeedItem({ session, isActive }: LiveFeedItemProps) {
  const router = useRouter();

  // Agora connection - only join if active
  useJoin({
    appid: appId,
    channel: session.agoraChannelName || '',
    token: null,
    uid: null,
  }, isActive);

  const remoteUsers = useRemoteUsers();
  const hostUser = remoteUsers.find(u => u.uid.toString() === session.hostId);

  const { currentHighestBid } = useAuctionSocket(session.productId);
  const { messages, viewerCount } = useLiveSocket(session.id);

  // Flying hearts state
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);

  // We only show the latest 5 messages in feed
  const feedMessages = messages.slice(-5);

  const handleJoinRoom = () => {
    router.push(`/auctions/${session.productId}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/auctions/${session.productId}`);
    toast.success('Đã sao chép link!');
  };

  const handleHeartClick = () => {
    const newHeart = {
      id: Date.now() + Math.random(),
      left: Math.random() * 40 - 20, // random offset -20px to +20px
    };
    setHearts(prev => [...prev, newHeart]);
    // clear after animation
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000);
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video Element (placeholder for Agora/Video stream) */}
      {hostUser && isActive ? (
        <RemoteUser user={hostUser} playVideo={true} playAudio={true} className="w-full h-full object-cover" />
      ) : (
        <img
          src={session.productThumbnail || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?seed=${session.productId}`}
          className="w-full h-full object-cover"
        />
      )}

      {/* Overlay top */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full pl-1.5 pr-3 py-1 flex items-center gap-2 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-[11px] font-bold text-white shadow-inner">
            {(session.hostUsername || 'H').charAt(0).toUpperCase()}
          </div>
          <span className="text-white text-xs font-semibold">@{session.hostUsername || 'host'}</span>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 flex items-center gap-1.5 text-white text-xs font-semibold shadow-sm">
          <Users className="w-3.5 h-3.5 text-rose-400" /> {viewerCount || 1}
        </div>
      </div>

      {/* Flying Hearts Animation Container */}
      <div className="absolute right-3 bottom-40 w-14 h-72 pointer-events-none z-20 overflow-visible flex justify-center">
        <AnimatePresence>
          {hearts.map(h => (
            <motion.div
              key={h.id}
              initial={{ opacity: 1, y: 0, x: h.left, scale: 0.8 }}
              animate={{ opacity: 0, y: -250, scale: 1.5 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute bottom-0 text-rose-500 drop-shadow-md"
            >
              <Heart className="w-8 h-8 fill-rose-500" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Overlay right actions */}
      <div className="absolute right-4 bottom-24 z-10 flex flex-col gap-5 items-center">
        <button onClick={handleHeartClick} className="flex flex-col items-center gap-1 text-white hover:text-rose-400 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-90 transition-transform shadow-sm hover:bg-black/60">
            <Heart className="w-5 h-5" />
          </div>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-white hover:text-blue-400 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-active:scale-90 transition-transform shadow-sm hover:bg-black/60">
            <Share2 className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* Overlay bottom (Product Info + Chat) */}
      <div className="absolute bottom-0 left-0 right-16 z-10 p-4 pb-6 pt-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end pointer-events-none">

        {/* Floating Product Card */}
        <div
          className="mb-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex items-center gap-3 w-full shadow-lg relative overflow-hidden group/card pointer-events-auto cursor-pointer hover:bg-black/50 transition-colors"
          onClick={handleJoinRoom}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />

          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/20">
            <img
              src={session.productThumbnail || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?seed=${session.productId}`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white line-clamp-1 mb-0.5 drop-shadow-sm">{session.productName}</p>
            <p className="text-[14px] font-bold text-rose-400 drop-shadow-sm">{formatCurrency(currentHighestBid || session.currentPrice || 0)}</p>
          </div>

          <button className="shrink-0 w-8 h-8 mr-1 rounded-full bg-rose-500 flex items-center justify-center animate-pulse group-hover/card:scale-110 transition-transform shadow-[0_0_10px_rgba(244,63,94,0.6)] text-white">
            <Gavel className="w-4 h-4" />
          </button>
        </div>

        {/* Mini Chat */}
        <div className="h-32 overflow-hidden flex flex-col justify-end pb-1 [mask-image:linear-gradient(to_top,black_80%,transparent_100%)] pointer-events-auto">
          {feedMessages.map((msg, idx) => (
            <div key={idx} className="text-[13px] mb-2 animate-in slide-in-from-bottom-2">
              {msg.type === 'CHAT' ? (
                <span className="bg-black/40 backdrop-blur-md border border-white/10 rounded-[16px] rounded-tl-sm px-2.5 py-1 inline-block text-white shadow-sm">
                  <span className="font-semibold text-white/70 mr-1.5">{msg.senderUsername}:</span>
                  {msg.content}
                </span>
              ) : msg.type === 'BID_UPDATE' ? (
                <span className="bg-rose-500/20 backdrop-blur-md border border-rose-500/40 rounded-[16px] px-2.5 py-1 inline-block text-rose-400 font-semibold shadow-sm">
                  🔥 {msg.senderUsername} vừa ra giá {msg.content}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
