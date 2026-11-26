import Link from 'next/link';
import { ArrowLeft, Flag, Send, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';

export const metadata = {
  title: 'Báo cáo vi phạm | Thriftly',
  description: 'Báo cáo các hành vi vi phạm, lừa đảo hoặc sản phẩm cấm.',
};

export default function ReportPage() {
  return (
    <div className="w-full bg-[#F5F2EC] dark:bg-background text-[#191919] dark:text-foreground min-h-screen pt-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-block mb-8">
          <Button
            variant="ghost"
            className="rounded-xl px-3 text-[#77736D] dark:text-muted-foreground hover:text-[#191919] dark:hover:text-foreground hover:bg-white/70 dark:hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Về trang chủ
          </Button>
        </Link>

        <div className="rounded-3xl bg-white dark:bg-card border border-[#E5E0D7] dark:border-border shadow-surface overflow-hidden">
          <div className="bg-[#F5F2EC]/70 dark:bg-muted/30 border-b border-[#E5E0D7] dark:border-border p-8 sm:p-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold mb-4">
              <Flag className="w-3.5 h-3.5" />
              <span>An toàn cộng đồng</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              Báo Cáo Vi Phạm Cộng Đồng
            </h1>
            <p className="text-sm sm:text-base text-[#77736D] dark:text-muted-foreground">
              Cùng nhau duy trì môi trường mua bán và đấu giá minh bạch, an toàn trên Thriftly.
            </p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-5 mb-8 flex items-start gap-4">
              <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-sm text-destructive mb-1">Cảnh báo nghiêm trọng</h2>
                <p className="text-xs sm:text-sm text-[#77736D] dark:text-muted-foreground leading-relaxed">
                  Mọi hành vi lừa đảo, giả mạo hoặc đăng bán sản phẩm bị cấm theo quy định pháp luật đều sẽ bị xử lý nghiêm khắc, bao gồm khóa tài khoản vĩnh viễn và đóng băng số dư ví.
                </p>
              </div>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Loại vi phạm *</label>
                <NativeSelect className="h-12 w-full rounded-xl border-[#E5E0D7] dark:border-border bg-white dark:bg-background">
                  <option>Chọn loại vi phạm...</option>
                  <option>Hành vi lừa đảo / Chiếm đoạt tài sản</option>
                  <option>Sản phẩm giả mạo / Nhái thương hiệu</option>
                  <option>Sản phẩm bị cấm (vũ khí, chất cấm...)</option>
                  <option>Ngôn từ đả kích, xúc phạm</option>
                  <option>Spam / Quảng cáo rác</option>
                </NativeSelect>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Đường dẫn liên kết (URL) của người bán hoặc sản phẩm *
                </label>
                <Input
                  type="text"
                  className="h-12 w-full rounded-xl border-[#E5E0D7] dark:border-border"
                  placeholder="https://thrift-swap.vercel.app/products/..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Mô tả chi tiết vi phạm *</label>
                <Textarea
                  className="min-h-32 w-full rounded-xl border-[#E5E0D7] dark:border-border"
                  placeholder="Vui lòng cung cấp thêm chi tiết để đội ngũ quản trị có thể xem xét nhanh chóng..."
                />
              </div>

              <Button className="w-full h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium text-sm sm:text-base shadow-surface">
                <Send className="w-4 h-4 mr-2" />
                Gửi báo cáo
              </Button>
              <p className="text-center text-xs text-[#77736D] dark:text-muted-foreground">
                Thông tin của bạn sẽ được bảo mật theo chính sách quyền riêng tư của Thriftly.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
