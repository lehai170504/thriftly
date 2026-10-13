'use client';

import { useState } from 'react';
import { useAdminReports, useUpdateReportStatus } from '@/features/admin/hooks/useAdminReports';
import { AlertCircle, CheckCircle, Clock, Ban, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { normalizePageResponse } from '@/lib/pagination';

export default function AdminReportsPage() {
  const [page, setPage] = useState(0);
  const size = 10;

  const { data: reportsData, isLoading } = useAdminReports(page, size);
  const updateStatusMutation = useUpdateReportStatus();

  const normalized = normalizePageResponse(reportsData);
  const reports = normalized.content;
  const totalPages = normalized.totalPages;
  const totalElements = normalized.totalElements;

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status }, {
      onSuccess: () => toast.success('Cập nhật trạng thái báo cáo thành công!'),
      onError: () => toast.error('Có lỗi xảy ra, vui lòng thử lại.'),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Chờ xử lý</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Đã giải quyết</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><Ban className="w-3 h-3 mr-1" /> Bị từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 rounded-[24px] glass border border-red-500/20">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Trung tâm Báo cáo</h1>
            <p className="text-muted-foreground text-sm">Tổng cộng <span className="font-bold text-foreground">{totalElements}</span> báo cáo</p>
          </div>
        </div>
      </div>

      <div className="bg-background/50 rounded-[24px] border border-border shadow-lg glass backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[1000px]">
            <thead className="bg-muted text-muted-foreground border-b border-border uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-5 py-4 w-1/4">Lý do & Mô tả</th>
                <th className="px-5 py-4">Người báo cáo</th>
                <th className="px-5 py-4">Đối tượng bị báo cáo</th>
                <th className="px-5 py-4 text-center">Trạng thái</th>
                <th className="px-5 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Đang tải...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Không có báo cáo nào</td></tr>
              ) : (
                reports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-accent transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-foreground mb-1">{report.reason}</div>
                      <div className="text-muted-foreground text-xs leading-relaxed line-clamp-2" title={report.description}>
                        {report.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1 opacity-50">
                        <Clock className="w-3 h-3" /> {new Date(report.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">{report.reporterUsername || report.reporterName || 'Người dùng ẩn danh'}</div>
                    </td>
                    <td className="px-5 py-4">
                      {report.reportedProductTitle ? (
                        <div>
                          <span className="text-xs text-muted-foreground block">Sản phẩm:</span>
                          <span className="font-medium text-orange-400 truncate max-w-[200px] inline-block" title={report.reportedProductTitle}>
                            {report.reportedProductTitle}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1">#{report.reportedProductId?.substring(0, 8).toUpperCase()}</span>
                        </div>
                      ) : report.targetUserName ? (
                        <div>
                          <span className="text-xs text-muted-foreground block">Người dùng:</span>
                          <span className="font-medium text-red-400">{report.targetUserName}</span>
                        </div>
                      ) : report.targetProductId ? (
                        <div>
                          <span className="text-xs text-muted-foreground block">Sản phẩm:</span>
                          <span className="font-medium text-orange-400">#{report.targetProductId.substring(0, 8).toUpperCase()}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Không rõ</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {report.status === 'PENDING' ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "rounded-full")}>
                            Xử lý ngay
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass">
                            <DropdownMenuItem className="cursor-pointer text-emerald-500 focus:text-emerald-600 focus:bg-emerald-50" onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}>
                              <Check className="w-4 h-4 mr-2" /> Đánh dấu đã xử lý
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50" onClick={() => handleUpdateStatus(report.id, 'REJECTED')}>
                              <Ban className="w-4 h-4 mr-2" /> Từ chối báo cáo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button variant="ghost" size="icon" disabled className="opacity-50">
                          <Info className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-border flex items-center justify-between bg-muted">
            <div className="text-sm text-muted-foreground font-medium">Trang {page + 1} / {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="rounded-[24px]">Trước</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="rounded-[24px]">Sau</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
