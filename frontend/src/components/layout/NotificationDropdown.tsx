'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Trophy, TrendingDown, Package, Wallet, Truck, CheckCircle, AlertTriangle, Info, Play, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useMyNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useDeleteNotification, useDeleteAllNotifications } from '@/features/notifications/hooks/useNotifications';
import { useNotificationSocket } from '@/features/notifications/hooks/useNotificationSocket';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/features/notifications/types/notification';
import { cn, formatNotificationMessage } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export const NotificationDropdown = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useNotificationSocket(isAuthenticated);

  const { data: notifications = [] } = useMyNotifications(isAuthenticated);
  const { data: unreadCount = 0 } = useUnreadCount(isAuthenticated);
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: deleteAllNotifications } = useDeleteAllNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);

    switch (notification.type) {
      case 'AUCTION_WON':
      case 'ORDER_CREATED':
      case 'ORDER_PAID':
      case 'ORDER_SHIPPED':
      case 'ESCROW_RELEASED':
      case 'ORDER_DISPUTED':
        if (notification.type === 'ORDER_CREATED') {
          router.push('/seller/orders');
        } else {
          router.push('/orders');
        }
        break;
      case 'AUCTION_OUTBID':
      case 'AUCTION_START':
        router.push(`/products/${notification.relatedEntityId}`);
        break;
      default:
        break;
    }
  };

  const handleDeleteSingle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const handleDeleteAll = () => {
    deleteAllNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'AUCTION_WON': return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'AUCTION_OUTBID': return <TrendingDown className="w-5 h-5 text-destructive" />;
      case 'ORDER_CREATED': return <Package className="w-5 h-5 text-blue-500" />;
      case 'ORDER_PAID': return <Wallet className="w-5 h-5 text-emerald-500" />;
      case 'ORDER_SHIPPED': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'ESCROW_RELEASED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'ORDER_DISPUTED': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'AUCTION_START': return <Play className="w-5 h-5 text-primary" />;
      default: return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="relative h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent outline-none transition-colors border border-transparent hover:border-border">
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full border border-background flex items-center justify-center text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 md:w-96 max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-2xl bg-card border border-border shadow-xl" align="end">
        <div className="p-3.5 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
          <h3 className="font-heading font-bold text-sm text-foreground">Thông báo</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary hover:text-primary hover:bg-primary/5 h-7 px-2 font-medium"
                onClick={() => markAllAsRead()}
                title="Đánh dấu tất cả đã đọc"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Đã đọc
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 px-2 font-medium"
                onClick={handleDeleteAll}
                title="Xóa tất cả thông báo"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh] bg-card">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs">Bạn chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "group p-3.5 cursor-pointer transition-colors hover:bg-muted/40 flex gap-3 items-start relative",
                    !notification.isRead ? "bg-primary/5 hover:bg-primary/10" : "bg-card"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-5">
                    <p className={cn("text-xs mb-1 text-foreground leading-relaxed", !notification.isRead && "font-semibold text-primary")}>
                      {formatNotificationMessage(notification.message)}
                    </p>
                    <p className="text-[10px] text-muted-foreground tabular-nums">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    {!notification.isRead && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                    <button
                      onClick={(e) => handleDeleteSingle(e, notification.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      title="Xóa thông báo này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
