'use client';

import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CreateProductModal } from '@/features/products/components/CreateProductModal';

const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

export function FinalCta() {
  const { isAuthenticated, openRegisterModal } = useAuth();

  return (
    <section className="py-16 lg:py-24 bg-[#F5F2EC] dark:bg-background border-t border-[#E5E0D7] dark:border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: EDITORIAL_EASE }}
          className="rounded-3xl bg-[#244C3A] dark:bg-card text-white dark:text-foreground border border-[#244C3A] dark:border-border px-6 py-12 sm:px-12 sm:py-16 lg:px-20 lg:py-20"
        >
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-white/75 dark:text-primary mb-4">
              Bắt đầu cùng Thriftly
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white dark:text-foreground leading-tight mb-5">
              Mỗi Món Đồ Đẹp Đều Có Một Câu Chuyện.
            </h2>
            <p className="text-sm sm:text-base text-white/80 dark:text-muted-foreground leading-relaxed mb-9 max-w-xl mx-auto">
              Khám phá những món đồ độc đáo và trao cho những giá trị cũ một vòng đời mới đầy ý nghĩa.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5">
              <Link href="/products" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl bg-white text-[#191919] hover:bg-[#F5F2EC] dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 font-medium text-sm sm:text-base group transition-all duration-200 active:scale-[0.98]"
                >
                  Khám phá sàn giao dịch
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>

              {isAuthenticated ? (
                <CreateProductModal>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-7 rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 dark:border-border dark:text-foreground dark:hover:bg-accent font-medium text-sm sm:text-base transition-all duration-200 active:scale-[0.98]"
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Bắt đầu bán
                  </Button>
                </CreateProductModal>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={openRegisterModal}
                  className="w-full sm:w-auto h-12 px-7 rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 dark:border-border dark:text-foreground dark:hover:bg-accent font-medium text-sm sm:text-base transition-all duration-200 active:scale-[0.98]"
                >
                  Bắt đầu bán
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
