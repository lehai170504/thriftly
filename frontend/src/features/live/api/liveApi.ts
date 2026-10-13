import api from '@/lib/axios';
import { LiveSessionResponse } from '../types/live';

export type { LiveSessionResponse };

export const liveApi = {
  startLiveSession: async (productId: string): Promise<LiveSessionResponse> => {
    const { data } = await api.post(`/lives/start/${productId}`);
    return data;
  },
  endLiveSession: async (productId: string, endAuction?: boolean): Promise<LiveSessionResponse> => {
    const { data } = await api.post(`/lives/end/${productId}${endAuction ? '?endAuction=true' : ''}`);
    return data;
  },
  getLiveSession: async (productId: string): Promise<LiveSessionResponse> => {
    const { data } = await api.get(`/lives/auction/${productId}`);
    return data;
  },
  getActiveLiveAuctions: async (): Promise<LiveSessionResponse[]> => {
    const { data } = await api.get('/lives/active');
    return data;
  },
  getDepositStatus: async (productId: string): Promise<boolean> => {
    const { data } = await api.get(`/auctions/${productId}/deposit-status`);
    return data;
  },
  placeDeposit: async (productId: string): Promise<any> => {
    const { data } = await api.post(`/auctions/${productId}/deposit`);
    return data;
  }
};
