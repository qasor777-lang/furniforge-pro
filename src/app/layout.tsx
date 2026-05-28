import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { Sparkles, LayoutGrid, Upload, Boxes, Scissors, Sofa, FolderOpen, Link2, Layers, Wand2 } from "lucide-react";
import HeaderUser from "@/components/HeaderUser";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "FurniForge Pro — AI Furniture Design Platform",
  description: "Bazis-Mebelshikdan 10x kuchli, AI asosida xona tahlili va parametric mebel ishlab chiqarish platformasi",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#7c5cff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c5cff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
        ` }} />
        <ErrorBoundary>
        <header className="sticky top-0 z-30 backdrop-blur bg-bg/80 border-b border-border">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span>FurniForge<span className="text-accent2">.Pro</span></span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <Link href="/analyze" className="px-3 py-1.5 rounded-lg hover:bg-white/5 flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" />Tahlil</Link>
              <Link href="/catalog" className="px-3 py-1.5 rounded-lg hover:bg-white/5 flex items-center gap-1.5"><LayoutGrid className="w-3.5 h-3.5" />Katalog</Link>
              <Link href="/sets" className="px-3 py-1.5 rounded-lg hover:bg-white/5 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" />Komplektlar</Link>
              <Link href="/studio" className="px-3 py-1.5 rounded-lg hover:bg-white/5 flex items-center gap-1.5"><Sofa className="w-3.5 h-3.5" />Studio</Link>
              <Link href="/create" className="px-3 py-1.5 rounded-lg hover:bg-white/5 flex items-center gap-1.5 text-accent"><Wand2 className="w-3.5 h-3.5" />Yarat</Link>
              <Link href="/import" className="hidden lg:flex px-3 py-1.5 rounded-lg hover:bg-white/5 items-center gap-1.5"><Link2 className="w-3.5 h-3.5" />Import</Link>
              <Link href="/projects" className="hidden lg:flex px-3 py-1.5 rounded-lg hover:bg-white/5 items-center gap-1.5"><FolderOpen className="w-3.5 h-3.5" />Loyihalar</Link>
              <div className="ml-2 pl-2 border-l border-border">
                <HeaderUser />
              </div>
            </nav>
            <details className="md:hidden relative">
              <summary className="list-none cursor-pointer p-2 rounded-lg hover:bg-white/5">
                <div className="space-y-1"><div className="w-5 h-0.5 bg-white" /><div className="w-5 h-0.5 bg-white" /><div className="w-5 h-0.5 bg-white" /></div>
              </summary>
              <div className="absolute right-0 top-12 w-56 card p-2 z-50 flex flex-col gap-0.5">
                <Link href="/analyze" className="px-3 py-2 rounded hover:bg-white/5 flex items-center gap-2"><Upload className="w-4 h-4" />Tahlil</Link>
                <Link href="/catalog" className="px-3 py-2 rounded hover:bg-white/5 flex items-center gap-2"><LayoutGrid className="w-4 h-4" />Katalog</Link>
                <Link href="/sets" className="px-3 py-2 rounded hover:bg-white/5 flex items-center gap-2"><Layers className="w-4 h-4" />Komplektlar</Link>
                <Link href="/studio" className="px-3 py-2 rounded hover:bg-white/5 flex items-center gap-2"><Sofa className="w-4 h-4" />Studio</Link>
                <Link href="/create" className="px-3 py-2 rounded hover:bg-white/5 flex items-center gap-2 text-accent"><Wand2 className="w-4 h-4" />Yarat</Link>
                <Link href="/import" className="px-3 py-2 rounded hover:bg-white/5 flex items-center gap-2"><Link2 className="w-4 h-4" />Import</Link>
                <Link href="/projects" className="px-3 py-2 rounded hover:bg-white/5 flex items-center gap-2"><FolderOpen className="w-4 h-4" />Loyihalar</Link>
                <div className="border-t border-border mt-1 pt-1"><HeaderUser /></div>
              </div>
            </details>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <Toaster position="top-right" richColors />
        </ErrorBoundary>
        <footer className="border-t border-border text-center py-6 text-xs text-muted">
          FurniForge Pro · MVP · {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
