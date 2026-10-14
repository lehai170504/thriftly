'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'destructive' | 'default';
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  isLoading = false,
  variant = 'destructive'
}: ConfirmDialogProps) {
  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  const isDestructive = variant === 'destructive';
  const Icon = isDestructive ? AlertTriangle : Info;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border p-0 overflow-hidden rounded-2xl shadow-xl">
        <div className={`${isDestructive ? 'bg-destructive/10 border-destructive/20' : 'bg-muted/40 border-border'} p-6 flex flex-col items-center justify-center text-center border-b`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDestructive ? 'bg-destructive/15 text-destructive' : 'bg-primary/10 text-primary'}`}>
            <Icon className="w-6 h-6" />
          </div>
          <DialogTitle className={`text-lg font-heading font-bold mb-1.5 ${isDestructive ? 'text-destructive' : 'text-foreground'}`}>
            {title}
          </DialogTitle>
          <DialogDescription render={<div className="text-muted-foreground text-sm" />}>
            {description}
          </DialogDescription>
        </div>
        <div className="p-4 px-6 bg-card flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="rounded-xl h-9 px-4 border-border text-foreground hover:bg-accent text-sm font-medium"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            className="rounded-xl h-9 px-4 text-sm font-semibold shadow-xs"
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
