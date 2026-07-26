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

export function GlobalChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isOpen = useChatStore(state => state.isOpen);
  const setIsOpen = useChatStore(state => state.setIsOpen);
  const activeUser = useChatStore(state => state.activeUser);
  const setActiveUser = useChatStore(state => state.openChatWith);
  const clearActiveUser = useChatStore(state => state.clearActiveUser);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<ConversationResponse | null>(null);

  const { sendMessage } = useChatSocket(isAuthenticated, user?.username, pathname.includes('/chat'));
  const { data: conversations, isLoading: isConversationsLoading } = useChatConversations(isAuthenticated);
  const { data: history, isLoading: isHistoryLoading } = useChatHistory(activeUser?.username);
  const markAsReadMutation = useMarkAsRead();
  const deleteConversationMutation = useDeleteConversation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    if (isOpen && activeUser?.username) {
      const hasUnread = history?.some(msg => !msg.isRead && msg.senderUsername !== user?.username);
      if (hasUnread) {
        markAsReadMutation.mutate(activeUser.username);
      }
    }
  }, [history, isOpen, activeUser, user?.username]);

  if (!isAuthenticated || pathname === '/chat' || pathname.startsWith('/admin') || pathname.startsWith('/portal-secure-entry')) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeUser) return;
    sendMessage(activeUser.username, message);
    setMessage('');
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
        <div className="glass border border-border/50 shadow-2xl shadow-primary/20 rounded-[24px] w-80 sm:w-96 mb-4 overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-card/30 border-b border-border/50 text-foreground p-3 flex items-center justify-between shadow-sm z-10">
            {activeUser ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-secondary rounded-full" onClick={() => clearActiveUser()}>
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </Button>
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={activeUser.avatar} />
                  <AvatarFallback className="bg-muted text-foreground text-xs font-medium">{activeUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm">{activeUser.fullName || activeUser.username}</span>
              </div>
            ) : (
              <div className="font-bold text-sm ml-4">Tin nhắn</div>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-secondary rounded-full" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-transparent flex flex-col">
            {!activeUser ? (
              // Conversation List
              <div className="p-2">
                {isConversationsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : !conversations || conversations.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">Chưa có cuộc trò chuyện nào.</div>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveUser(c);
                        if (c.unreadCount && c.unreadCount > 0) {
                          markAsReadMutation.mutate(c.username);
                        }
                      }}
                      className="group relative flex items-center gap-3 p-3 hover:bg-accent rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={c.avatar} />
                          <AvatarFallback className="bg-muted text-foreground font-medium">{c.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex justify-between items-center mb-0.5">
                          <div className="font-semibold text-foreground text-sm truncate">{c.fullName || c.username}</div>
                          {c.lastMessageTime && (
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">
                              {format(new Date(c.lastMessageTime), 'HH:mm')}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className={`text-xs truncate ${c.unreadCount && c.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {c.lastMessage || 'Bắt đầu trò chuyện...'}
                          </p>
                          {c.unreadCount && c.unreadCount > 0 ? (
                            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {c.unreadCount > 99 ? '99+' : c.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(c);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background shadow-sm border border-border text-destructive hover:text-destructive hover:bg-destructive/10 transition-all z-10 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Chat History
              <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                {isHistoryLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : history?.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!</div>
                ) : (
                  history?.map((msg, idx) => {
                    const isMe = msg.senderUsername === user?.username;
                    const isLastMessage = idx === history.length - 1;
                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] rounded-[24px] px-4 py-2 text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border border-border text-foreground rounded-bl-none shadow-sm'}`}>
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-1 mt-1 mx-1">
                          <span className="text-[10px] text-muted-foreground">
                            {msg.timestamp ? format(new Date(msg.timestamp), 'HH:mm') : ''}
                          </span>
                          {isMe && isLastMessage && (
                            <span className="text-[10px] text-muted-foreground font-medium ml-1 flex items-center">
                              {msg.isRead ? (
                                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> Đã xem</>
                              ) : (
                                <><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1"></span> Đã gửi</>
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

          {/* Input Area */}
          {activeUser && (
            <div className="p-3 bg-card/30 border-t border-border/50">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="rounded-full bg-background border-border focus-visible:ring-1 focus-visible:ring-primary h-10 text-foreground"
                />
                <Button type="submit" size="icon" disabled={!message.trim()} className="rounded-full h-10 w-10 shrink-0 shadow-sm">
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform p-0">
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
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
