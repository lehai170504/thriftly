'use client';

import { Shield, RefreshCw, Handshake, Heart, Target, TrendingUp, Users as UsersIcon, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { motion, Variants } from 'framer-motion';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function AboutPage() {
  return (
    <div className="bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-background/50 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-70 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-50"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <motion.div
            className="flex-1 text-center md:text-left"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeIn}>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 mb-6 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-md">
                Tầm nhìn & Sứ mệnh
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-serif font-black text-foreground mb-6 tracking-tight leading-[1.1]">
              Tái sinh giá trị <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                Kết nối cộng đồng
              </span>
            </motion.h1>
            <motion.p variants={fadeIn} className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto md:mx-0">
              Chúng tôi tin rằng mọi món đồ đều có câu chuyện riêng và xứng đáng có cơ hội thứ hai. Thriftly ra đời để làm cho việc mua bán đồ cũ trở nên an toàn, minh bạch và chuyên nghiệp hơn bao giờ hết.
            </motion.p>
            <motion.div variants={fadeIn} className="flex gap-4 justify-center md:justify-start">
              <Link href="/products">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-14 text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all">
                  Khám phá ngay <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex-1 w-full relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-blue-500 rounded-full blur-[80px] opacity-30 animate-pulse"></div>
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800"
                alt="Thriftly Vision"
                className="w-full h-full object-cover rounded-[3rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border border-white/10"
              />
              {/* Floating UI Elements */}
              <div className="absolute -left-8 top-1/4 glass p-4 rounded-2xl shadow-xl border border-white/10 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center"><Shield className="w-5 h-5" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Thanh toán Escrow</div>
                    <div className="font-bold">An toàn 100%</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 bottom-1/4 glass p-4 rounded-2xl shadow-xl border border-white/10 animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">Đấu giá Live</div>
                    <div className="font-bold">Thời gian thực</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-5xl font-serif font-black text-foreground mb-6">Giá trị cốt lõi</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-xl">Những nguyên tắc định hình cách chúng tôi xây dựng nền tảng và phục vụ cộng đồng.</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            {[
              { icon: Shield, color: 'blue', title: 'An toàn tuyệt đối', desc: 'Hệ thống thanh toán Escrow hiện đại giữ tiền an toàn cho đến khi bạn hài lòng với món đồ nhận được.' },
              { icon: RefreshCw, color: 'green', title: 'Phát triển bền vững', desc: 'Kéo dài vòng đời sản phẩm, giảm thiểu rác thải và đóng góp vào nền kinh tế tuần hoàn.' },
              { icon: Handshake, color: 'purple', title: 'Giao dịch công bằng', desc: 'Cơ chế đấu giá minh bạch thời gian thực đảm bảo cả người mua và người bán đều nhận được giá trị tốt nhất.' },
              { icon: Heart, color: 'rose', title: 'Cộng đồng tin cậy', desc: 'Xây dựng môi trường giao lưu lành mạnh với hệ thống đánh giá uy tín đa chiều khắt khe.' }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeIn} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                <div className="relative h-full glass bg-background/40 backdrop-blur-xl p-8 rounded-[2rem] border border-border/50 hover:border-primary/50 transition-all duration-300">
                  <div className={`w-16 h-16 bg-${item.color}-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-8 h-8 text-${item.color}-500`} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story & Numbers Section */}
      <section className="py-32 bg-accent/30 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div
              className="flex-1 space-y-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-serif font-black text-foreground leading-[1.2]">
                Cách chúng tôi định hình lại <br /><span className="text-primary">Thị trường Đồ cũ</span>
              </motion.h2>
              <motion.p variants={fadeIn} className="text-xl text-muted-foreground leading-relaxed">
                Thriftly bắt đầu từ một ý tưởng đơn giản: Làm thế nào để giải quyết những món đồ "bỏ thì thương, vương thì chật" một cách văn minh nhất?
              </motion.p>
              <motion.p variants={fadeIn} className="text-xl text-muted-foreground leading-relaxed">
                Nhận thấy những rủi ro trong giao dịch đồ cũ truyền thống như lừa đảo, bom hàng hay ép giá, chúng tôi đã ứng dụng công nghệ <strong className="text-foreground">Thanh toán Escrow</strong> và <strong className="text-foreground">Đấu giá thời gian thực (WebSockets)</strong> để mang lại sự an tâm tuyệt đối.
              </motion.p>

              <motion.div variants={fadeIn} className="grid grid-cols-2 gap-8 pt-8">
                <div className="glass p-6 rounded-2xl border border-border/50 text-center">
                  <div className="text-5xl font-black text-primary mb-2"><AnimatedCounter end={120} suffix="K+" /></div>
                  <div className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Sản phẩm tái sinh</div>
                </div>
                <div className="glass p-6 rounded-2xl border border-border/50 text-center">
                  <div className="text-5xl font-black text-primary mb-2"><AnimatedCounter end={0} suffix="%" /></div>
                  <div className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Lừa đảo giao dịch</div>
                </div>
                <div className="glass p-6 rounded-2xl border border-border/50 text-center">
                  <div className="text-5xl font-black text-primary mb-2"><AnimatedCounter end={24} suffix="/7" /></div>
                  <div className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Hỗ trợ cộng đồng</div>
                </div>
                <div className="glass p-6 rounded-2xl border border-border/50 text-center">
                  <div className="text-5xl font-black text-primary mb-2"><AnimatedCounter end={50} suffix="K+" /></div>
                  <div className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Thành viên tích cực</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex-1 w-full"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6 pt-12">
                  <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl group">
                    <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" alt="Packaging" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl group">
                    <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800" alt="Environment" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent flex flex-col justify-end p-8 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Heart className="w-10 h-10 mb-3" />
                      <div className="text-2xl font-bold mb-1">Cam kết môi trường</div>
                      <div className="text-primary-foreground/80 font-medium">Giảm thiểu 500 tấn CO2 mỗi năm</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <motion.div
            className="text-center mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-black mb-6">Hành trình của chúng tôi</h2>
            <p className="text-muted-foreground text-xl">Từ một ý tưởng nhỏ đến hệ sinh thái đồ cũ an toàn nhất Việt Nam.</p>
          </motion.div>

          <div className="relative">
            {/* Cột mốc dọc */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-blue-500 to-transparent -translate-x-1/2 rounded-full opacity-30"></div>

            <div className="space-y-24">
              {[
                { year: '2023', title: 'Ý tưởng khởi nguồn', desc: 'Thriftly ra đời từ nhận thức về vấn nạn lừa đảo khi mua bán đồ cũ trên các diễn đàn mạng xã hội.', icon: Target },
                { year: '2024', title: 'Ra mắt tính năng Escrow', desc: 'Lần đầu tiên tích hợp hệ thống thanh toán trung gian an toàn tuyệt đối cho mô hình C2C tại Việt Nam.', icon: Shield },
                { year: '2025', title: 'Phát triển Đấu giá Live', desc: 'Nâng tầm trải nghiệm săn hàng độc lạ bằng công nghệ WebSocket, mang lại cảm giác kịch tính như đấu giá thực.', icon: TrendingUp },
                { year: '2026', title: 'Cộng đồng 50,000+ thành viên', desc: 'Trở thành nền tảng đáng tin cậy nhất, đóng góp vào việc giảm thiểu hàng ngàn tấn rác thải thời trang mỗi năm.', icon: Award },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex flex-col md:flex-row items-center justify-between gap-12 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="w-full md:w-5/12 text-center md:text-left">
                    <div className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 mb-4 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                      {item.year}
                    </div>
                    <h3 className={`text-2xl font-bold mb-4 text-foreground ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>{item.title}</h3>
                    <p className={`text-muted-foreground text-lg leading-relaxed ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>{item.desc}</p>
                  </div>

                  <div className="hidden md:flex w-2/12 justify-center relative">
                    <div className="w-16 h-16 bg-background border-4 border-primary rounded-full flex items-center justify-center z-10 shadow-[0_0_30px_rgba(var(--primary),0.4)]">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  <div className="hidden md:block w-5/12"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            className="glass bg-gradient-to-br from-background/80 to-accent/20 rounded-[3rem] p-10 md:p-16 border border-border shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Quotes Background */}
            <div className="absolute top-8 right-12 text-[15rem] leading-none font-serif text-primary/5 select-none pointer-events-none">"</div>

            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              <div className="w-56 h-56 md:w-72 md:h-72 flex-shrink-0 mx-auto md:mx-0 rounded-[2rem] overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
                  alt="Nhà sáng lập"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center md:text-left flex-1">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none mb-6 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
                  Nhà Sáng Lập (Solo Developer)
                </Badge>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-foreground mb-6 leading-tight">"Mỗi dòng code đều mang khát vọng tạo ra một thị trường an toàn hơn."</h2>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8 font-medium">
                  Thriftly được xây dựng và phát triển độc lập với một niềm đam mê duy nhất: Tạo ra một nền tảng giao dịch đồ cũ an toàn, minh bạch và hiện đại nhất. Từng tính năng đều được chăm chút tỉ mỉ nhằm mang lại trải nghiệm tốt nhất cho bạn.
                </p>
                <div className="flex gap-4 justify-center md:justify-start">
                  <Link href="/about/contact">
                    <Button size="lg" className="rounded-full px-8 h-14 bg-foreground text-background hover:bg-foreground/90 text-lg font-bold">
                      Trò chuyện cùng tôi
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            className="bg-gradient-to-r from-primary to-blue-600 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl shadow-primary/20 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-serif font-black text-white mb-6 leading-tight">Sẵn sàng dọn dẹp tủ đồ của bạn?</h2>
              <p className="text-2xl text-white/80 mb-12 font-medium">Gia nhập cộng đồng Thriftly ngay hôm nay để biến đồ cũ thành tiền và nhường cơ hội thứ hai cho món đồ của bạn.</p>
              <div className="flex gap-4 justify-center">
                <Link href="/products">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-10 h-16 text-xl font-black shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                    Khám phá ngay
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
