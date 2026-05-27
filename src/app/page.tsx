"use client";

import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import ProgressTracker from "@/components/ProgressTracker";
import ReceiptResult from "@/components/ReceiptResult";
import AppLayout from "@/components/AppLayout";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
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
    <AppLayout>
      <div className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto space-y-6">
        {/* Error Alert Box */}
        {error && (
          <div className="w-full max-w-2xl mx-auto p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 flex items-start space-x-3 text-sm animate-shake z-10">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-xs">Processing Failed</p>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400 transition text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Dynamic Workflow Views */}
        {step === "upload" && (
          <div className="space-y-8 text-center py-8 z-10">
            <div className="space-y-2 max-w-lg mx-auto">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                Scan Receipts Offline with Vision LLM
              </h1>
              <p className="text-slate-400 text-xs leading-relaxed">
                Upload expense receipts, bills, or invoices. Our local multimodal agent will perform OCR and extract structured line items completely offline.
              </p>
            </div>
            
            <UploadZone
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        )}

        {step === "processing" && (
          <div className="space-y-8 py-8 z-10">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-slate-200 flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 text-cyan-400 animate-spin" />
                <span>Processing Your Receipt</span>
              </h2>
              <p className="text-slate-400 text-[10px] font-mono">Connecting to local worker stream...</p>
            </div>
            
            <ProgressTracker
              jobId={jobId}
              onComplete={handleProcessingComplete}
              onFailure={handleProcessingFailure}
            />
          </div>
        )}

        {step === "result" && (
          <div className="z-10">
            <ReceiptResult
              receiptId={receiptId}
              imageUrl={previewUrl}
              onReset={handleReset}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
