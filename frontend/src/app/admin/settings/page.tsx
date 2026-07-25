'use client';

import { useState, useEffect } from 'react';
import { useSystemConfig } from '@/features/admin/hooks/useSystemConfig';
import { Settings, Save, AlertTriangle, ShieldCheck, Banknote, Power } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export default function SystemSettingsPage() {
  const { config, isLoading, updateConfig } = useSystemConfig();

  const [formData, setFormData] = useState({
    platformFeePercent: 0.05,
    minWithdrawalAmount: 50000,
    isMaintenanceMode: false,
  });

  useEffect(() => {
    if (config) {
      setFormData({
        platformFeePercent: config.platformFeePercent,
        minWithdrawalAmount: config.minWithdrawalAmount,
        isMaintenanceMode: config.isMaintenanceMode,
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateConfig.mutateAsync(formData);
      toast.success('Cập nhật cấu hình hệ thống thành công!');
    } catch (err) {
      toast.error('Có lỗi xảy ra khi cập nhật cấu hình.');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-neutral-500 font-medium">Đang tải cấu hình...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-[24px] glass border border-primary/20">
            <Settings className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Cấu Hình Hệ Thống</h1>
            <p className="text-muted-foreground text-s  m">Điều chỉnh các thông số vận hành và phí của nền tảng</p>
          </div>
        </div>
      </div>

      <div className="bg-background/50 rounded-[24px] border border-border shadow-lg glass backdrop-blur-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary"></div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-6 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="w-full">
                  <label className="block text-base font-bold mb-1">Phí Hoa Hồng Sàn (%)</label>
                  <p className="text-xs text-muted-foreground mb-4">
                    Phần trăm phí thu từ mỗi đơn hàng. Ví dụ: nhập 0.05 tương đương 5%
                  </p>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    required
                    className="w-full font-mono text-lg h-12 bg-background/50 backdrop-blur-sm border-primary/20 focus-visible:ring-primary/30"
                    value={formData.platformFeePercent}
                    onChange={e => setFormData({ ...formData, platformFeePercent: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 transition-all shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
                  <Banknote className="w-6 h-6" />
                </div>
                <div className="w-full">
                  <label className="block text-base font-bold mb-1">Hạn Mức Rút Tiền (VNĐ)</label>
                  <p className="text-xs text-muted-foreground mb-4">
                    Số dư tối thiểu người dùng cần có để thực hiện lệnh rút tiền.
                  </p>
                  <Input
                    type="number"
                    min="0"
                    required
                    className="w-full font-mono text-lg h-12 bg-background/50 backdrop-blur-sm border-emerald-500/20 focus-visible:ring-emerald-500/30"
                    value={formData.minWithdrawalAmount}
                    onChange={e => setFormData({ ...formData, minWithdrawalAmount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/50">
            <div className={`p-6 rounded-2xl border transition-all flex items-center justify-between gap-6 ${formData.isMaintenanceMode ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'glass border-muted'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 transition-colors ${formData.isMaintenanceMode ? 'bg-red-500/20 text-red-500' : 'bg-muted text-muted-foreground'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-base font-bold mb-1 ${formData.isMaintenanceMode ? 'text-red-500' : 'text-foreground'}`}>
                    Chế Độ Bảo Trì Hệ Thống
                  </h3>
                  <p className={`text-xs ${formData.isMaintenanceMode ? 'text-red-500/80' : 'text-muted-foreground'}`}>
                    {formData.isMaintenanceMode
                      ? 'Hệ thống đang bảo trì. Toàn bộ giao dịch đã bị tạm dừng.'
                      : 'Bật chế độ này sẽ hiển thị thông báo bảo trì và cấm tất cả giao dịch mới.'}
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.isMaintenanceMode}
                onCheckedChange={(checked) => setFormData({ ...formData, isMaintenanceMode: checked })}
                className="data-[state=checked]:bg-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={updateConfig.isPending}
              size="lg"
              className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 px-8 font-bold text-base h-12"
            >
              <Save className="w-5 h-5 mr-2" />
              {updateConfig.isPending ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
