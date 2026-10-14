'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, LogIn, Sparkles, MessageSquareQuote } from 'lucide-react';

export interface AuthPromptOptions {
  title?: string;
  description?: string;
  actionText?: string;
  cancelText?: string;
  redirectUrl?: string;
}

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  options?: AuthPromptOptions;
}

export function AuthPromptModal({ isOpen, onClose, options }: AuthPromptModalProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogin = () => {
    onClose();
    const target = options?.redirectUrl || pathname || '/';
    const redirectParam = encodeURIComponent(target);
    router.push(`/login?redirect=${redirectParam}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[28px] border border-border bg-background shadow-2xl">
        <div className="relative p-6 sm:p-7 flex flex-col items-center text-center">
          <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-sm mb-4">
            <LogIn className="size-8" />
          </div>

          <DialogHeader className="text-center sm:text-center space-y-2">
            <DialogTitle className="text-2xl font-heading font-bold text-foreground">
              {options?.title || 'Yêu cầu đăng nhập'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {options?.description || 'Vui lòng đăng nhập tài khoản Thriftly để tiếp tục thao tác và trải nghiệm đầy đủ các tính năng.'}
            </DialogDescription>
          </DialogHeader>

          <div className="w-full mt-6 p-4 rounded-2xl bg-muted/40 border border-border/80 text-left space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <span>Giao dịch an toàn được bảo vệ bởi ví tạm giữ Escrow</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
              <Sparkles className="size-4 text-primary shrink-0" />
              <span>Đăng bán đồ cũ, tham gia đấu giá trực tiếp 24/7</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
              <MessageSquareQuote className="size-4 text-primary shrink-0" />
              <span>Nhắn tin trao đổi bảo mật với người mua & người bán</span>
            </div>
          </div>

          <div className="w-full mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-12 rounded-xl text-sm font-semibold border-border hover:bg-muted"
            >
              {options?.cancelText || 'Để sau'}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleLogin}
              className="h-12 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg"
            >
              {options?.actionText || 'Đăng nhập ngay'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
