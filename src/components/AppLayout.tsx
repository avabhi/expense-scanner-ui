"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Upload,
  History,
  BarChart3,
  Tag,
  Settings,
  Bell,
  HelpCircle,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload Receipt", href: "/", icon: Upload },
    { name: "History", href: "/history", icon: History },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Categories", href: "/categories", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-cyan-900/10 via-blue-950/5 to-transparent pointer-events-none select-none z-0"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[260px] bg-slate-950/80 backdrop-blur-xl border-r border-slate-900 flex-col z-40">
        <div className="px-6 py-6 flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="h-5 w-5 text-slate-950 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-slate-100 block leading-tight">EXPENSEAI</span>
            <span className="text-[9px] font-mono text-cyan-400 font-semibold tracking-widest uppercase">
              Vision OCR Agent
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 group font-medium text-sm ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-l-2 border-cyan-400 text-cyan-400 bg-slate-900/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
              >
                <Icon className={`h-4 w-4 transition duration-200 ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-900">
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Receipt</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay and Menu) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-slate-950 border-r border-slate-900 pt-5 pb-4 z-50">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex flex-shrink-0 items-center px-6">
              <span className="font-extrabold text-base tracking-wider text-slate-100">EXPENSEAI</span>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 font-medium text-sm ${
                      isActive
                        ? "bg-slate-900/80 border-l-2 border-cyan-400 text-cyan-400"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-900">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/");
                }}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Receipt</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[260px] z-10 relative">
        {/* Top Header */}
        <header className="h-16 bg-slate-950/60 backdrop-blur-md border-b border-slate-900/80 flex justify-between items-center px-6 sticky top-0 z-30">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="lg:hidden p-2 text-slate-400 hover:text-slate-200"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search bar placeholder */}
          <div className="hidden md:flex flex-1 max-w-md items-center relative">
            <svg
              className="h-4 w-4 text-slate-500 absolute left-3 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search expenses, merchants, categories..."
              className="w-full bg-slate-900/60 border border-slate-800 focus:border-cyan-500/50 text-slate-200 text-xs rounded-full pl-9 pr-4 py-1.5 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all placeholder-slate-500"
            />
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center space-x-4">
            <button className="p-1.5 text-slate-500 hover:text-slate-300 transition hover:bg-slate-900 rounded-full relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-cyan-400 rounded-full"></span>
            </button>
            <button className="p-1.5 text-slate-500 hover:text-slate-300 transition hover:bg-slate-900 rounded-full">
              <HelpCircle className="h-4.5 w-4.5" />
            </button>

            <span className="h-5 w-px bg-slate-900"></span>

            {/* Profile Dropdown */}
            {session?.user && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-900 transition text-left cursor-pointer"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="User avatar"
                      className="h-7 w-7 rounded-full border border-slate-800 object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center text-[10px] text-cyan-400 font-black">
                      {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs text-slate-300 font-semibold truncate max-w-[120px]">
                    {session.user.name || session.user.email}
                  </span>
                  <ChevronDown className="hidden sm:inline h-3 w-3 text-slate-500" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-fade-in">
                      <div className="px-3 py-2 border-b border-slate-800/60 mb-1">
                        <p className="text-xs font-bold text-slate-200 truncate">{session.user.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{session.user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-xl transition text-left"
                      >
                        <LogOut className="h-4.5 w-4.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 flex flex-col p-6 z-10">{children}</main>
      </div>
    </div>
  );
}
