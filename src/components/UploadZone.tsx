"use client";

import React, { useState, useRef } from "react";
import { computeFileHash } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface UploadZoneProps {
  onUploadSuccess: (jobId: string, receiptId: string, imageUrl: string) => void;
  onUploadError: (error: string) => void;
}

export default function UploadZone({ onUploadSuccess, onUploadError }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "hashing" | "requesting-url" | "uploading-s3" | "ingesting">("idle");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Currency prompt states
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("auto");
  const [customCurrency, setCustomCurrency] = useState<string>("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDragDropFile = async (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      onUploadError("Invalid file type. Please upload a JPEG, PNG, WEBP image or PDF.");
      return;
    }
    setPendingFile(file);
    setSelectedCurrency("auto");
    setCustomCurrency("");
    setShowCurrencyModal(true);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleDragDropFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleDragDropFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleStartProcessing = () => {
    if (!pendingFile) return;
    setShowCurrencyModal(false);
    const currency = selectedCurrency === "custom" 
      ? customCurrency.toUpperCase() 
      : (selectedCurrency === "auto" ? undefined : selectedCurrency);
    processFile(pendingFile, currency);
  };

  const processFile = async (file: File, currency?: string) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      onUploadError("Invalid file type. Please upload a JPEG, PNG, WEBP image or PDF.");
      return;
    }

    try {
      // Step 1: Compute Hash
      setStatus("hashing");
      setProgress(20);
      const fileHash = await computeFileHash(file);

      // Step 2: Get Presigned URL from Backend
      setStatus("requesting-url");
      setProgress(40);
      const urlResponse = await fetchWithAuth(`/api/v1/receipts/upload-url?filename=${encodeURIComponent(file.name)}`);
      if (!urlResponse.ok) {
        throw new Error("Failed to get presigned upload URL from backend.");
      }
      
      const uploadDetails = await urlResponse.json();
      const { url: uploadUrl, method = "POST", fields = {}, object_key } = uploadDetails;

      // Step 3: Direct Upload to S3/MinIO or R2
      setStatus("uploading-s3");
      setProgress(60);
      
      let s3Response;
      if (method === "PUT") {
        // Production Cloudflare R2 raw binary PUT upload
        s3Response = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        });
      } else {
        // Local Dev MinIO multipart form-data upload
        const formData = new FormData();
        Object.entries(fields).forEach(([key, val]) => {
          formData.append(key, val as string);
        });
        formData.append("file", file);

        s3Response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });
      }

      if (!s3Response.ok) {
        throw new Error("Failed to upload receipt directly to storage.");
      }

      // Step 4: Notify FastAPI backend (Ingest Receipt)
      setStatus("ingesting");
      setProgress(85);

      const ingestResponse = await fetchWithAuth("/api/v1/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          object_key: object_key,
          file_hash: fileHash,
          currency: currency,
        }),
      });

      if (!ingestResponse.ok) {
        throw new Error("Failed to initiate receipt parsing task.");
      }

      const result = await ingestResponse.json();
      setProgress(100);
      setStatus("idle");

      // Generate a local object URL for instant preview on the client side
      const previewUrl = URL.createObjectURL(file);
      
      // If the backend returned cached results immediately (idempotency match)
      if (result.status === "completed") {
        // Trigger a fake completed job so the UI shows results immediately
        onUploadSuccess("cached", result.receipt_id, previewUrl);
      } else {
        // Normal path: stream SSE logs using the returned Celery job_id
        onUploadSuccess(result.job_id, result.receipt_id, previewUrl);
      }

    } catch (err) {
      setStatus("idle");
      setProgress(0);
      onUploadError(err instanceof Error ? err.message : "An unexpected error occurred during upload.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative overflow-hidden cursor-pointer group rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 backdrop-blur-md ${
          isDragging
            ? "border-primary bg-primary/10 shadow-[0_0_25px_rgba(26,86,219,0.15)] scale-102"
            : "border-border bg-card hover:border-muted-foreground/45 hover:bg-muted/10"
        } ${status !== "idle" ? "pointer-events-none" : ""}`}
      >
        {/* Decorative Grid Effect */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Glow Element */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/30 to-secondary/30 opacity-0 blur transition duration-500 group-hover:opacity-10 group-hover:duration-200"></div>

        <div className="relative space-y-6">
          {status === "idle" ? (
            <>
              {/* Cloud Upload Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border text-primary group-hover:scale-110 group-hover:text-primary/80 transition-all duration-300">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>

              <div className="space-y-2">
                <p className="text-xl font-medium text-foreground">
                  Drag and drop your receipt image here
                </p>
                <p className="text-sm text-muted-foreground">
                  or <span className="text-primary font-semibold group-hover:text-primary/80 underline">browse your files</span>
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  Supports JPEG, PNG, WEBP, and PDF (up to 10MB)
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-6 py-4">
              {/* Spinner */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {status === "hashing" && "Analyzing file integrity..."}
                  {status === "requesting-url" && "Requesting upload credentials..."}
                  {status === "uploading-s3" && "Uploading directly to S3..."}
                  {status === "ingesting" && "Triggering backend parser..."}
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  {status === "hashing" && "Generating SHA-256 fingerprint"}
                  {status === "requesting-url" && "Resolving secure token"}
                  {status === "uploading-s3" && "Transmitting payload"}
                  {status === "ingesting" && "Registering process ID"}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showCurrencyModal} onOpenChange={setShowCurrencyModal}>
        <DialogContent className="bg-card border-border text-foreground rounded-2xl max-w-sm p-6 shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-bold">Specify Currency</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              If the receipt does not print a currency symbol, or you wish to override it, select a currency below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "auto", label: "Auto-detect" },
                { value: "USD", label: "USD ($)" },
                { value: "INR", label: "INR (₹)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
                { value: "custom", label: "Other..." },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedCurrency(opt.value)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition duration-200 text-center ${
                    selectedCurrency === opt.value
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(26,86,219,0.1)]"
                      : "border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {selectedCurrency === "custom" && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  3-Letter Code (e.g. CAD, JPY)
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={customCurrency}
                  onChange={(e) => setCustomCurrency(e.target.value.substring(0, 3))}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-primary text-foreground"
                  placeholder="JPY"
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 flex flex-row gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowCurrencyModal(false)}
              className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-foreground rounded-xl text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedCurrency === "custom" && customCurrency.length !== 3}
              onClick={handleStartProcessing}
              className="px-4 py-2 bg-primary hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-xl text-xs font-bold shadow-md transition"
            >
              Start Parsing
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
