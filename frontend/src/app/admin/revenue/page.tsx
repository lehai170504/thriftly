'use client';

import { useState } from 'react';
import { useAdminRevenueStats, useAdminRevenueTransactions } from '@/features/admin/hooks/useAdminRevenue';
import { LineChart, DollarSign, ArrowUpRight, Activity } from 'lucide-react';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { normalizePageResponse } from '@/lib/pagination';

export default function AdminRevenuePage() {
  const [page, setPage] = useState(0);
  const size = 20;

  const { data: stats, isLoading: isStatsLoading } = useAdminRevenueStats();
  const { data: transactionsData, isLoading: isTxLoading } = useAdminRevenueTransactions(page, size);

  const { content: transactions, totalPages } = normalizePageResponse(transactionsData);

  if (isStatsLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Đang tải dữ liệu doanh thu...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-[24px] glass border border-primary/20">
          <LineChart className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">Doanh thu sàn</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Thống kê hoa hồng từ đơn hàng và phí rút tiền
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-[24px] border border-border shadow-lg bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <DollarSign className="w-24 h-24" />
          </div>
          <p className="text-muted-foreground font-medium mb-2 relative z-10">Tổng doanh thu</p>
          <h2 className="text-4xl font-black text-primary relative z-10">
            {formatCurrency(stats?.totalRevenue || 0)}
          </h2>
        </div>

        <div className="glass p-6 rounded-[24px] border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground font-medium">Hoa hồng đơn hàng</p>
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {formatCurrency(stats?.totalCommission || 0)}
          </h2>
        </div>

        <div className="glass p-6 rounded-[24px] border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground font-medium">Phí rút tiền</p>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {formatCurrency(stats?.totalWithdrawalFees || 0)}
          </h2>
        </div>
      </div>

      <div className="bg-background/50 rounded-[24px] border border-border shadow-lg glass backdrop-blur-xl overflow-hidden mt-8">
        <div className="p-5 border-b border-border font-bold text-lg flex items-center justify-between gap-2">
          <span>Lịch sử giao dịch dòng tiền</span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-[24px] border-primary/20 text-primary hover:bg-primary/10"
            onClick={() => {
              const exportData = transactions.map((tx: any) => ({
                'Mã GD': tx.id,
                'Loại': tx.type,
                'Số tiền': tx.amount,
                'Nội dung': tx.description,
                'Thời gian': new Date(tx.createdAt).toLocaleString('vi-VN')
              }));
              downloadCSV(exportData, `DoanhThu_${new Date().toISOString().split('T')[0]}.csv`);
            }}
            disabled={transactions.length === 0}
          >
            Xuất CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-muted text-muted-foreground border-b border-border uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-5 py-4">Mã GD</th>
                <th className="px-5 py-4">Thời gian</th>
                <th className="px-5 py-4">Loại phí</th>
                <th className="px-5 py-4">Số tiền</th>
                <th className="px-5 py-4">Nội dung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isTxLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Đang tải...</td></tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    Không có dữ liệu giao dịch
                  </td>
                </tr>
              ) : (
                transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-accent transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                      #{tx.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4 text-foreground/80">
                      {new Date(tx.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-5 py-4">
                      {tx.type === 'COMMISSION' && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Hoa hồng đơn hàng</Badge>}
                      {tx.type === 'WITHDRAWAL_FEE' && <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Phí rút tiền</Badge>}
                    </td>
                    <td className="px-5 py-4 font-bold text-primary">
                      +{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-5 py-4 text-foreground/80 max-w-[300px] truncate">
                      {tx.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-border flex items-center justify-between bg-muted">
            <div className="text-sm text-muted-foreground font-medium">
              Trang {page + 1} / {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-[24px]"
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-[24px]"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
