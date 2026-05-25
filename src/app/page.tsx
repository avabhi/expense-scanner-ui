"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import UploadZone from "@/components/UploadZone";
import ProgressTracker from "@/components/ProgressTracker";
import ReceiptResult from "@/components/ReceiptResult";

export default function Home() {
  const { data: session } = useSession();
  const [step, setStep] = useState<"upload" | "processing" | "result">("upload");
  const [jobId, setJobId] = useState<string>("");
  const [receiptId, setReceiptId] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = (job: string, recId: string, url: string) => {
    setJobId(job);
    setReceiptId(recId);
    setPreviewUrl(url);
    setError(null);
    
    if (job === "cached") {
      setStep("result");
    } else {
      setStep("processing");
    }
  };

  const handleUploadError = (errMsg: string) => {
    setError(errMsg);
    setStep("upload");
  };

  const handleProcessingComplete = () => {
    setStep("result");
  };

  const handleProcessingFailure = (errMsg: string) => {
    setError(errMsg);
    setStep("upload");
  };

  const handleReset = () => {
    setStep("upload");
    setJobId("");
    setReceiptId("");
    setPreviewUrl("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-cyan-900/10 via-blue-950/5 to-transparent pointer-events-none select-none"></div>
      
      {/* Top Banner/Header */}
      <header className="relative border-b border-slate-900 bg-slate-950/60 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo Icon */}
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="h-5 w-5 text-slate-950 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-slate-100">EXPENSE SCANNER</span>
              <span className="ml-2.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-semibold">
                OLLAMA AGENT
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
            <Link
              href="/categories"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-cyan-500/40 hover:text-cyan-400 transition duration-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Categories</span>
            </Link>

            {session?.user && (
              <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 pl-3 pr-1 py-1 rounded-xl">
                <span className="text-slate-300 font-semibold text-[11px] max-w-[100px] truncate">
                  {session.user.name || session.user.email}
                </span>
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt="User avatar"
                    className="h-6 w-6 rounded-full border border-slate-700"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-[10px] text-cyan-400 font-bold">
                    {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-2.5 py-1 rounded bg-red-950/30 hover:bg-red-950/60 border border-red-900/30 hover:border-red-900/60 text-[10px] font-bold text-red-400 transition cursor-pointer"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            )}

            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span>Worker: connected</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col justify-center z-10">
        
        {/* Error Alert Box */}
        {error && (
          <div className="w-full max-w-2xl mx-auto mb-6 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 flex items-start space-x-3 text-sm animate-shake">
            <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold">Processing Failed</p>
              <p className="text-slate-400 text-xs mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400 transition">
              ✕
            </button>
          </div>
        )}

        {/* Dynamic Workflow Views */}
        {step === "upload" && (
          <div className="space-y-8 text-center py-8">
            <div className="space-y-3 max-w-lg mx-auto">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                Scan Receipts Offline with Vision LLM
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload expense receipts, bills, or invoices. Our local multimodal agent (`qwen2.5-vl:7b`) will perform OCR and extract structured line items completely offline.
              </p>
            </div>
            
            <UploadZone
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        )}

        {step === "processing" && (
          <div className="space-y-8 py-8">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-200">Processing Your Receipt</h2>
              <p className="text-slate-400 text-xs font-mono">Connecting to local worker stream...</p>
            </div>
            
            <ProgressTracker
              jobId={jobId}
              onComplete={handleProcessingComplete}
              onFailure={handleProcessingFailure}
            />
          </div>
        )}

        {step === "result" && (
          <ReceiptResult
            receiptId={receiptId}
            imageUrl={previewUrl}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-center text-xs text-slate-600 font-mono">
        <p>Expense Scanner Agent Setup • Local host.docker.internal Gateway</p>
      </footer>
    </div>
  );
}
