import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { Be_Vietnam_Pro, Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "next-themes";
import React from "react";
import Providers from "../src/components/providers";
import "../src/app/globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  variable: "--font-playfair",
});

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === "dark" ? "dark" : "light";

  return (
    <ThemeProvider attribute="class" forcedTheme={theme} enableSystem={false}>
      <Providers>
        <div className={`${beVietnamPro.variable} ${inter.variable} ${playfair.variable} min-h-screen bg-background p-6 text-foreground`}>
          <Story />
        </div>
      </Providers>
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Theme used to render component stories",
      defaultValue: "light",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  parameters: {
    controls: { expanded: true },
    a11y: { test: "error" },
    viewport: {
      options: {
        mobile: { name: "Mobile 375", styles: { width: "375px", height: "812px" } },
        tablet: { name: "Tablet 768", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop 1440", styles: { width: "1440px", height: "900px" } },
      },
    },
  },
};

export default preview;
