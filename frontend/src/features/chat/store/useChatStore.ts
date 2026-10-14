import { create } from 'zustand';
import { ConversationResponse } from '@/features/chat/types/chat';

export interface ChatProductContext {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
}

interface ChatStore {
  isOpen: boolean;
  activeUser: ConversationResponse | null;
  activeProduct: ChatProductContext | null;
  openChatWith: (user: ConversationResponse, product?: ChatProductContext | null) => void;
  clearActiveUser: () => void;
  clearActiveProduct: () => void;
  closeChat: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  activeUser: null,
  activeProduct: null,
  openChatWith: (user, product = null) => set({ isOpen: true, activeUser: user, activeProduct: product }),
  clearActiveUser: () => set({ activeUser: null, activeProduct: null }),
  clearActiveProduct: () => set({ activeProduct: null }),
  closeChat: () => set({ isOpen: false, activeUser: null, activeProduct: null }),
  setIsOpen: (isOpen) => set({ isOpen }),
}));
