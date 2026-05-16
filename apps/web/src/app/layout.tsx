import type { Metadata } from "next";
import * as React from 'react';
import "./globals.css";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import { AppLayout } from "@/shared/components/ui/organisms/AppLayout";
import { AuthInitializer } from "@/shared/providers/AuthInitializer";

export const metadata: Metadata = {
  title: "StoryVerse — Tu Tiên Chi Đạo",
  description: "Nền tảng đọc truyện tu tiên, nghe audio, gamification và economy premium. Bước vào thế giới huyền bí.",
  keywords: "đọc truyện, tu tiên, audio truyện, huyền huyễn, gamification",
  openGraph: {
    title: "StoryVerse — Tu Tiên Chi Đạo",
    description: "Bước vào con đường tu luyện huyền bí",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthInitializer>
            <AppLayout>
              {children}
            </AppLayout>
          </AuthInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
