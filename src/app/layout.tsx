import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LBAssur Admin",
  description: "Espace administrateur LBAssur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col m-0">
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 border-r border-white/10 flex flex-col bg-black shrink-0">
            <div className="p-6 border-b border-white/10">
              <Link href="/" className="text-xl font-black tracking-widest uppercase flex items-center gap-2">
                LBAssur <span className="text-gray-500 font-medium text-sm">Admin</span>
              </Link>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
              <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <LayoutDashboard size={18} /> Vue d'ensemble
              </Link>
              <Link href="/quotes" className="flex items-center gap-3 px-4 py-3 text-sm font-bold bg-white/10 text-white rounded-lg transition-colors">
                <FileText size={18} /> Souscriptions
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Settings size={18} /> Paramètres
              </Link>
            </nav>

            <div className="p-4 border-t border-white/10">
              <Link href="http://localhost:3000/" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                <LogOut size={18} /> Déconnexion
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
