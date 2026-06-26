import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { LayoutDashboard, FileText, Settings, LogOut, ShieldAlert } from "lucide-react";
import { logoutAction } from "./login/actions";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("admin_session");

  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col m-0">
        <div className={`flex h-screen overflow-hidden ${isAuthenticated ? 'bg-[#050505] text-white' : 'bg-white text-black'}`}>
          {/* Sidebar */}
          {isAuthenticated && (
            <aside className="w-64 border-r border-white/10 flex flex-col bg-black shrink-0">
              <div className="p-6 border-b border-white/10 flex flex-col gap-4">
                <div className="w-full h-14 relative bg-white rounded-lg p-2 overflow-hidden flex items-center justify-center">
                  <Image
                    src="/images/logo.jpg"
                    alt="LBASSUR Logo"
                    fill
                    className="object-contain p-2"
                    priority
                  />
                </div>
                <Link href="/" className="text-xl font-black tracking-widest uppercase flex items-center gap-2">
                  LBAssur <span className="text-gray-500 font-medium text-sm">Admin</span>
                </Link>
              </div>
              
              <nav className="flex-1 p-4 space-y-2">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <LayoutDashboard size={18} /> Vue d'ensemble
                </Link>
                <Link href="/quotes" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <FileText size={18} /> Souscriptions
                </Link>
                <Link href="/profile-requests" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <ShieldAlert size={18} /> Demandes Profil
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <Settings size={18} /> Paramètres
                </Link>
              </nav>

              <div className="p-4 border-t border-white/10">
                <form action={logoutAction}>
                  <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                    <LogOut size={18} /> Déconnexion
                  </button>
                </form>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
