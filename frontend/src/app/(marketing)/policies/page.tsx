'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, Lock, RefreshCw, Gavel, Scale, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const policies = {
  terms: {
    id: 'terms',
    title: 'Điều khoản sử dụng',
    desc: 'Các quy định và ràng buộc pháp lý khi sử dụng dịch vụ.',
    icon: ShieldCheck,
    sections: [
      { title: "Giới thiệu", content: "<p>Chào mừng bạn đến với Thriftly. Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng các dịch vụ của chúng tôi, bạn đồng ý tuân thủ và bị ràng buộc bởi các <strong>Điều khoản sử dụng</strong> này. Nếu bạn không đồng ý với bất kỳ phần nào, vui lòng ngừng sử dụng dịch vụ.</p>" },
      { title: "Tài khoản người dùng", content: "<p>Bạn cần phải tạo một tài khoản hợp lệ để sử dụng đầy đủ các tính năng như mua bán, đấu giá, và ví Escrow. Bạn chịu trách nhiệm hoàn toàn về việc bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của mình. Thriftly có quyền tạm khóa hoặc xóa tài khoản nếu phát hiện hành vi gian lận.</p>" },
      { title: "Quy định về hàng hóa", content: "<p>Tất cả hàng hóa đăng bán phải tuân thủ pháp luật Việt Nam hiện hành. Nghiêm cấm mua bán các danh mục sau:</p><ul><li>Vũ khí, đạn dược, vật liệu nổ.</li><li>Chất gây nghiện, ma túy, hóa chất độc hại.</li><li>Hàng giả, hàng nhái, hàng vi phạm bản quyền sở hữu trí tuệ.</li><li>Động vật hoang dã, các sản phẩm từ động vật quý hiếm.</li></ul>" },
      { title: "Phí dịch vụ nền tảng (Platform Commission)", content: "<p>Thriftly áp dụng mức phí dịch vụ từ <strong>3% đến 5%</strong> trên tổng giá trị đối với mỗi giao dịch hoặc phiên đấu giá thành công (chỉ thu từ Người bán khi tiền từ Escrow giải ngân vào ví):</p><ul><li>Thành viên Đồng (Bronze): <strong>5%</strong>.</li><li>Thành viên Bạc (Silver): <strong>4%</strong>.</li><li>Thành viên Vàng (Gold): <strong>3%</strong>.</li></ul><p>Người mua hoàn toàn không phải chịu phí dịch vụ nền tảng.</p>" },
      { title: "Chính sách rút tiền về ngân hàng", content: "<p>Người dùng được <strong>miễn phí 100%</strong> khi thực hiện lệnh rút tiền từ ví Thriftly về tài khoản ngân hàng nội địa chính chủ. Hạn mức rút tối thiểu là <strong>50.000 VNĐ</strong> mỗi lần giao dịch. Hệ thống xử lý lệnh rút tiền tự động và hoàn tất trong vòng 24 giờ làm việc.</p>" }
    ]
  },
  auction: {
    id: 'auction',
    title: 'Quy chế đấu giá & Ký quỹ',
    desc: 'Quy tắc tham gia đấu giá, ký quỹ cọc và xử lý vi phạm khi thắng phiên.',
    icon: Gavel,
    sections: [
      { title: "Ký quỹ cọc khi tham gia đấu giá", content: "<p>Để đảm bảo tính nghiêm túc và minh bạch trong từng phiên đấu giá, người tham gia cần có số dư khả dụng trong ví tối thiểu bằng <strong>10% giá khởi điểm</strong> của sản phẩm (hoặc mức cọc tối thiểu do người bán quy định). Khoản cọc này sẽ được tạm giữ tự động trong thời gian bạn đang là người trả giá cao nhất.</p>" },
      { title: "Quy tắc trả giá & Tự động gia hạn", content: "<p>Mỗi lượt trả giá phải cao hơn giá hiện tại ít nhất <strong>01 bước giá</strong> quy định. Để chống tình trạng 'bắn tỉa' (sniper bid) gây mất công bằng, nếu có lượt trả giá hợp lệ trong <strong>02 phút cuối cùng</strong> của phiên, hệ thống sẽ tự động gia hạn thêm 02 phút cho đến khi không còn lượt trả giá mới.</p>" },
      { title: "Trách nhiệm thanh toán của người thắng cuộc", content: "<p>Khi phiên đấu giá kết thúc, người trả giá cao nhất là người thắng cuộc hợp lệ. Người thắng có thời hạn tối đa <strong>48 giờ</strong> để hoàn tất đơn hàng và thanh toán số tiền còn lại (tiền cọc sẽ được cấn trừ trực tiếp vào đơn hàng). Hàng hóa sẽ được người bán đóng gói và bàn giao cho đơn vị vận chuyển.</p>" },
      { title: "Chế tài xử phạt hành vi bùng kèo (Hủy mua)", content: "<p>Nếu người thắng không hoàn tất thanh toán sau 48 giờ:</p><ul><li>Toàn bộ tiền đặt cọc sẽ bị tịch thu: <strong>50%</strong> được chuyển cho Người bán để bù đắp thiệt hại lưu kho/phiên đấu, <strong>50%</strong> được nộp vào quỹ vận hành và bảo hiểm rủi ro của sàn.</li><li>Tài khoản người mua sẽ bị trừ điểm uy tín (Trust Score) và tạm khóa quyền tham gia đấu giá trong vòng <strong>30 ngày</strong>. Tái phạm lần thứ hai sẽ bị khóa tài khoản vĩnh viễn.</li></ul>" }
    ]
  },
  privacy: {
    id: 'privacy',
    title: 'Bảo mật thông tin',
    desc: 'Chính sách bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn.',
    icon: Lock,
    sections: [
      { title: "Thu thập thông tin", content: "<p>Chúng tôi thu thập các thông tin cá nhân cần thiết để cung cấp dịch vụ tốt nhất cho bạn, bao gồm: Họ tên, Số điện thoại, Email, Địa chỉ giao nhận hàng, và thông tin giao dịch trên nền tảng. Mọi thông tin đều được thu thập với sự cho phép của bạn.</p>" },
      { title: "Sử dụng thông tin", content: "<p>Thông tin của bạn được sử dụng vào các mục đích: <ul><li>Xử lý đơn hàng, điều phối giao nhận.</li><li>Xử lý thanh toán qua hệ thống ví Escrow.</li><li>Hỗ trợ khách hàng và giải quyết khiếu nại.</li><li>Gửi thông báo quan trọng về tài khoản và giao dịch.</li></ul> Chúng tôi cam kết KHÔNG bán hoặc cho thuê dữ liệu cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo.</p>" },
      { title: "Bảo mật dữ liệu", content: "<p>Dữ liệu cá nhân của bạn được lưu trữ trên các máy chủ bảo mật cao, áp dụng công nghệ mã hóa tiên tiến (SSL/TLS) để ngăn chặn truy cập trái phép. Mọi thông tin liên quan đến mật khẩu và thẻ thanh toán đều được băm (hash) và mã hóa một chiều.</p>" },
      { title: "Quyền của người dùng", content: "<p>Bạn có toàn quyền truy cập, chỉnh sửa hoặc yêu cầu xóa bỏ thông tin cá nhân của mình khỏi hệ thống Thriftly bất cứ lúc nào thông qua phần Cài đặt Tài khoản, trừ các dữ liệu giao dịch bắt buộc phải lưu trữ theo quy định của pháp luật.</p>" }
    ]
  },
  refund: {
    id: 'refund',
    title: 'Chính sách hoàn tiền',
    desc: 'Quy định về đổi trả và hoàn tiền qua hệ thống Escrow.',
    icon: RefreshCw,
    sections: [
      { title: "Điều kiện hoàn tiền", content: "<p>Người mua có quyền yêu cầu trả hàng/hoàn tiền trong vòng <strong>3 ngày</strong> kể từ khi đơn vị vận chuyển cập nhật trạng thái 'Giao hàng thành công', nếu thuộc các trường hợp sau:</p><ul><li>Sản phẩm nhận được không đúng với mô tả, hình ảnh đăng bán.</li><li>Sản phẩm bị lỗi, hỏng hóc hoặc thiếu phụ kiện.</li><li>Hàng giả, hàng nhái (cần bằng chứng chứng minh).</li></ul>" },
      { title: "Quy trình xử lý Escrow", content: "<p>Khi bạn gửi yêu cầu hoàn tiền, số tiền thanh toán của bạn sẽ <strong>tiếp tục bị đóng băng</strong> trong ví Escrow. Người bán sẽ nhận được thông báo và có <strong>2 ngày</strong> để phản hồi. Nếu người bán đồng ý hoặc không phản hồi quá hạn, hệ thống sẽ tự động hoàn tiền cho người mua.</p>" },
      { title: "Trường hợp không được hoàn tiền", content: "<p>Thriftly không hỗ trợ hoàn tiền trong các trường hợp: <ul><li>Người mua đổi ý, không muốn mua nữa (đối với hàng không bị lỗi).</li><li>Sản phẩm bị hư hỏng do lỗi sử dụng từ phía người mua.</li><li>Người mua đã bấm nút 'Đã nhận hàng' (tiền đã được chuyển khoản cho người bán).</li></ul></p>" }
    ]
  },
  'dispute-resolution': {
    id: 'dispute-resolution',
    title: 'Giải quyết khiếu nại',
    desc: 'Quy trình xử lý tranh chấp minh bạch và công bằng.',
    icon: Scale,
    sections: [
      { title: "Tiếp nhận khiếu nại", content: "<p>Khi có tranh chấp xảy ra giữa người mua và người bán (ví dụ: yêu cầu hoàn tiền bị từ chối), bất kỳ bên nào cũng có thể nhấn nút <strong>'Yêu cầu Thriftly can thiệp'</strong>. Khiếu nại sẽ được chuyển đến Trung tâm Giải quyết Tranh chấp.</p>" },
      { title: "Cung cấp bằng chứng", content: "<p>Cả hai bên có 48 giờ để tải lên các bằng chứng chứng minh. <strong>Đối với Người mua:</strong> Video mở hộp (unbox) liên tục không cắt ghép, hình ảnh chi tiết lỗi sản phẩm. <strong>Đối với Người bán:</strong> Video/hình ảnh đóng gói sản phẩm trước khi giao, bill gửi hàng.</p>" },
      { title: "Phân xử và Quyết định", content: "<p>Đội ngũ Quản trị viên (Admin) của Thriftly sẽ xem xét toàn bộ bằng chứng khách quan, kết hợp với lịch sử nhắn tin giữa hai bên trên hệ thống để đưa ra quyết định. Quyết định của Thriftly là <strong>quyết định cuối cùng</strong> và có hiệu lực ngay lập tức.</p>" },
      { title: "Phân bổ tiền Escrow", content: "<p>Dựa trên phán quyết, số tiền trong hệ thống Escrow sẽ được phân bổ tương ứng (Hoàn toàn bộ cho người mua, chuyển toàn bộ cho người bán, hoặc hoàn một phần tùy theo thỏa thuận). Trong trường hợp người bán bị xác định cố tình lừa đảo, tài khoản sẽ bị cấm vĩnh viễn.</p>" }
    ]
  }
};

export default function PoliciesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Đang tải...</div>}>
      <PoliciesContent />
    </Suspense>
  );
}

function PoliciesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState('terms');

  useEffect(() => {
    if (tabParam && policies[tabParam as keyof typeof policies]) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/policies?tab=${value}`, { scroll: false });
  };

  const currentPolicy = policies[activeTab as keyof typeof policies];
  const Icon = currentPolicy.icon;

  return (
    <div className="bg-background min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 pb-20 bg-background/50 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="container mx-auto px-4 relative z-10 max-w-5xl">

          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground mb-8 rounded-full px-6 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" /> Về trang chủ
            </Button>
          </Link>

          <div className="text-center">
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none mb-6 px-4 py-1.5 rounded-full text-sm font-medium">
              Trung tâm Chính sách
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6 tracking-tight">
              Quy định & Chính sách Thriftly
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Chúng tôi luôn hướng tới một môi trường giao dịch minh bạch, công bằng và an toàn tuyệt đối cho mọi thành viên trong cộng đồng.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-20 -mt-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="glass bg-background/50 rounded-[2rem] border border-border shadow-[0_0_15px_rgba(255,255,255,0.05)] overflow-hidden">
            <Tabs value={activeTab} onValueChange={handleTabChange} orientation="vertical" className="w-full flex !flex-col md:!flex-row min-h-[600px] !gap-0">

              {/* Sidebar Tabs */}
              <div className="w-full md:w-80 bg-background/80 border-b md:border-b-0 md:border-r border-border p-6 flex-shrink-0">
                <div className="font-bold text-foreground mb-6 px-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Danh mục chính sách
                </div>
                <TabsList className="!flex !flex-row md:!flex-col !h-auto bg-transparent !space-y-0 md:!space-y-2 !space-x-2 md:!space-x-0 overflow-x-auto md:overflow-visible p-0 w-full justify-start">
                  {Object.values(policies).map((p) => {
                    const TabIcon = p.icon;
                    return (
                      <TabsTrigger
                        key={p.id}
                        value={p.id}
                        className="data-[state=active]:bg-muted/80 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-xl py-4 px-4 w-full justify-start text-left whitespace-nowrap text-muted-foreground font-medium transition-all"
                      >
                        <TabIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                        {p.title}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-8 md:p-12">
                {Object.values(policies).map((p) => (
                  <TabsContent key={p.id} value={p.id} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                      <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <p.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-foreground">{p.title}</h2>
                        <p className="text-muted-foreground mt-1">{p.desc}</p>
                      </div>
                    </div>

                    <div className="space-y-12">
                      {p.sections.map((sec, i) => (
                        <div key={i}>
                          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black">{i + 1}</span>
                            {sec.title}
                          </h3>
                          <div
                            className="text-muted-foreground leading-relaxed pl-11 prose prose-invert max-w-none prose-p:mb-4 prose-ul:list-disc prose-li:mb-2 prose-strong:text-foreground"
                            dangerouslySetInnerHTML={{ __html: sec.content }}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </div>

            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
}
