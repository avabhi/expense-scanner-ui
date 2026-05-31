"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useCategoriesQuery } from "@/features/categories/hooks";
import { CATEGORY_COLORS } from "@/features/categories/constants";
import type { ReceiptRef } from "@/features/receipts/types";
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
  const { data: summaries = [], isLoading, error } = useCategoriesQuery();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { theme } = useTheme();

  const totalSpent = useMemo(() => summaries.reduce((s, c) => s + c.total_spent, 0), [summaries]);

  // Chart.js data
  const chartData: ChartData<"doughnut"> = {
    labels: summaries.map((c) => c.category),
    datasets: [
      {
        data: summaries.map((c) => c.total_spent),
        backgroundColor: summaries.map(
          (c) => CATEGORY_COLORS[c.category]?.chart ?? "rgba(148,163,184,0.85)"
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

        {isLoading && (
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
            <span className="text-sm font-semibold">{error.message}</span>
          </div>
        )}

        {!isLoading && !error && summaries.length === 0 && (
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

        {!isLoading && !error && summaries.length > 0 && (
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
                  const colors = CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS["Other"];
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
                const colors = CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS["Other"];
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
