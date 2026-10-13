import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/adminApi';
import { orderApi } from '@/features/orders/api/orderApi';
import { normalizePageResponse } from '@/lib/pagination';

export function useAdminDashboard() {
  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users', 'count'],
    queryFn: () => adminApi.getAllUsers(0, 1)
  });

  const { data: ordersData } = useQuery({
    queryKey: ['admin', 'orders', 'count'],
    queryFn: () => orderApi.getAllOrders(0, 1)
  });

  const { data: withdrawalsData } = useQuery({
    queryKey: ['admin', 'withdrawals', 'count'],
    queryFn: () => adminApi.getPendingWithdrawals(0, 1)
  });

  const { data: escrowData } = useQuery({
    queryKey: ['admin', 'escrow', 'total'],
    queryFn: adminApi.getTotalEscrow
  });

  const { data: chartDataResponse } = useQuery({
    queryKey: ['admin', 'dashboard', 'chart'],
    queryFn: adminApi.getChartData
  });

  const totalUsers = normalizePageResponse(usersData).totalElements;
  const totalOrders = normalizePageResponse(ordersData).totalElements;
  const totalWithdrawals = normalizePageResponse(withdrawalsData).totalElements;
  const totalEscrow = escrowData?.totalEscrow || 0;
  const chartData = chartDataResponse || [];

  return {
    totalUsers,
    totalOrders,
    totalWithdrawals,
    totalEscrow,
    chartData,
  };
}
