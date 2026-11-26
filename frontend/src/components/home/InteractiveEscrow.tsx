'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  PackageCheck,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const escrowStages = [
  {
    step: '01',
    icon: CreditCard,
    title: 'Người mua hoàn tất thanh toán',
    description: 'Thanh toán đơn hàng mua ngay hoặc đơn thắng đấu giá qua ví Thriftly hoặc cổng thanh toán.',
    status: 'Khởi tạo',
  },
  {
    step: '02',
    icon: Lock,
    title: 'Tiền được tạm giữ an toàn',
    description: 'Khoản tiền được giữ trong quy trình ký quỹ Escrow của nền tảng, chưa chuyển ngay cho người bán.',
    status: 'Đang giữ tiền',
  },
  {
    step: '03',
    icon: Truck,
    title: 'Người bán đóng gói và gửi hàng',
    description: 'Người bán yên tâm chuẩn bị và vận chuyển sản phẩm khi đơn hàng đã được bảo chứng thanh toán.',
    status: 'Đang giao',
  },
  {
    step: '04',
    icon: PackageCheck,
    title: 'Người mua kiểm tra và xác nhận',
    description: 'Sau khi nhận hàng đúng mô tả, người mua xác nhận đã nhận hàng trên hệ thống.',
    status: 'Đã kiểm tra',
  },
  {
    step: '05',
    icon: CheckCircle2,
    title: 'Giải ngân cho người bán',
    description: 'Hệ thống hoàn tất đơn hàng và giải ngân số tiền tương ứng về ví của người bán.',
    status: 'Hoàn tất',
  },
];

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

export function InteractiveEscrow() {
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <section className="py-16 lg:py-24 bg-[#F5F2EC] dark:bg-background border-t border-[#E5E0D7] dark:border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border p-6 sm:p-10 lg:p-14 shadow-surface">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
              className="lg:col-span-5 flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#244C3A]/10 dark:bg-primary/15 text-[#244C3A] dark:text-primary text-xs font-semibold mb-5">
                <ShieldCheck className="w-4 h-4" />
                <span>Cơ chế bảo vệ Escrow</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#191919] dark:text-foreground leading-tight mb-4">
                Tiền Của Bạn. Được Bảo Vệ Ở Mọi Bước.
              </h2>

              <p className="text-sm sm:text-base text-[#77736D] dark:text-muted-foreground leading-relaxed mb-6">
                Thriftly áp dụng quy trình thanh toán trung gian (Escrow) để cân bằng quyền lợi cho cả người mua và người bán. Tiền chỉ được giải ngân khi giao dịch hoàn tất theo đúng quy trình đơn hàng.
              </p>

              <div className="w-full space-y-3 p-4 rounded-2xl bg-[#F5F2EC] dark:bg-muted/50 border border-[#E5E0D7] dark:border-border mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#191919] dark:text-foreground">
                  Khi có vấn đề phát sinh
                </p>
                <p className="text-xs sm:text-sm text-[#77736D] dark:text-muted-foreground leading-relaxed">
                  Nếu sản phẩm không đúng mô tả hoặc phát sinh tranh chấp trước khi hoàn tất đơn, bạn có thể gửi báo cáo để đội ngũ quản trị kiểm tra và xử lý theo quy trình đơn hàng.
                </p>
              </div>

              <Link href="/escrow">
                <Button
                  variant="outline"
                  className="rounded-xl border-[#E5E0D7] dark:border-border bg-white dark:bg-card text-[#191919] dark:text-foreground hover:bg-[#F5F2EC] dark:hover:bg-accent h-11 px-5 text-sm font-medium group transition-all duration-200 active:scale-[0.98]"
                >
                  Tìm hiểu chi tiết về Escrow
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-[#F5F2EC] dark:bg-muted/40 border border-[#E5E0D7] dark:border-border p-4 sm:p-6">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E0D7] dark:border-border">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#77736D] dark:text-muted-foreground">
                      Sơ đồ dòng tiền ký quỹ
                    </p>
                    <p className="text-sm font-semibold text-[#191919] dark:text-foreground mt-0.5">
                      5 bước xử lý giao dịch trên Thriftly
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-card border border-[#E5E0D7] dark:border-border text-[11px] font-semibold text-[#244C3A] dark:text-primary">
                    <Lock className="w-3 h-3" />
                    Trung gian
                  </span>
                </div>

                <div className="space-y-2.5">
                  {escrowStages.map((stage, index) => {
                    const isActive = activeIndex === index;
                    return (
                      <motion.button
                        key={stage.step}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        onMouseEnter={() => setActiveIndex(index)}
                        initial={{ opacity: 0, x: 12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{ duration: 0.35, delay: index * 0.05, ease: EDITORIAL_EASE }}
                        className={cn(
                          'w-full text-left flex items-start sm:items-center justify-between gap-4 rounded-xl border p-3.5 sm:p-4 transition-all duration-300 cursor-pointer',
                          isActive
                            ? 'bg-white dark:bg-card border-[#244C3A] dark:border-primary shadow-surface'
                            : 'bg-white/70 dark:bg-card/70 border-[#E5E0D7] dark:border-border hover:bg-white dark:hover:bg-card'
                        )}
                      >
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                          <div
                            className={cn(
                              'size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300',
                              isActive
                                ? 'bg-[#244C3A] text-white dark:bg-primary dark:text-primary-foreground'
                                : 'bg-[#244C3A]/10 dark:bg-primary/15 text-[#244C3A] dark:text-primary'
                            )}
                          >
                            <stage.icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-numeric text-[11px] font-semibold text-[#244C3A] dark:text-primary">
                                {stage.step}
                              </span>
                              <h3 className="text-sm font-semibold text-[#191919] dark:text-foreground truncate">
                                {stage.title}
                              </h3>
                            </div>
                            <p className="text-xs text-[#77736D] dark:text-muted-foreground leading-relaxed mt-0.5">
                              {stage.description}
                            </p>
                          </div>
                        </div>

                        <span
                          className={cn(
                            'hidden sm:inline-flex shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors duration-300',
                            isActive
                              ? 'bg-[#244C3A]/10 text-[#244C3A] border-[#244C3A]/30 dark:bg-primary/15 dark:text-primary dark:border-primary/30'
                              : 'bg-[#F5F2EC] dark:bg-muted text-[#77736D] dark:text-muted-foreground border-[#E5E0D7] dark:border-border'
                          )}
                        >
                          {stage.status}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
