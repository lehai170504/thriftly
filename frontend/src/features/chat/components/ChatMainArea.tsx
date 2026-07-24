import { ConversationResponse, ChatMessageDto } from '@/features/chat/types/chat';
import api from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, ArrowLeft, Image as ImageIcon, Smile, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { RefObject, useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { MoreVertical, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useBlockStatus, useBlockUser, useUnblockUser } from '@/features/chat/hooks/useBlockUser';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ChatMainAreaProps {
  activeUser: ConversationResponse | null;
  setActiveUser: (user: ConversationResponse | null) => void;
  history: ChatMessageDto[] | undefined;
  isHistoryLoading: boolean;
  message: string;
  setMessage: (msg: string) => void;
  handleSend: (e?: React.FormEvent, imageUrl?: string) => void;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  currentUsername?: string;
  isTyping?: boolean;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChatMainArea = ({
  activeUser,
  setActiveUser,
  history,
  isHistoryLoading,
  message,
  setMessage,
  handleSend,
  scrollContainerRef,
  messagesEndRef,
  currentUsername,
  isTyping,
  onInputChange
}: ChatMainAreaProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const { data: blockData, isLoading: isBlockLoading } = useBlockStatus(activeUser?.username);
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();

  const handleBlockToggle = () => {
    if (!activeUser) return;
    if (blockData?.status === 'IS_BLOCKED_BY_ME') {
      unblockMutation.mutate(activeUser.username);
    } else {
      setIsConfirmOpen(true);
    }
  };

  const confirmBlock = () => {
    if (activeUser) {
      blockMutation.mutate(activeUser.username);
      setIsConfirmOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(message + emojiData.emoji);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh phải nhỏ hơn 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Send message with image URL
      handleSend(undefined, res.data.url);
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!activeUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-background/50 hidden md:flex">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <MessageCircle className="w-12 h-12 text-primary/60" />
        </div>
        <h3 className="text-xl font-heading font-bold text-foreground mb-2">Chưa chọn cuộc trò chuyện</h3>
        <p className="text-muted-foreground max-w-sm text-center">Chọn một người bên danh sách để bắt đầu trò chuyện và giao dịch an toàn.</p>
      </div>
    );
  }

  const getOnlineStatus = (lastActiveAt?: string) => {
    if (!lastActiveAt) return { isOnline: false, text: 'Ngoại tuyến' };

    const lastActive = new Date(lastActiveAt).getTime();

    const now = new Date().getTime();
    const diffMinutes = Math.floor((now - lastActive) / (1000 * 60));

    if (diffMinutes <= 5) return { isOnline: true, text: 'Đang hoạt động' };
    if (diffMinutes < 60) return { isOnline: false, text: `Hoạt động ${diffMinutes} phút trước` };

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return { isOnline: false, text: `Hoạt động ${diffHours} giờ trước` };

    const diffDays = Math.floor(diffHours / 24);
    return { isOnline: false, text: `Hoạt động ${diffDays} ngày trước` };
  };

  const status = getOnlineStatus(activeUser.lastActiveAt);

  return (
    <div className="flex-1 flex flex-col bg-background/50 glass min-h-0">
      {/* Chat Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/50 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-muted-foreground" onClick={() => setActiveUser(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={activeUser.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary">{activeUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-foreground">{activeUser.fullName || activeUser.username}</div>
            <div className={`text-xs flex items-center gap-1 ${status.isOnline ? 'text-emerald-500' : 'text-muted-foreground'}`}>
              <span className={`w-2 h-2 rounded-full ${status.isOnline ? 'bg-emerald-500' : 'bg-muted'}`}></span> {status.text}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleBlockToggle} className={blockData?.status === 'IS_BLOCKED_BY_ME' ? 'text-emerald-600' : 'text-red-600'}>
              {blockData?.status === 'IS_BLOCKED_BY_ME' ? (
                <><ShieldCheck className="w-4 h-4 mr-2" /> Bỏ chặn người dùng</>
              ) : (
                <><ShieldAlert className="w-4 h-4 mr-2" /> Chặn người dùng</>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chat Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-background/30">
        {isHistoryLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : history?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Avatar className="h-20 w-20 mb-4 border-4 border-background shadow-md">
              <AvatarImage src={activeUser.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{activeUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="font-medium text-foreground">Bạn và {activeUser.fullName || activeUser.username} chưa có tin nhắn nào</p>
            <p className="text-sm mt-1">Gửi lời chào để bắt đầu!</p>
          </div>
        ) : (
          history?.map((msg, idx) => {
            const isMe = (msg.senderUsername || msg.senderName) === currentUsername;
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-1`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-[15px] shadow-sm relative ${isMe
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-white dark:bg-zinc-800 border border-border text-foreground rounded-bl-md'
                  }`}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Chat attachment" className="max-w-full rounded-xl mb-2 cursor-pointer hover:opacity-90 transition-opacity" />
                  )}
                  {msg.content}

                  {/* Message Tail */}
                  <div className={`absolute bottom-0 w-4 h-4 ${isMe ? '-right-2 text-primary' : '-left-2 text-white dark:text-zinc-800'}`}>
                    <svg viewBox="0 0 8 13" width="8" height="13" className="fill-current">
                      <path opacity=".51" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
                      <path fill="currentColor" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1 mx-2">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {msg.timestamp ? format(new Date(msg.timestamp), 'HH:mm - dd/MM/yyyy') : ''}
                  </span>
                  {isMe && idx === history.length - 1 && (
                    <span className="text-[11px] text-muted-foreground font-semibold flex items-center">
                      {msg.isRead ? (
                        <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> Đã xem</>
                      ) : (
                        <><span className="w-1.5 h-1.5 rounded-full bg-muted mr-1"></span> Đã gửi</>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex flex-col items-start mb-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white dark:bg-zinc-800 border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm relative">
              <div className="flex items-center gap-1.5 h-4">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <div className="absolute bottom-0 -left-2 w-4 h-4 text-white dark:text-zinc-800">
                <svg viewBox="0 0 8 13" width="8" height="13" className="fill-current">
                  <path opacity=".51" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
                  <path fill="currentColor" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      {blockData?.status === 'IS_BLOCKED_BY_ME' ? (
        <div className="p-4 bg-background/50 border-t border-border shrink-0 flex flex-col items-center justify-center py-6">
          <p className="text-muted-foreground mb-2">Bạn đã chặn người dùng này. Bạn sẽ không nhận được tin nhắn từ họ nữa.</p>
          <Button variant="outline" size="sm" onClick={handleBlockToggle}>Bỏ chặn</Button>
        </div>
      ) : blockData?.status === 'HAS_BLOCKED_ME' ? (
        <div className="p-4 bg-background/50 border-t border-border shrink-0 text-center py-6 text-muted-foreground">
          Bạn không thể trả lời cuộc trò chuyện này.
        </div>
      ) : (
        <div className="p-4 bg-background/50 border-t border-border shrink-0">
          <form onSubmit={(e) => handleSend(e)} className="flex items-center gap-2">

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isBlockLoading}
              className="rounded-full text-muted-foreground hover:text-foreground shrink-0"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            </Button>

            <div className="relative" ref={emojiPickerRef}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="rounded-full text-muted-foreground hover:text-foreground shrink-0"
                disabled={isBlockLoading}
              >
                <Smile className="w-5 h-5" />
              </Button>

              {showEmojiPicker && (
                <div className="absolute bottom-14 left-0 z-50">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </div>

            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={onInputChange || ((e) => setMessage(e.target.value))}
                placeholder="Nhập tin nhắn..."
                className="rounded-full bg-white dark:bg-zinc-800 border-border focus-visible:ring-2 focus-visible:ring-primary/20 h-11 px-4 text-[15px] text-foreground shadow-sm"
                disabled={isBlockLoading}
              />
            </div>
            <Button type="submit" size="icon" disabled={!message.trim() && !isUploading || isBlockLoading} className="rounded-full h-11 w-11 shrink-0 hover:scale-105 transition-transform ml-1">
              <Send className="w-5 h-5 ml-0.5" />
            </Button>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Xác nhận chặn người dùng"
        description={<>Bạn có chắc chắn muốn chặn <strong>{activeUser.fullName || activeUser.username}</strong> không? Bạn sẽ không thể gửi hoặc nhận tin nhắn từ người này nữa.</>}
        onConfirm={confirmBlock}
        confirmText="Chặn ngay"
        isLoading={blockMutation.isPending}
      />
    </div>
  );
}
