import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minha Vida Menor",
  description: "Acompanhe, Cuide, Conquiste! Assistente pessoal gratuito de acompanhamento do emagrecimento.",
  manifest: "/manifest.webmanifest",
  applicationName: "Minha Vida Menor",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Minha Vida Menor", statusBarStyle: "default" },
};
export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
