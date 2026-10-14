'use client';

import { useLiveSession } from '@/features/live/hooks/useLive';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, VideoOff } from 'lucide-react';
import dynamic from 'next/dynamic';

// We must dynamically import the actual LiveRoom UI because Agora requires browser environment (window/navigator)
const LiveVideoChat = dynamic(() => import('@/features/live/components/LiveVideoChat'), {
  ssr: false,
  loading: () => (
    <div className="dark flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-foreground p-10 bg-background/40 backdrop-blur-xl border border-border rounded-[32px] shadow-2xl">
        <div className="relative flex h-16 w-16">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50"></span>
          <Loader2 className="relative w-16 h-16 animate-spin text-primary" />
        </div>
        <p className="text-xl font-heading font-bold animate-pulse text-foreground/90">Đang kết nối phòng Live...</p>
      </div>
    </div>
  )
});

export default function LiveRoomPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { user } = useAuth();

  const { data: liveSession, isLoading, error } = useLiveSession(productId);

  if (isLoading) {
    return (
      <div className="dark flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="relative flex h-16 w-16">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50"></span>
          <Loader2 className="relative w-16 h-16 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !liveSession) {
    return (
      <div className="dark flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center bg-background text-foreground px-4">
        <div className="flex flex-col items-center text-center bg-card border border-border rounded-2xl p-8 sm:p-10 max-w-md w-full shadow-xl">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
            <VideoOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold mb-2 text-foreground">Phiên Live không khả dụng</h1>
          <p className="text-muted-foreground mb-6 max-w-sm text-sm">Phiên live này chưa bắt đầu, đã kết thúc hoặc không tồn tại.</p>
          <Button onClick={() => router.push(`/products/${productId}`)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold h-10 px-6 text-sm shadow-xs">
            Quay lại sản phẩm
          </Button>
        </div>
      </div>
    );
  }

  const isHost = user?.id === liveSession.hostId;

  return (
    <div className="dark bg-background min-h-[calc(100vh-4rem)]">
      <LiveVideoChat
        liveSession={liveSession}
        isHost={isHost}
        auctionSessionId={productId}
      />
    </div>
  );
}
