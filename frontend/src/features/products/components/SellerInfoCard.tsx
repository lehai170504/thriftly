import { ShieldCheck, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useChatStore, ChatProductContext } from '@/features/chat/store/useChatStore';
import { useAuth } from '@/contexts/AuthContext';

interface SellerInfoCardProps {
  sellerName: string;
  sellerId: string;
  sellerAvatar?: string;
  isSeller: boolean;
  product?: ChatProductContext;
}

export function SellerInfoCard({ sellerName, sellerId, sellerAvatar, isSeller, product }: SellerInfoCardProps) {
  const { openChatWith } = useChatStore();
  const { isAuthenticated, openAuthPrompt } = useAuth();

  const handleChat = () => {
    if (!isAuthenticated) {
      openAuthPrompt({
        title: 'Đăng nhập để nhắn tin',
        description: 'Vui lòng đăng nhập tài khoản để trao đổi trực tiếp với người bán về tình trạng sản phẩm và thương lượng.',
      });
      return;
    }
    openChatWith(
      { id: sellerId, username: sellerName, fullName: sellerName, avatar: sellerAvatar || '' },
      product || null
    );
  };

  return (
    <div className="flex w-full items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center shadow-xs overflow-hidden shrink-0">
        {sellerAvatar ? (
          <img src={sellerAvatar} alt={sellerName} className="w-full h-full object-cover" />
        ) : (
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sellerName}`} alt={sellerName} className="w-full h-full object-cover" />
        )}
      </div>
      <div>
        <div className="text-xs text-muted-foreground font-medium">Người bán</div>
        <Link href={`/users/${sellerName}`} className="font-semibold text-foreground hover:text-primary transition-colors block text-base">
          {sellerName}
        </Link>
      </div>
      <div className="ml-auto flex flex-col items-end gap-2">
        <div className="flex items-center text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Đã xác thực
        </div>
        {!isSeller && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-xl border-primary/40 text-primary hover:bg-primary/10 shadow-xs font-medium"
            onClick={handleChat}
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            Nhắn tin
          </Button>
        )}
      </div>
    </div>
  );
}
