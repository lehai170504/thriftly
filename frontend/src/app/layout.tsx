import type { Metadata } from "next";
import { Inter, Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { AnalyticsManager } from "@/components/layout/AnalyticsManager";
import { ThemeProvider } from "next-themes";
import { FloatingLiveWidget } from "@/components/layout/FloatingLiveWidget";
import { GlobalChatWidget } from "@/features/chat/components/GlobalChatWidget";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thriftly - E-commerce platform",
  description: "Nền tảng thanh lý đồ cũ và đấu giá thông minh",
  icons: {
    icon: "/logo.png?v=5",
    shortcut: "/logo.png?v=5",
    apple: "/logo.png?v=5",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${beVietnamPro.variable} ${inter.variable} ${playfair.variable} antialiased`}>
      <body suppressHydrationWarning className="font-sans min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-primary overflow-x-hidden">
        <AnalyticsManager />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Providers>
            <AnnouncementBanner />
            <main className="flex-1">
              {children}
            </main>
            <GlobalChatWidget />
            <FloatingLiveWidget />
            <CookieConsent />
            <Toaster position="bottom-right" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
