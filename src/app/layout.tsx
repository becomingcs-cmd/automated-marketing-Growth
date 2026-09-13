import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { isClerkConfigured } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "GrowthOS", template: "%s | GrowthOS" },
  description: "The evidence-led marketing and sales operating system.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const document = (
    <html lang="en">
      <body>{children}</body>
    </html>
  );

  if (!isClerkConfigured()) return document;

  return (
    <ClerkProvider dynamic>
      {document}
    </ClerkProvider>
  );
}
