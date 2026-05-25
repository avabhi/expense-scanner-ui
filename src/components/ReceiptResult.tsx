"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/auth";

interface LineItem {
  id: number;
  description: string;
  price: number;
  category: string | null;
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

// Color map for each category
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "Food & Dining":      { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", dot: "bg-orange-400" },
  "Groceries":          { bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/30",  dot: "bg-green-400"  },
  "Transport":          { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/30",   dot: "bg-blue-400"   },
  "Health & Pharmacy":  { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/30",    dot: "bg-red-400"    },
  "Electronics & Tech": { bg: "bg-cyan-500/10",   text: "text-cyan-400",   border: "border-cyan-500/30",   dot: "bg-cyan-400"   },
  "Clothing & Apparel": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", dot: "bg-purple-400" },
  "Entertainment":      { bg: "bg-pink-500/10",   text: "text-pink-400",   border: "border-pink-500/30",   dot: "bg-pink-400"   },
  "Utilities & Bills":  { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30", dot: "bg-yellow-400" },
  "Personal Care":      { bg: "bg-rose-500/10",   text: "text-rose-400",   border: "border-rose-500/30",   dot: "bg-rose-400"   },
  "Other":              { bg: "bg-slate-500/10",  text: "text-slate-400",  border: "border-slate-500/30",  dot: "bg-slate-400"  },
};

function CategoryBadge({ category }: { category: string | null }) {
  const cat = category || "Other";
  const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS["Other"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap
        ${colors.bg} ${colors.text} ${colors.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {cat}
    </span>
  );
}

export default function ReceiptResult({ receiptId, imageUrl, onReset }: ReceiptResultProps) {
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReceiptData() {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`/api/v1/receipts/${receiptId}`);
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

  const getCurrencySymbol = (code: string | null) => {
    if (!code) return "$";
    switch (code.toUpperCase()) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "INR": return "₹";
      default: return code + " ";
    }
  };

  // Summarise spending by category for this receipt
  const categoryTotals: Record<string, number> = {};
  data.line_items.forEach((item) => {
    const cat = item.category || "Other";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + item.price;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Scan Results</h2>
          <p className="text-xs text-slate-500 font-mono">Receipt ID: {data.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/categories"
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition duration-200"
          >
            <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>View Categories</span>
          </Link>
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-cyan-500/10 transition duration-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v12" />
            </svg>
            <span>Scan Another</span>
          </button>
        </div>
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
        <div className="lg:col-span-7 space-y-5">
          {/* Main Stats Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Merchant</p>
                <p className="text-lg font-bold text-slate-100 truncate">{data.merchant_name || "Unknown"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Date</p>
                <p className="text-lg font-bold text-slate-100">
                  {data.date ? new Date(data.date).toLocaleDateString() : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Total</p>
                <p className="text-xl font-black text-cyan-400">
                  {getCurrencySymbol(data.currency)}
                  {data.total_amount !== null ? data.total_amount.toFixed(2) : "0.00"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Currency</p>
                <p className="text-lg font-bold text-slate-100 uppercase">{data.currency || "USD"}</p>
              </div>
            </div>
          </div>

          {/* Category Summary for this receipt */}
          {Object.keys(categoryTotals).length > 0 && (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-md space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Category Breakdown</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryTotals)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, total]) => {
                    const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS["Other"];
                    return (
                      <div
                        key={cat}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${colors.bg} ${colors.border}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <span className={`text-xs font-semibold ${colors.text}`}>{cat}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {getCurrencySymbol(data.currency)}{total.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-900 bg-slate-900/30 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">Line Items</h3>
              <span className="px-2 py-0.5 text-xs rounded bg-slate-800 border border-slate-700 text-slate-400">
                {data.line_items.length} items
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-xs text-slate-500 font-semibold bg-slate-950/20 select-none">
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-sm">
                  {data.line_items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500 italic">
                        No line items parsed.
                      </td>
                    </tr>
                  ) : (
                    data.line_items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/20 transition text-slate-200">
                        <td className="px-6 py-3.5 font-medium">{item.description}</td>
                        <td className="px-6 py-3.5">
                          <CategoryBadge category={item.category} />
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono font-bold text-cyan-500">
                          {getCurrencySymbol(data.currency)}{item.price.toFixed(2)}
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
