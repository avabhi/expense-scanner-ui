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
    <div className="min-h-screen bg-background text-foreground flex selection:bg-primary/20 selection:text-primary">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 via-primary/[0.01] to-transparent pointer-events-none select-none z-0"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[260px] bg-sidebar border-r border-sidebar-border flex-col z-40">
        <div className="px-6 py-6 flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <svg className="h-5 w-5 text-primary-foreground font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider text-sidebar-foreground block leading-tight">EXPENSEAI</span>
            <span className="text-[9px] font-mono text-primary font-semibold tracking-widest uppercase">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 group font-semibold text-xs uppercase tracking-wider ${
                  isActive
                    ? "bg-sidebar-accent text-primary border-l-2 border-primary font-bold shadow-sm"
                    : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon className={`h-4 w-4 transition duration-200 ${isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Receipt</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay and Menu) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-sidebar border-r border-sidebar-border pt-5 pb-4 z-50">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-sidebar-foreground" />
              </button>
            </div>
            <div className="flex flex-shrink-0 items-center px-6">
              <span className="font-extrabold text-base tracking-wider text-sidebar-foreground">EXPENSEAI</span>
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 font-semibold text-xs uppercase tracking-wider ${
                      isActive
                        ? "bg-sidebar-accent border-l-2 border-primary text-primary font-bold"
                        : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/");
                }}
                className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
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
        <header className="h-16 bg-sidebar/80 backdrop-blur-md border-b border-sidebar-border flex justify-between items-center px-6 sticky top-0 z-30">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="lg:hidden p-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search bar placeholder */}
          <div className="hidden md:flex flex-1 max-w-md items-center relative">
            <svg
              className="h-4 w-4 text-sidebar-foreground/50 absolute left-3 pointer-events-none"
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
              className="w-full bg-background border border-sidebar-border focus:border-primary/50 text-foreground text-xs rounded-full pl-9 pr-4 py-1.5 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder-sidebar-foreground/40"
            />
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center space-x-4">
            <button className="p-1.5 text-sidebar-foreground/60 hover:text-sidebar-foreground transition hover:bg-sidebar-accent rounded-full relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-primary rounded-full"></span>
            </button>
            <button className="p-1.5 text-sidebar-foreground/60 hover:text-sidebar-foreground transition hover:bg-sidebar-accent rounded-full">
              <HelpCircle className="h-4.5 w-4.5" />
            </button>

            <span className="h-5 w-px bg-sidebar-border"></span>

            {/* Profile Dropdown */}
            {session?.user && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-sidebar-accent transition text-left cursor-pointer"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="User avatar"
                      className="h-7 w-7 rounded-full border border-sidebar-border object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center text-[10px] text-primary font-black">
                      {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs text-sidebar-foreground font-semibold truncate max-w-[120px]">
                    {session.user.name || session.user.email}
                  </span>
                  <ChevronDown className="hidden sm:inline h-3 w-3 text-sidebar-foreground/50" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-52 bg-sidebar border border-sidebar-border rounded-2xl p-1.5 shadow-2xl z-50 animate-fade-in">
                      <div className="px-3 py-2 border-b border-sidebar-border mb-1">
                        <p className="text-xs font-bold text-sidebar-foreground truncate">{session.user.name}</p>
                        <p className="text-[10px] text-sidebar-foreground/60 font-mono truncate">{session.user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50/10 rounded-xl transition text-left"
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
