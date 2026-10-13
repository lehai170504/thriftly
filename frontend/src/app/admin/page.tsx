'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LayoutDashboard, Users, ShoppingBag, Wallet, TrendingUp } from 'lucide-react';
import { useAdminDashboard } from '@/features/admin/hooks/useAdminDashboard';
import { useAdminOrders } from '@/features/admin/hooks/useAdminOrders';
import { formatCurrency } from '@/lib/utils';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-[24px] glass border border-primary/20">
            <LayoutDashboard className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Tổng quan hệ thống</h1>
            <p className="text-muted-foreground text-sm">Theo dõi các chỉ số quan trọng của Thriftly</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-border shadow-lg bg-background/50 backdrop-blur-xl rounded-[24px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Ký Quỹ Hệ Thống</CardTitle>
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-[16px] flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(totalEscrow)}</div>
            <div className="flex items-center text-xs text-emerald-400 font-medium mt-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Đang lưu trữ an toàn</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border shadow-lg bg-background/50 backdrop-blur-xl rounded-[24px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tổng Đơn Hàng</CardTitle>
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-[16px] flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalOrders}</div>
            <div className="flex items-center text-xs text-blue-400 font-medium mt-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+15% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border shadow-lg bg-background/50 backdrop-blur-xl rounded-[24px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Thành Viên</CardTitle>
            <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-[16px] flex items-center justify-center text-orange-400">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalUsers}</div>
            <div className="flex items-center text-xs text-orange-400 font-medium mt-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Tăng trưởng ổn định</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border shadow-lg bg-background/50 backdrop-blur-xl rounded-[24px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Yêu Cầu Rút Tiền</CardTitle>
            <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-[16px] flex items-center justify-center text-rose-400">
              <LayoutDashboard className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalWithdrawals}</div>
            <div className="flex items-center text-xs text-rose-400 font-medium mt-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Cần xử lý ngay</span>
            </div>
          </CardContent>
        </Card>
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
                  formatter={(value: any) => [`${formatCurrency(value)}`, 'Doanh thu']}
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
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{order.id.substring(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3 font-bold text-foreground max-w-[200px] truncate" title={order.productTitle}>{order.productTitle}</td>
                    <td className="px-4 py-3 font-bold text-primary">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        order.status === 'DISPUTED' ? 'bg-red-500/10 text-red-400' :
                          order.status === 'PAID' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-orange-500/10 text-orange-400'
                        }`}>
                        {order.status}
                      </span>
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
