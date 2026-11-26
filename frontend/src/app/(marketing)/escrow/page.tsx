import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  PackageCheck,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Chính sách Escrow | Thriftly',
  description: 'Tìm hiểu về quy trình thanh toán ký quỹ trung gian trên Thriftly.',
};

const escrowSteps = [
  {
    step: '01',
    icon: CreditCard,
    title: 'Hoàn tất thanh toán',
    description: 'Người mua thanh toán đơn hàng mua ngay hoặc đơn thắng đấu giá qua ví Thriftly hoặc cổng thanh toán.',
  },
  {
    step: '02',
    icon: Lock,
    title: 'Tạm giữ tiền (Escrow)',
    description: 'Khoản thanh toán được tạm giữ an toàn trên hệ thống trung gian và chưa chuyển ngay cho người bán.',
  },
  {
    step: '03',
    icon: Truck,
    title: 'Đóng gói & Giao hàng',
    description: 'Người bán tiến hành đóng gói và bàn giao vận chuyển khi đơn hàng đã được xác nhận thanh toán.',
  },
  {
    step: '04',
    icon: PackageCheck,
    title: 'Kiểm tra & Xác nhận',
    description: 'Người mua nhận hàng, kiểm tra tình trạng thực tế và bấm xác nhận đã nhận hàng trên hệ thống.',
  },
  {
    step: '05',
    icon: CheckCircle2,
    title: 'Giải ngân cho người bán',
    description: 'Hệ thống hoàn tất đơn hàng và giải ngân khoản tiền tương ứng về ví của người bán.',
  },
];

export default function EscrowPage() {
  return (
    <div className="w-full bg-[#F5F2EC] dark:bg-background text-[#191919] dark:text-foreground">
      <section className="pt-8 pb-16 border-b border-[#E5E0D7] dark:border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-block mb-8">
            <Button
              variant="ghost"
              className="rounded-xl px-3 text-[#77736D] dark:text-muted-foreground hover:text-[#191919] dark:hover:text-foreground hover:bg-white/70 dark:hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-card border border-[#E5E0D7] dark:border-border text-xs font-semibold text-[#244C3A] dark:text-primary mb-5">
              <ShieldCheck className="w-4 h-4" />
              <span>Cơ chế bảo vệ thanh toán</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.12] mb-5">
              Thanh Toán An Toàn Với{' '}
              <span className="italic font-normal text-[#244C3A] dark:text-primary">Hệ Thống Escrow</span>
            </h1>
            <p className="text-base sm:text-lg text-[#77736D] dark:text-muted-foreground leading-relaxed">
              Tiền của bạn được giữ an toàn trên hệ thống trung gian và chỉ giải ngân cho người bán sau khi bạn xác nhận đã nhận được đúng sản phẩm.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white dark:bg-card border-b border-[#E5E0D7] dark:border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#244C3A] dark:text-primary mb-3">
              Quy trình ký quỹ
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              Escrow Hoạt Động Như Thế Nào?
            </h2>
            <p className="text-sm sm:text-base text-[#77736D] dark:text-muted-foreground">
              5 bước bảo vệ quyền lợi công bằng cho cả người mua và người bán.
            </p>
          </div>

          <div className="space-y-4">
            {escrowSteps.map((item) => (
              <div
                key={item.step}
                className="editorial-card rounded-2xl bg-[#F5F2EC] dark:bg-muted/40 border border-[#E5E0D7] dark:border-border p-5 sm:p-6 flex items-start gap-4 sm:gap-6"
              >
                <div className="size-12 rounded-xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border flex items-center justify-center text-[#244C3A] dark:text-primary shrink-0 shadow-surface">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-numeric text-xs font-semibold tracking-[0.14em] text-[#244C3A] dark:text-primary">
                    BƯỚC {item.step}
                  </span>
                  <h3 className="text-lg font-semibold mt-0.5 mb-1.5">{item.title}</h3>
                  <p className="text-sm text-[#77736D] dark:text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-[#F5F2EC] dark:bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border p-7 sm:p-12 shadow-surface">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-8">
              Câu Hỏi Thường Gặp Về Escrow
            </h2>

            <div className="space-y-4 mb-10">
              <div className="rounded-2xl bg-[#F5F2EC] dark:bg-muted/40 border border-[#E5E0D7] dark:border-border p-5 sm:p-6">
                <h3 className="font-semibold text-base mb-2">
                  Chuyện gì xảy ra nếu hàng bị lỗi hoặc không đúng mô tả?
                </h3>
                <p className="text-sm text-[#77736D] dark:text-muted-foreground leading-relaxed">
                  Khoản tiền vẫn đang được tạm giữ trong hệ thống Escrow. Bạn có thể gửi yêu cầu hoàn tiền hoặc khiếu nại kèm bằng chứng trong thời hạn quy định trước khi xác nhận nhận hàng để đội ngũ quản trị xem xét và hoàn tiền về ví.
                </p>
              </div>

              <div className="rounded-2xl bg-[#F5F2EC] dark:bg-muted/40 border border-[#E5E0D7] dark:border-border p-5 sm:p-6">
                <h3 className="font-semibold text-base mb-2">
                  Người bán có yên tâm giao hàng mà không sợ bị bùng tiền không?
                </h3>
                <p className="text-sm text-[#77736D] dark:text-muted-foreground leading-relaxed">
                  Có. Khi đơn hàng chuyển sang trạng thái đã thanh toán Escrow, số tiền tương ứng đã được giữ chắc chắn trong hệ thống, giúp người bán yên tâm đóng gói và vận chuyển.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5">
              <Link href="/wallet">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl bg-[#244C3A] hover:bg-[#1D3E2F] text-white dark:bg-primary dark:text-primary-foreground font-medium group"
                >
                  Đi tới Ví Thriftly
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/policies?tab=refund">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-7 rounded-xl border-[#E5E0D7] dark:border-border bg-white dark:bg-card text-[#191919] dark:text-foreground hover:bg-[#F5F2EC] dark:hover:bg-accent font-medium"
                >
                  Xem chính sách hoàn tiền
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
