'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ConversationResponse } from '@/features/chat/api/chatApi';
import { useChatSocket } from '@/features/chat/hooks/useChatSocket';
import { useChatConversations, useChatHistory, useDeleteConversation, useMarkAsRead } from '@/features/chat/hooks/useChat';
import { ChatSidebar } from '@/features/chat/components/ChatSidebar';
import { ChatMainArea } from '@/features/chat/components/ChatMainArea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeUser, setActiveUser] = useState<ConversationResponse | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ConversationResponse | null>(null);
  const [typingUsers, setTypingUsers] = useState<{ [username: string]: NodeJS.Timeout }>({});
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTyping = useCallback((username: string) => {
    setIsTyping(true);
    setTypingUsers(prev => {
      if (prev[username]) clearTimeout(prev[username]);
      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
      return { ...prev, [username]: timeout };
    });
  }, []);

  const { sendMessage, sendTyping } = useChatSocket(isAuthenticated, user?.username, false, handleTyping);

  const { data: conversations = [], isLoading: isConversationsLoading } = useChatConversations(isAuthenticated);
  const { data: history, isLoading: isHistoryLoading } = useChatHistory(activeUser?.username);
  const deleteMutation = useDeleteConversation();
  const { mutate: markAsRead } = useMarkAsRead();

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }

    if (activeUser) {
      const hasUnread = history?.some(msg => !msg.isRead && msg.senderUsername !== user?.username);
      if (hasUnread) {
        markAsRead(activeUser.username);
      }
    }
  }, [history, activeUser, markAsRead, user?.username]);

  if (!isAuthenticated) return null;

  const handleSend = (e?: React.FormEvent, imageUrl?: string) => {
    if (e) e.preventDefault();
    if ((!message.trim() && !imageUrl) || !activeUser) return;
    sendMessage(activeUser.username, message, imageUrl);
    setMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (activeUser) {
      sendTyping(activeUser.username);
    }
  };

  const handleDeleteConversation = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.username);
      toast.success('Đã xóa cuộc trò chuyện!');
      if (activeUser?.id === deleteTarget.id) {
        setActiveUser(null);
      }
      setDeleteTarget(null);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa cuộc trò chuyện');
    }
  };

  const handleConversationClick = (c: ConversationResponse) => {
    setActiveUser(c);
    if (c.unreadCount && c.unreadCount > 0) {
      markAsRead(c.username);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl h-[calc(100vh-64px)]">
      <div className="bg-background/50 rounded-[24px] shadow-lg border border-border glass flex overflow-hidden h-[85vh]">
        <ChatSidebar
          conversations={conversations}
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isConversationsLoading={isConversationsLoading}
          onDeleteClick={setDeleteTarget}
          onConversationClick={handleConversationClick}
        />

        <div className={`flex-1 flex flex-col bg-transparent min-h-0 min-w-0 ${!activeUser ? 'hidden md:flex' : 'flex'}`}>
          <ChatMainArea
            activeUser={activeUser}
            setActiveUser={setActiveUser}
            history={history}
            isHistoryLoading={isHistoryLoading}
            message={message}
            setMessage={setMessage}
            handleSend={handleSend}
            scrollContainerRef={scrollContainerRef}
            messagesEndRef={messagesEndRef}
            currentUsername={user?.username}
            isTyping={isTyping && activeUser?.username ? typingUsers[activeUser.username] !== undefined : false}
            onInputChange={handleInputChange}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa cuộc trò chuyện?"
        description={
          <>
            Bạn có chắc chắn muốn xóa toàn bộ tin nhắn với <strong>{deleteTarget?.fullName || deleteTarget?.username}</strong>? Hành động này không thể hoàn tác.
          </>
        }
        confirmText="Xóa ngay"
        cancelText="Hủy"
        onConfirm={handleDeleteConversation}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
