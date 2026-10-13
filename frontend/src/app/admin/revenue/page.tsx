'use client';

import { useState } from 'react';
import { useAdminRevenueStats, useAdminRevenueTransactions } from '@/features/admin/hooks/useAdminRevenue';
import { DollarSign, ArrowUpRight, Activity } from 'lucide-react';
import { downloadCSV } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { normalizePageResponse } from '@/lib/pagination';
import { PageHeader } from '@/components/patterns/page-header';
import { MetricCard } from '@/components/patterns/metric-card';
import { LoadingState } from '@/components/patterns/state-panel';
import { DateTime, EntityId, Money } from '@/components/ui/typography';

export default function AdminRevenuePage() {
  const [page, setPage] = useState(0);
  const size = 20;

  const { data: stats, isLoading: isStatsLoading } = useAdminRevenueStats();
  const { data: transactionsData, isLoading: isTxLoading } = useAdminRevenueTransactions(page, size);

  const { content: transactions, totalPages } = normalizePageResponse(transactionsData);

  if (isStatsLoading) return <LoadingState title="Đang tải dữ liệu doanh thu…" />;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Doanh thu sàn" description="Thống kê hoa hồng từ đơn hàng và phí rút tiền" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Tổng doanh thu" value={<Money value={stats?.totalRevenue || 0} />} icon={<DollarSign className="size-5" />} />
        <MetricCard label="Hoa hồng đơn hàng" value={<Money value={stats?.totalCommission || 0} />} icon={<ArrowUpRight className="size-5" />} />
        <MetricCard label="Phí rút tiền" value={<Money value={stats?.totalWithdrawalFees || 0} />} icon={<Activity className="size-5" />} />
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
                      <EntityId value={tx.id} />
                    </td>
                    <td className="px-5 py-4 text-foreground/80">
                      <DateTime value={tx.createdAt} />
                    </td>
                    <td className="px-5 py-4">
                      {tx.type === 'COMMISSION' && <Badge tone="success">Hoa hồng đơn hàng</Badge>}
                      {tx.type === 'WITHDRAWAL_FEE' && <Badge tone="info">Phí rút tiền</Badge>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Money value={tx.amount} className="font-bold text-primary" />
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
