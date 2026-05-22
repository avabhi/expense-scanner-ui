"use client";

import React, { useEffect, useState } from "react";

interface LineItem {
  id: number;
  description: string;
  price: number;
}

interface ReceiptData {
  id: string;
  merchant_name: string | null;
  date: string | null;
  total_amount: number | null;
  currency: string | null;
  status: string;
  line_items: LineItem[];
}

interface ReceiptResultProps {
  receiptId: string;
  imageUrl: string;
  onReset: () => void;
}

export default function ReceiptResult({ receiptId, imageUrl, onReset }: ReceiptResultProps) {
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReceiptData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/receipts/${receiptId}`);
        if (!response.ok) {
          throw new Error("Failed to load receipt details from database.");
        }
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while loading receipt details.");
      } finally {
        setLoading(false);
      }
    }

    fetchReceiptData();
  }, [receiptId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 flex flex-col items-center justify-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 animate-spin"></div>
        </div>
        <p className="text-slate-400 font-mono text-sm">Fetching receipt details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-xl border border-red-500/20 bg-red-950/10 text-center space-y-4">
        <div className="text-red-400 text-4xl">⚠️</div>
        <h3 className="text-lg font-semibold text-slate-200">Error Loading Details</h3>
        <p className="text-sm text-slate-400">{error || "Could not retrieve parsed data."}</p>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Helper for displaying currency symbols
  const getCurrencySymbol = (code: string | null) => {
    if (!code) return "$";
    switch (code.toUpperCase()) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "INR":
        return "₹";
      default:
        return code + " ";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Scan Results</h2>
          <p className="text-sm text-slate-400 font-mono text-xs">Receipt ID: {data.id}</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-cyan-500/10 transition duration-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
          </svg>
          <span>Scan Another Receipt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Preview */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col items-center justify-center backdrop-blur-md">
          <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold font-mono">Original Document</p>
          <div className="relative w-full max-h-[500px] overflow-auto rounded-lg bg-slate-900 border border-slate-800/50 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Receipt Preview"
              className="max-w-full h-auto object-contain max-h-[480px]"
            />
          </div>
        </div>

        {/* Right Column: Parsed Data */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Stats Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-md space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Merchant</p>
                <p className="text-lg font-bold text-slate-100 truncate">
                  {data.merchant_name || "Unknown Merchant"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Date</p>
                <p className="text-lg font-bold text-slate-100">
                  {data.date ? new Date(data.date).toLocaleDateString() : "Not specified"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Total Amount</p>
                <p className="text-xl font-black text-cyan-400">
                  {getCurrencySymbol(data.currency)}
                  {data.total_amount !== null ? data.total_amount.toFixed(2) : "0.00"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Currency</p>
                <p className="text-lg font-bold text-slate-100 uppercase">
                  {data.currency || "USD"}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-900 bg-slate-900/30 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">Line Items</h3>
              <span className="px-2 py-0.5 text-xs rounded bg-slate-800 border border-slate-700 text-slate-400">
                {data.line_items.length} items
              </span>
            </div>

            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-xs text-slate-500 font-semibold bg-slate-950/20 select-none">
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-sm">
                  {data.line_items.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-slate-500 italic">
                        No line items parsed.
                      </td>
                    </tr>
                  ) : (
                    data.line_items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/10 text-slate-200">
                        <td className="px-6 py-3.5 font-medium">{item.description}</td>
                        <td className="px-6 py-3.5 text-right font-mono font-bold text-cyan-500">
                          {getCurrencySymbol(data.currency)}
                          {item.price.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
