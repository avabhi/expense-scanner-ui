"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { AlertCircle, ChevronDown } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ReceiptRef {
  receipt_id: string;
  merchant_name: string | null;
  date: string | null;
  total_amount: number | null;
  currency: string | null;
}

interface CategorySummary {
  category: string;
  total_spent: number;
  item_count: number;
  receipts: ReceiptRef[];
}

// Colour palette aligned with ReceiptResult badges
const CATEGORY_PALETTE: Record<string, { chart: string; bg: string; text: string; border: string; dot: string }> = {
  "Food & Dining":      { chart: "rgba(251,146,60,0.85)",  bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/30", dot: "bg-orange-500 dark:bg-orange-400" },
  "Groceries":          { chart: "rgba(74,222,128,0.85)",  bg: "bg-green-500/10",  text: "text-green-600 dark:text-green-400",  border: "border-green-500/30",  dot: "bg-green-500 dark:bg-green-400"  },
  "Transport":          { chart: "rgba(96,165,250,0.85)",  bg: "bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400",   border: "border-blue-500/30",   dot: "bg-blue-500 dark:bg-blue-400"   },
  "Health & Pharmacy":  { chart: "rgba(248,113,113,0.85)", bg: "bg-red-500/10",    text: "text-red-600 dark:text-red-400",    border: "border-red-500/30",    dot: "bg-red-500 dark:bg-red-400"    },
  "Electronics & Tech": { chart: "rgba(34,211,238,0.85)",  bg: "bg-cyan-500/10",   text: "text-cyan-600 dark:text-cyan-400",   border: "border-cyan-500/30",   dot: "bg-cyan-500 dark:bg-cyan-400"   },
  "Clothing & Apparel": { chart: "rgba(192,132,252,0.85)", bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/30", dot: "bg-purple-500 dark:bg-purple-400" },
  "Entertainment":      { chart: "rgba(244,114,182,0.85)", bg: "bg-pink-500/10",   text: "text-pink-600 dark:text-pink-400",   border: "border-pink-500/30",   dot: "bg-pink-500 dark:bg-pink-400"   },
  "Utilities & Bills":  { chart: "rgba(250,204,21,0.85)",  bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500/30", dot: "bg-yellow-500 dark:bg-yellow-400" },
  "Personal Care":      { chart: "rgba(251,113,133,0.85)", bg: "bg-rose-500/10",   text: "text-rose-600 dark:text-rose-400",   border: "border-rose-500/30",   dot: "bg-rose-500 dark:bg-rose-400"   },
  "Other":              { chart: "rgba(148,163,184,0.85)", bg: "bg-slate-500/10",  text: "text-slate-600 dark:text-slate-400",  border: "border-slate-500/30",  dot: "bg-slate-500 dark:bg-slate-400"  },
};

function getCurrencySymbol(code: string | null) {
  if (!code) return "$";
  switch (code.toUpperCase()) {
    case "USD": return "$";
    case "EUR": return "€";
    case "GBP": return "£";
    case "INR": return "₹";
    default: return code + " ";
  }
}

export default function CategoriesPage() {
  const [summaries, setSummaries] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { theme } = useTheme();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchWithAuth("/api/v1/categories/summary");
        if (!res.ok) throw new Error("Failed to load category data.");
        const json: CategorySummary[] = await res.json();
        setSummaries(json);
      } catch (e) {
        const err = e as Error;
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalSpent = summaries.reduce((s, c) => s + c.total_spent, 0);

  // Chart.js data
  const chartData: ChartData<"doughnut"> = {
    labels: summaries.map((c) => c.category),
    datasets: [
      {
        data: summaries.map((c) => c.total_spent),
        backgroundColor: summaries.map(
          (c) => CATEGORY_PALETTE[c.category]?.chart ?? "rgba(148,163,184,0.85)"
        ),
        borderColor: theme === "dark" ? "#1d1f27" : "#ffffff",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === "dark" ? "rgba(29,31,39,0.95)" : "rgba(255,255,255,0.95)",
        titleColor: theme === "dark" ? "#e2e1ed" : "#191c1d",
        bodyColor: theme === "dark" ? "#c3c5d7" : "#434654",
        borderColor: "rgba(148,163,184,0.15)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const pct = totalSpent > 0 ? ((ctx.parsed / totalSpent) * 100).toFixed(1) : "0";
            return `  $${ctx.parsed.toFixed(2)}  (${pct}%)`;
          },
        },
      },
    },
  };

  const toggleExpand = (cat: string) =>
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            Spending by Category
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-assigned breakdown across all your scanned receipts. Click any category to see its details.
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
            </div>
            <p className="text-muted-foreground font-mono text-xs animate-pulse">Loading category summary data...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-center flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {!loading && !error && summaries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl shadow-xl">
              🧾
            </div>
            <h3 className="text-base font-bold text-foreground">No categorized receipts yet</h3>
            <p className="text-muted-foreground text-xs max-w-xs leading-relaxed">
              Upload and process a receipt first. Once the AI parses it, your spending categories will appear here.
            </p>
            <Button
              onClick={() => window.location.href = "/"}
              className="mt-2 bg-primary text-primary-foreground font-bold py-2 px-5 rounded-xl cursor-pointer"
            >
              Upload a Receipt
            </Button>
          </div>
        )}

        {!loading && !error && summaries.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Donut Chart */}
            <Card className="lg:col-span-5 bg-card border-border backdrop-blur-xl p-6 flex flex-col items-center justify-center space-y-6">
              <div className="relative w-full max-w-[240px] h-[240px] flex items-center justify-center">
                <Doughnut data={chartData} options={chartOptions} />
                {/* Centre label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Total Spent</p>
                  <p className="text-2xl font-black text-primary font-mono mt-0.5">
                    ${totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Custom legend */}
              <div className="w-full space-y-2 text-xs">
                {summaries.map((c) => {
                  const colors = CATEGORY_PALETTE[c.category] ?? CATEGORY_PALETTE["Other"];
                  const pct = totalSpent > 0 ? ((c.total_spent / totalSpent) * 100).toFixed(1) : "0";
                  return (
                    <div key={c.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                        <span className="text-foreground/80 truncate max-w-[150px]">{c.category}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-muted-foreground">{pct}%</span>
                        <span className={`font-semibold ${colors.text}`}>${c.total_spent.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Right: Drill-down list */}
            <div className="lg:col-span-7 space-y-3">
              {summaries.map((c) => {
                const colors = CATEGORY_PALETTE[c.category] ?? CATEGORY_PALETTE["Other"];
                const isOpen = !!expanded[c.category];
                const pct = totalSpent > 0 ? ((c.total_spent / totalSpent) * 100).toFixed(1) : "0";

                return (
                  <Card
                    key={c.category}
                    className={`transition-all duration-200 border bg-card hover:bg-muted/5 ${colors.border}`}
                  >
                    {/* Category row header */}
                    <button
                      onClick={() => toggleExpand(c.category)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colors.dot}`} />
                        <div>
                          <p className="font-bold text-sm text-foreground leading-tight">{c.category}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-1">
                            {c.item_count} items · {c.receipts.length} receipts
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm font-black font-mono text-foreground`}>${c.total_spent.toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{pct}% of total</p>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded: linked receipts */}
                    {isOpen && (
                      <div className="border-t border-border divide-y divide-border bg-muted/10">
                        {c.receipts.map((r) => (
                          <Link
                            key={r.receipt_id}
                            href="/history"
                            className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-muted border border-border/80 flex items-center justify-center text-sm shadow-sm text-muted-foreground">
                                🧾
                              </div>
                              <div>
                                <p className="text-xs font-bold text-foreground/90 group-hover:text-foreground transition">
                                  {r.merchant_name || "Unknown Merchant"}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                  {r.date
                                    ? new Date(r.date).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "Date unknown"}{" "}
                                  · <span className="text-muted-foreground/60">#{r.receipt_id.slice(0, 8)}</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-foreground font-mono">
                                {getCurrencySymbol(r.currency)}
                                {r.total_amount?.toFixed(2) ?? "—"}
                              </p>
                              <p className="text-[10px] text-primary/80 group-hover:text-primary transition mt-0.5">
                                View details →
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
