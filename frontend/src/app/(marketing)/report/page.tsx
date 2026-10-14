import { AlertTriangle, ShieldAlert, Flag, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground mb-8 rounded-full px-6 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Về trang chủ
          </Button>
        </Link>
        <div className="glass bg-background/50 rounded-[2rem] shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-border overflow-hidden">
          <div className="bg-rose-500 p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <AlertTriangle className="w-48 h-48 text-foreground" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-secondary backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6">
                <Flag className="w-8 h-8 text-foreground" />
              </div>
              <h1 className="text-3xl font-black text-foreground mb-2">Báo cáo vi phạm cộng đồng</h1>
              <p className="text-rose-100">Cùng nhau xây dựng môi trường mua bán sạch và an toàn.</p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="bg-rose-500/10 rounded-2xl p-6 mb-8 border border-rose-500/20 flex gap-4">
              <ShieldAlert className="w-8 h-8 text-rose-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-rose-500 mb-1">Cảnh báo nghiêm trọng</h3>
                <p className="text-rose-200 text-sm leading-relaxed">
                  Bất kỳ hành vi lừa đảo, giả mạo, hoặc đăng bán sản phẩm bị cấm theo pháp luật VN sẽ bị xử lý nghiêm khắc, bao gồm khóa tài khoản vĩnh viễn và đóng băng số dư ví.
                </p>
              </div>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Loại vi phạm *</label>
                <NativeSelect className="h-12 w-full">
                  <option>Chọn loại vi phạm...</option>
                  <option>Hành vi lừa đảo / Chiếm đoạt tài sản</option>
                  <option>Sản phẩm giả mạo / Nhái thương hiệu</option>
                  <option>Sản phẩm bị cấm (vũ khí, chất cấm...)</option>
                  <option>Ngôn từ đả kích, xúc phạm</option>
                  <option>Spam / Quảng cáo rác</option>
                </NativeSelect>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Đường dẫn liên kết (URL) của người bán hoặc sản phẩm *</label>
                <Input
                  type="text"
                  className="w-full"
                  placeholder="https://thriftly.com/products/..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Mô tả chi tiết vi phạm *</label>
                <Textarea
                  className="min-h-32 w-full"
                  placeholder="Vui lòng cung cấp thêm chi tiết để chúng tôi có thể xử lý nhanh chóng..."
                />
              </div>

              <Button className="w-full h-14 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-lg shadow-lg">
                <Send className="w-5 h-5 mr-2" />
                Gửi Báo Cáo
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4">Thông tin của bạn sẽ được bảo mật tuyệt đối theo chính sách của Thriftly.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
