"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

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

// Color map for each category with high-contrast text for both modes
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "Food & Dining":      { bg: "bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", border: "border-orange-500/20", dot: "bg-orange-600 dark:bg-orange-400" },
  "Groceries":          { bg: "bg-green-500/10",  text: "text-green-700 dark:text-green-400",  border: "border-green-500/20",  dot: "bg-green-600 dark:bg-green-400"  },
  "Transport":          { bg: "bg-blue-500/10",   text: "text-blue-700 dark:text-blue-400",   border: "border-blue-500/20",   dot: "bg-blue-600 dark:bg-blue-400"   },
  "Health & Pharmacy":  { bg: "bg-red-500/10",    text: "text-red-700 dark:text-red-400",    border: "border-red-500/20",    dot: "bg-red-600 dark:bg-red-400"    },
  "Electronics & Tech": { bg: "bg-cyan-500/10",   text: "text-cyan-700 dark:text-cyan-400",   border: "border-cyan-500/20",   dot: "bg-cyan-600 dark:bg-cyan-400"   },
  "Clothing & Apparel": { bg: "bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", border: "border-purple-500/20", dot: "bg-purple-600 dark:bg-purple-400" },
  "Entertainment":      { bg: "bg-pink-500/10",   text: "text-pink-700 dark:text-pink-400",   border: "border-pink-500/20",   dot: "bg-pink-600 dark:bg-pink-400"   },
  "Utilities & Bills":  { bg: "bg-yellow-500/10", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-500/20", dot: "bg-yellow-600 dark:bg-yellow-400" },
  "Personal Care":      { bg: "bg-rose-500/10",   text: "text-rose-700 dark:text-rose-400",   border: "border-rose-500/20",   dot: "bg-rose-600 dark:bg-rose-400"   },
  "Other":              { bg: "bg-slate-500/10",  text: "text-slate-700 dark:text-slate-400",  border: "border-slate-500/20",  dot: "bg-slate-600 dark:bg-slate-400"  },
};

function CategoryBadge({ category }: { category: string | null }) {
  const cat = category || "Other";
  const colors = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS["Other"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide whitespace-nowrap
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred while loading receipt details.");
      } finally {
        setLoading(false);
      }
    }

    fetchReceiptData();
  }, [receiptId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center justify-center space-y-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
        <p className="text-muted-foreground font-mono text-xs">Fetching receipt details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center space-y-4">
        <div className="text-red-500 flex justify-center"><AlertTriangle className="h-10 w-10" /></div>
        <h3 className="text-base font-bold text-foreground">Error Loading Details</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{error || "Could not retrieve parsed data."}</p>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition"
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
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">Scan Results</h2>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Receipt ID: {data.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/categories"
            className="flex items-center space-x-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-foreground border border-border rounded-xl text-xs font-bold transition duration-200"
          >
            <span>View Categories</span>
          </Link>
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-bold shadow-md transition duration-200"
          >
            <span>Scan Another</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Preview */}
        <Card className="lg:col-span-5 bg-card border-border p-4 flex flex-col items-center justify-center">
          <p className="text-[10px] text-muted-foreground mb-3 uppercase tracking-wider font-bold font-mono">Original Document</p>
          <div className="relative w-full max-h-[500px] overflow-auto rounded-xl bg-muted/30 border border-border/50 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Receipt Preview"
              className="max-w-full h-auto object-contain max-h-[480px]"
            />
          </div>
        </Card>

        {/* Right Column: Parsed Data */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Stats Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Merchant</p>
                  <p className="text-sm font-bold text-foreground truncate">{data.merchant_name || "Unknown"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date</p>
                  <p className="text-sm font-bold text-foreground">
                    {data.date ? new Date(data.date).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</p>
                  <p className="text-base font-black text-primary font-mono">
                    {getCurrencySymbol(data.currency)}
                    {data.total_amount !== null ? data.total_amount.toFixed(2) : "0.00"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Currency</p>
                  <p className="text-sm font-bold text-foreground uppercase">{data.currency || "USD"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Summary for this receipt */}
          {Object.keys(categoryTotals).length > 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-5 space-y-3">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Category Breakdown</h3>
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
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          <span className={`text-[11px] font-bold ${colors.text}`}>{cat}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {getCurrencySymbol(data.currency)}{total.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Line Items Table */}
          <Card className="bg-card border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/10 flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Line Items</h3>
              <Badge variant="outline" className="text-[10px] bg-muted border-border font-bold">
                {data.line_items.length} items
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20 border-b border-border">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="px-6 py-3 text-xs font-bold text-muted-foreground">Description</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-muted-foreground">Category</TableHead>
                    <TableHead className="px-6 py-3 text-xs font-bold text-muted-foreground text-right pr-6">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.line_items.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={3} className="px-6 py-8 text-center text-muted-foreground italic text-xs">
                        No line items parsed.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.line_items.map((item) => (
                      <TableRow key={item.id} className="border-border hover:bg-muted/10 text-foreground">
                        <TableCell className="px-6 py-3.5 font-semibold text-xs">{item.description}</TableCell>
                        <TableCell className="px-6 py-3.5">
                          <CategoryBadge category={item.category} />
                        </TableCell>
                        <TableCell className="px-6 py-3.5 text-right font-mono font-bold text-primary pr-6 text-xs">
                          {getCurrencySymbol(data.currency)}{item.price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
