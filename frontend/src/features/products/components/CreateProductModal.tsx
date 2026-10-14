'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateProductForm } from '@/features/products/components/CreateProductForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MissingInfoModal } from '@/features/checkout/components/MissingInfoModal';
import React from 'react';

interface CreateProductModalProps {
  children?: React.ReactNode;
}

export function CreateProductModal({ children }: CreateProductModalProps) {
  const [open, setOpen] = useState(false);
  const [isMissingInfoOpen, setIsMissingInfoOpen] = useState(false);
  const { user, isAuthenticated, openAuthPrompt } = useAuth();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      if (!isAuthenticated) {
        openAuthPrompt({
          title: 'Đăng nhập để đăng tin',
          description: 'Bạn cần đăng nhập tài khoản Thriftly để bắt đầu đăng tin bán đồ cũ hoặc tạo phiên đấu giá sản phẩm.',
          redirectUrl: '/products'
        });
        return;
      }
      if (!user?.phone || !user?.address) {
        setIsMissingInfoOpen(true);
        return;
      }
    }
    setOpen(newOpen);
  };

  const handleSuccessMissingInfo = () => {
    setIsMissingInfoOpen(false);
    setOpen(true);
  };

  return (
    <>
      {children ? (
        React.isValidElement(children) ? (
          React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              handleOpenChange(true);
            }
          })
        ) : (
          <span onClick={() => handleOpenChange(true)}>{children}</span>
        )
      ) : (
        <Button onClick={() => handleOpenChange(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-xs transition-all duration-150 active:scale-[0.98]">
          <Plus className="mr-2 h-4 w-4" /> Đăng tin
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-3xl p-0 flex flex-col gap-0 border-border overflow-hidden max-h-[90vh] bg-card shadow-xl rounded-2xl">
          <div className="p-5 pb-4 border-b border-border flex-shrink-0 relative z-10 bg-muted/20">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading font-bold pr-8 text-foreground">Đăng bán sản phẩm</DialogTitle>
              <DialogDescription>
                Điền thông tin chi tiết về sản phẩm bạn muốn bán hoặc đấu giá.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-background">
            <CreateProductForm onSuccess={() => setOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <MissingInfoModal
        isOpen={isMissingInfoOpen}
        onOpenChange={setIsMissingInfoOpen}
        onSuccess={handleSuccessMissingInfo}
      />
    </>
  );
}
