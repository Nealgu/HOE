import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Install Procea",
  description: "Online installation settlement and subcontractor payment workflow."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
