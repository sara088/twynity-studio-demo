import type { Metadata, Viewport } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { dmSans, syne, inter } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Twynity",
  description: "Create AI versions of yourself. Hire AI versions of others.",
};

// `viewportFit: cover` exposes the safe-area-inset-* env() vars used by the
// mobile bottom nav and other fixed bars. Zoom left enabled (accessibility).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${syne.variable} ${inter.variable}`}
    >
      {/* Runtime env vars injected by docker/env.sh — only present in containerised deployments */}
      <head>
        <script src="/env-config.js" />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-right" visibleToasts={5} />
      </body>
    </html>
  );
}
