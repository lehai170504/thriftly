export interface ChatMessageDto {
  id?: string;
  senderId?: string;
  senderName?: string;
  senderUsername?: string;
  receiverUsername?: string;
  senderAvatar?: string;
  receiverId?: string;
  content: string;
  imageUrl?: string;
  type?: string;
  timestamp?: string;
  createdAt?: string;
  isRead?: boolean;
  isMine?: boolean;
}

export interface ConversationResponse {
  id: string;
  username: string;
  fullName?: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  lastActiveAt?: string;
}
