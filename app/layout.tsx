import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我们的小食堂",
  description: "情侣点菜小站",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  );
}
