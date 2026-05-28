"use client";

import { useSession, signIn } from "next-auth/react";
import React from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#11131b] text-[#e2e1ed] flex flex-col items-center justify-center font-mono select-none">
        <div className="relative flex items-center justify-center">
          {/* Outer rotating ring */}
          <div className="absolute h-16 w-16 rounded-full border-2 border-transparent border-t-[#1a56db] border-r-[#1a56db] animate-spin"></div>
          {/* Inner pulsing core */}
          <div className="h-10 w-10 rounded-full bg-[#7bd0ff]/10 border border-[#7bd0ff]/30 flex items-center justify-center animate-pulse">
            <div className="h-2 w-2 rounded-full bg-[#7bd0ff]"></div>
          </div>
        </div>
        <p className="mt-6 text-[10px] text-[#c3c5d7] tracking-[0.25em] uppercase animate-pulse">
          Validating Security Session...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#11131b] text-[#e2e1ed] flex flex-col relative overflow-hidden selection:bg-[#7bd0ff]/30 selection:text-[#7bd0ff]">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#1a56db]/10 via-[#7bd0ff]/5 to-transparent pointer-events-none select-none"></div>
        <div className="absolute -top-[200px] left-[10%] w-[500px] h-[500px] rounded-full bg-[#1a56db]/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] rounded-full bg-[#7bd0ff]/5 blur-[100px] pointer-events-none"></div>

        {/* Content Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          <div className="w-full max-w-md bg-[#1d1f27]/60 border border-[#434654]/50 p-8 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col items-center text-center animate-fade-in">
            {/* Logo Icon */}
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#1a56db] to-[#7bd0ff] flex items-center justify-center shadow-xl shadow-[#7bd0ff]/10 mb-6">
              <svg className="h-8 w-8 text-[#11131b] font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>

            {/* Header Text */}
            <h1 className="text-2xl font-extrabold tracking-tight text-[#e2e1ed]">
              EXPENSE SCANNER
            </h1>
            <p className="text-[10px] font-mono mt-1.5 px-3 py-1 rounded-full bg-[#191b23] border border-[#434654]/80 text-[#7bd0ff] font-semibold tracking-wider uppercase">
              Vision OCR Agent Platform
            </p>

            <p className="text-[#c3c5d7] text-sm mt-6 leading-relaxed max-w-sm">
              Please sign in to access your scanned receipts, manage expenses, and view interactive spending dashboards.
            </p>

            {/* Google Sign In Button */}
            <button
              onClick={() => signIn("google")}
              className="mt-8 w-full flex items-center justify-center space-x-3 bg-[#e2e1ed] hover:bg-white text-[#11131b] font-semibold py-3 px-4 rounded-xl shadow-lg shadow-[#11131b]/40 hover:scale-[1.01] active:scale-[0.99] transition duration-200 cursor-pointer"
            >
              {/* Google SVG Icon */}
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.09-5.142 4.09-3.395 0-6.148-2.753-6.148-6.148 0-3.395 2.753-6.148 6.148-6.148 1.542 0 2.946.568 4.032 1.503L21.16 3.7c-2.38-2.22-5.46-3.585-8.92-3.585C5.485.115 0 5.6 0 12.36s5.485 12.245 12.24 12.245c6.915 0 12.3-4.86 12.3-12.3 0-.665-.075-1.305-.2-2.02H12.24z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Subtext info */}
            <span className="text-[10px] text-[#c3c5d7]/40 font-mono mt-8 uppercase tracking-widest">
              Secure Unified OAuth 2.0 Identity
            </span>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-[#1d1f27] bg-[#11131b]/20 py-5 text-center text-xs text-[#c3c5d7]/50 font-mono relative z-10">
          <p>Expense Scanner Agent Setup • Local host.docker.internal Gateway</p>
        </footer>
      </div>
    );
  }

  return <>{children}</>;
}
