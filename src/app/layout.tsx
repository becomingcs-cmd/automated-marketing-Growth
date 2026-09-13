import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GrowthOS", template: "%s | GrowthOS" },
  description: "The evidence-led marketing and sales operating system.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

