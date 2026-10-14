'use client';

import { ShieldCheck, Lock, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function InteractiveEscrow() {
  const steps = [
    {
      icon: Lock,
      title: 'Nạp tiền vào ví',
      description: 'Chuyển tiền từ ngân hàng vào ví điện tử. Dữ liệu được mã hóa SSL 256-bit.',
    },
    {
      icon: KeyRound,
      title: 'Tạm giữ (Hold)',
      description: 'Khi bạn thắng đấu giá, tiền được giữ an toàn tại hệ thống Escrow trung gian.',
    },
    {
      icon: CheckCircle2,
      title: 'Nhả tiền (Release)',
      description: 'Tiền chỉ được chuyển cho người bán sau khi bạn xác nhận nhận hàng đúng mô tả.',
    }
  ];

  return (
    <div className="w-full relative overflow-hidden py-2">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="rounded-[2.5rem] bg-card border border-border p-6 lg:p-8 relative overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
            <div className="order-2 lg:order-1 flex flex-col items-start">
              <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-3 flex items-center gap-3">
                Thanh toán bảo mật
                <span className="w-8 h-px bg-primary/50"></span>
              </p>

              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight font-sans">
                Giao Dịch An Tâm Với Escrow
              </h2>

              <p className="text-sm text-muted-foreground mb-5 leading-relaxed font-normal">
                Thriftly là sàn đấu giá đầu tiên tại Việt Nam áp dụng hệ thống thanh toán trung gian chuẩn quốc tế. Tiền của bạn luôn được bảo vệ 100% cho đến khi nhận được hàng.
              </p>

              <div className="space-y-3 mb-6 w-full">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4 p-3.5 rounded-2xl bg-muted/40 border border-border transition-all duration-300">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-background border border-border shadow-sm text-primary">
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-foreground mb-0.5 font-sans">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-6 w-full border-t border-border pt-3">
                {[
                  { label: 'Hoàn tiền', value: '100%' },
                  { label: 'Xử lý', value: '< 24h' },
                  { label: 'Đánh giá', value: '4.9/5' }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-start">
                    <span className="text-xl font-bold text-foreground mb-0.5 font-sans">{stat.value}</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</span>
                  </div>
                ))}
                <Link href="/products">
                  <Button variant="link" className="px-0 text-foreground font-bold hover:text-primary text-xs">
                    Tìm hiểu Escrow <ArrowRight className="ml-1 w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative w-full h-[280px] lg:h-[340px] rounded-[2rem] overflow-hidden border border-border bg-muted/20 p-6 flex flex-col justify-between">
              <div className="w-full space-y-3">
                {[
                  { title: "Khóa tiền an toàn", desc: "Đã chuyển vào ví trung gian", icon: Lock, status: "Hoàn tất", active: true },
                  { title: "Chờ xác nhận", desc: "Người mua đang kiểm tra hàng", icon: KeyRound, status: "Đang xử lý", active: true },
                  { title: "Giải ngân", desc: "Chuyển tiền cho người bán", icon: CheckCircle2, status: "Chờ", active: false }
                ].map((step, idx) => (
                  <div key={idx} className={`p-3.5 rounded-2xl border bg-card shadow-sm flex items-center justify-between ${step.active ? 'border-primary/40' : 'border-border opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-xs">{step.title}</h4>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                    <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded-full ${step.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border text-foreground flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Bảo chứng giao dịch</p>
                  <p className="text-base font-bold text-foreground">Bảo vệ 100% tài sản</p>
                </div>
                <ShieldCheck className="w-7 h-7 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
