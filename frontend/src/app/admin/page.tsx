'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LayoutDashboard, Users, ShoppingBag, Wallet } from 'lucide-react';
import { useAdminDashboard } from '@/features/admin/hooks/useAdminDashboard';
import { useAdminOrders } from '@/features/admin/hooks/useAdminOrders';
import { formatMoney } from '@/lib/formatters';
import { PageHeader } from '@/components/patterns/page-header';
import { MetricCard } from '@/components/patterns/metric-card';
import { EntityId, Money, NumberText } from '@/components/ui/typography';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function AdminDashboardPage() {
  const { totalUsers, totalOrders, totalWithdrawals, totalEscrow, chartData } = useAdminDashboard();

  return (
    <div className="space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Tổng quan hệ thống" description="Theo dõi các chỉ số quan trọng của Thriftly" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Ký quỹ hệ thống" value={<Money value={totalEscrow} />} icon={<Wallet className="size-5" />} detail="Đang lưu trữ an toàn" />
        <MetricCard label="Tổng đơn hàng" value={<NumberText value={totalOrders} />} icon={<ShoppingBag className="size-5" />} detail="Toàn bộ đơn trên hệ thống" />
        <MetricCard label="Thành viên" value={<NumberText value={totalUsers} />} icon={<Users className="size-5" />} detail="Tài khoản đã đăng ký" />
        <MetricCard label="Yêu cầu rút tiền" value={<NumberText value={totalWithdrawals} />} icon={<LayoutDashboard className="size-5" />} detail="Cần được theo dõi" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="glass border-border shadow-lg bg-background/50 backdrop-blur-xl rounded-[24px]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Biểu Đồ Doanh Thu Ước Tính</CardTitle>
            <CardDescription className="text-muted-foreground">Thống kê 6 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3', fontSize: 12 }} dx={-10} tickFormatter={(value) => `${value / 1000000}M`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: any) => [formatMoney(value), 'Doanh thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-border shadow-lg bg-background/50 backdrop-blur-xl rounded-[24px]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Lượng Đơn Hàng Mới</CardTitle>
            <CardDescription className="text-muted-foreground">Số đơn hàng được tạo qua các tháng</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3', fontSize: 12 }} dx={-10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: any) => [`${value} đơn`, 'Đơn hàng']}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <RecentOrders />
      </div>
    </div>
  );
}

function RecentOrders() {
  const { data: ordersData, isLoading } = useAdminOrders(0, 5, '');
  const orders = ordersData?.content || [];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Đang tải giao dịch gần đây...</div>;

  return (
    <Card className="glass border-border shadow-lg bg-background/50 backdrop-blur-xl rounded-[24px]">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">Giao dịch gần đây</CardTitle>
        <CardDescription className="text-muted-foreground">5 đơn hàng mới nhất trên hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold">Mã ĐH</th>
                <th className="px-4 py-3 font-bold">Sản phẩm</th>
                <th className="px-4 py-3 font-bold">Giá trị</th>
                <th className="px-4 py-3 font-bold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Chưa có giao dịch nào</td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground"><EntityId value={order.id} /></td>
                    <td className="px-4 py-3 font-bold text-foreground max-w-[200px] truncate" title={order.productTitle}>{order.productTitle}</td>
                    <td className="px-4 py-3"><Money value={order.totalAmount} className="font-bold text-primary" /></td>
                    <td className="px-4 py-3">
                      <StatusBadge domain="order" status={order.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
