'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, ChevronDown, Send, Trash2 } from 'lucide-react';
import { ConversationResponse } from '@/features/chat/types/chat';
import { useChatConversations, useChatHistory, useDeleteConversation, useMarkAsRead } from '../hooks/useChat';
import { useChatSocket } from '../hooks/useChatSocket';
import { useChatStore } from '../store/useChatStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

const QUICK_PROMPTS = [
  'Sản phẩm còn không bạn?',
  'Giá có thương lượng được không?',
  'Cho mình xem thêm ảnh chi tiết nhé',
  'Sản phẩm có lỗi xước gì không bạn?'
];

export function GlobalChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isOpen = useChatStore(state => state.isOpen);
  const setIsOpen = useChatStore(state => state.setIsOpen);
  const activeUser = useChatStore(state => state.activeUser);
  const setActiveUser = useChatStore(state => state.openChatWith);
  const clearActiveUser = useChatStore(state => state.clearActiveUser);
  const activeProduct = useChatStore(state => state.activeProduct);
  const clearActiveProduct = useChatStore(state => state.clearActiveProduct);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<ConversationResponse | null>(null);

  const { sendMessage } = useChatSocket(isAuthenticated, user?.username, pathname.includes('/chat'));
  const { data: conversations, isLoading: isConversationsLoading } = useChatConversations(isAuthenticated);
  const { data: history, isLoading: isHistoryLoading } = useChatHistory(activeUser?.username);
  const { mutate: markAsRead } = useMarkAsRead();
  const deleteConversationMutation = useDeleteConversation();

  const totalUnread = conversations?.reduce((sum, c) => sum + (c.unreadCount || 0), 0) || 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    if (isOpen && activeUser?.username) {
      const hasUnread = history?.some(msg => !msg.isRead && msg.senderUsername !== user?.username);
      if (hasUnread) {
        markAsRead(activeUser.username);
      }
    }
  }, [history, isOpen, activeUser, user?.username, markAsRead]);

  if (!isAuthenticated || pathname === '/chat' || pathname.startsWith('/admin') || pathname.startsWith('/portal-secure-entry')) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeUser) return;
    sendMessage(activeUser.username, message);
    setMessage('');
  };

  const handleSendPrompt = (promptText: string) => {
    if (!activeUser) return;
    sendMessage(activeUser.username, promptText);
  };

  const handleDeleteConversation = () => {
    if (!deleteTarget) return;
    deleteConversationMutation.mutate(deleteTarget.username, {
      onSuccess: () => {
        toast.success('Đã xóa cuộc trò chuyện!');
        if (activeUser?.username === deleteTarget.username) {
          clearActiveUser();
        }
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi xóa cuộc trò chuyện');
      }
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-card border border-border shadow-2xl rounded-2xl w-80 sm:w-96 mb-3 overflow-hidden flex flex-col h-[520px] transition-all">
          <div className="bg-card border-b border-border px-3.5 py-3 flex items-center justify-between shrink-0">
            {activeUser ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-secondary rounded-lg shrink-0" onClick={() => clearActiveUser()}>
                  <ChevronDown className="w-4 h-4 rotate-90" />
                </Button>
                <div className="relative shrink-0">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={activeUser.avatar} />
                    <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">{activeUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-card" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">{activeUser.fullName || activeUser.username}</div>
                  <div className="text-[11px] text-emerald-600 font-medium leading-none">Đang hoạt động</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-1">
                <span className="font-bold text-sm text-foreground">Tin nhắn</span>
                {totalUnread > 0 && (
                  <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                    {totalUnread} mới
                  </span>
                )}
              </div>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg shrink-0" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {activeUser && activeProduct && (
            <div className="flex items-center gap-2.5 border-b border-border bg-muted/40 p-2.5 px-3 shrink-0">
              {activeProduct.imageUrl && (
                <img
                  src={activeProduct.imageUrl}
                  alt={activeProduct.title}
                  className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{activeProduct.title}</p>
                <p className="text-xs font-bold text-primary">{formatCurrency(activeProduct.price)}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs rounded-lg border-primary/40 text-primary hover:bg-primary/10 shrink-0 px-2.5 font-medium"
                onClick={() => {
                  sendMessage(activeUser.username, `Chào bạn, mình quan tâm đến sản phẩm "${activeProduct.title}" (${formatCurrency(activeProduct.price)}). Tình trạng thực tế thế nào ạ?`);
                }}
              >
                Hỏi món này
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="w-6 h-6 text-muted-foreground hover:text-foreground rounded-full shrink-0"
                onClick={() => clearActiveProduct()}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto bg-background flex flex-col min-h-0">
            {!activeUser ? (
              <div className="p-2 divide-y divide-border/40">
                {isConversationsLoading ? (
                  <div className="flex justify-center items-center h-36">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : !conversations || conversations.length === 0 ? (
                  <div className="text-center py-12 px-4 text-muted-foreground text-sm">
                    <p className="font-medium text-foreground mb-1">Chưa có tin nhắn</p>
                    <p className="text-xs">Khi bạn nhắn tin cho người bán hoặc người mua, hội thoại sẽ hiển thị ở đây.</p>
                  </div>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveUser(c);
                        if (c.unreadCount && c.unreadCount > 0) {
                          markAsRead(c.username);
                        }
                      }}
                      className="group relative flex items-center gap-3 p-3 hover:bg-accent/60 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={c.avatar} />
                          <AvatarFallback className="bg-muted text-foreground font-semibold text-xs">{c.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex justify-between items-center mb-0.5">
                          <div className="font-semibold text-foreground text-sm truncate">{c.fullName || c.username}</div>
                          {c.lastMessageTime && (
                            <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                              {format(new Date(c.lastMessageTime), 'HH:mm')}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className={`text-xs truncate ${c.unreadCount && c.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {c.lastMessage || 'Bắt đầu trò chuyện...'}
                          </p>
                          {c.unreadCount && c.unreadCount > 0 ? (
                            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                              {c.unreadCount > 99 ? '99+' : c.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(c);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
                {isHistoryLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : history?.length === 0 ? (
                  <div className="text-center py-8 px-4 text-muted-foreground text-xs space-y-1">
                    <p className="font-medium text-foreground">Bắt đầu trò chuyện với {activeUser.fullName || activeUser.username}</p>
                    <p>Hỏi về sản phẩm, tình trạng, hoặc phương thức giao dịch.</p>
                  </div>
                ) : (
                  history?.map((msg, idx) => {
                    const isMe = msg.senderUsername === user?.username;
                    const isLastMessage = idx === history.length - 1;
                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${isMe ? 'bg-primary text-primary-foreground rounded-br-sm shadow-xs' : 'bg-card border border-border text-foreground rounded-bl-sm shadow-xs'}`}>
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-1 mt-1 mx-1">
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {msg.timestamp ? format(new Date(msg.timestamp), 'HH:mm') : ''}
                          </span>
                          {isMe && isLastMessage && (
                            <span className="text-[10px] text-muted-foreground font-medium ml-1 flex items-center">
                              {msg.isRead ? (
                                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> Đã xem</>
                              ) : (
                                <><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 mr-1"></span> Đã gửi</>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {activeUser && (
            <div className="border-t border-border bg-card flex flex-col shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto p-2 border-b border-border/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSendPrompt(prompt)}
                    className="whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSend} className="p-2.5 flex items-center gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="rounded-xl bg-background border-border h-9 text-sm text-foreground focus-visible:ring-1 focus-visible:ring-primary"
                />
                <Button type="submit" size="icon" disabled={!message.trim()} className="rounded-xl h-9 w-9 shrink-0 shadow-xs">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="relative h-12 px-4 rounded-full shadow-lg border border-border bg-card text-foreground hover:bg-accent flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 text-primary" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
            )}
          </div>
          <span className="text-sm font-semibold">Tin nhắn</span>
          {totalUnread > 0 && (
            <span className="px-1.5 py-0.2 text-[11px] font-bold bg-primary text-primary-foreground rounded-full">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </Button>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa trò chuyện?"
        description={
          <>Xóa toàn bộ tin nhắn với <strong>{deleteTarget?.fullName || deleteTarget?.username}</strong>?</>
        }
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDeleteConversation}
        isLoading={deleteConversationMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
