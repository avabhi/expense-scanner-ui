"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { fetchWithAuth } from "@/lib/auth";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

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
  "Food & Dining":      { chart: "rgba(251,146,60,0.85)",  bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", dot: "bg-orange-400" },
  "Groceries":          { chart: "rgba(74,222,128,0.85)",  bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/30",  dot: "bg-green-400"  },
  "Transport":          { chart: "rgba(96,165,250,0.85)",  bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/30",   dot: "bg-blue-400"   },
  "Health & Pharmacy":  { chart: "rgba(248,113,113,0.85)", bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/30",    dot: "bg-red-400"    },
  "Electronics & Tech": { chart: "rgba(34,211,238,0.85)",  bg: "bg-cyan-500/10",   text: "text-cyan-400",   border: "border-cyan-500/30",   dot: "bg-cyan-400"   },
  "Clothing & Apparel": { chart: "rgba(192,132,252,0.85)", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30", dot: "bg-purple-400" },
  "Entertainment":      { chart: "rgba(244,114,182,0.85)", bg: "bg-pink-500/10",   text: "text-pink-400",   border: "border-pink-500/30",   dot: "bg-pink-400"   },
  "Utilities & Bills":  { chart: "rgba(250,204,21,0.85)",  bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30", dot: "bg-yellow-400" },
  "Personal Care":      { chart: "rgba(251,113,133,0.85)", bg: "bg-rose-500/10",   text: "text-rose-400",   border: "border-rose-500/30",   dot: "bg-rose-400"   },
  "Other":              { chart: "rgba(148,163,184,0.85)", bg: "bg-slate-500/10",  text: "text-slate-400",  border: "border-slate-500/30",  dot: "bg-slate-400"  },
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
  const { data: session } = useSession();
  const [summaries, setSummaries] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchWithAuth("/api/v1/categories/summary");
        if (!res.ok) throw new Error("Failed to load category data.");
        const json: CategorySummary[] = await res.json();
        setSummaries(json);
      } catch (e: any) {
        setError(e.message);
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
        borderColor: "rgba(15,23,42,0.8)",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15,23,42,0.95)",
        titleColor: "#e2e8f0",
        bodyColor: "#94a3b8",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx: any) => {
            const pct = totalSpent > 0 ? ((ctx.parsed / totalSpent) * 100).toFixed(1) : "0";
            return `  ${ctx.parsed.toFixed(2)}  (${pct}%)`;
          },
        },
      },
    },
  };

  const toggleExpand = (cat: string) =>
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background gradient */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-cyan-900/10 via-blue-950/5 to-transparent pointer-events-none select-none" />

      {/* Header */}
      <header className="relative border-b border-slate-900 bg-slate-950/60 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
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
          <nav className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <Link href="/" className="text-slate-400 hover:text-slate-100 transition">
              ← Upload
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-semibold">Categories</span>

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
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 z-10 space-y-10">
        {/* Page title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-cyan-400 bg-clip-text text-transparent">
            Spending by Category
          </h1>
          <p className="text-slate-400 text-sm">
            AI-assigned breakdown across all your scanned receipts. Click any category to see which bills it came from.
          </p>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 animate-spin" />
            </div>
            <p className="text-slate-500 font-mono text-sm">Loading category data...</p>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-xl border border-red-500/20 bg-red-950/10 text-center space-y-3">
            <p className="text-red-400 font-semibold">Failed to load categories</p>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && summaries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl">
              🧾
            </div>
            <h3 className="text-lg font-semibold text-slate-300">No categorized receipts yet</h3>
            <p className="text-slate-500 text-sm max-w-sm">
              Upload and process a receipt first. Once the AI parses it, your spending categories will appear here.
            </p>
            <Link
              href="/"
              className="mt-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition"
            >
              Upload a Receipt
            </Link>
          </div>
        )}

        {!loading && !error && summaries.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left: Donut Chart */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-md p-8 flex flex-col items-center justify-center space-y-8">
              <div className="relative w-full max-w-[280px] h-[280px]">
                <Doughnut data={chartData} options={chartOptions as any} />
                {/* Centre label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Total Spent</p>
                  <p className="text-2xl font-black text-cyan-400 mt-1">
                    {totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Custom legend */}
              <div className="w-full space-y-2">
                {summaries.map((c) => {
                  const colors = CATEGORY_PALETTE[c.category] ?? CATEGORY_PALETTE["Other"];
                  const pct = totalSpent > 0 ? ((c.total_spent / totalSpent) * 100).toFixed(1) : "0";
                  return (
                    <div key={c.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                        <span className="text-slate-300 truncate max-w-[150px]">{c.category}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-slate-500">{pct}%</span>
                        <span className={`font-semibold ${colors.text}`}>{c.total_spent.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Drill-down list */}
            <div className="lg:col-span-7 space-y-4">
              {summaries.map((c) => {
                const colors = CATEGORY_PALETTE[c.category] ?? CATEGORY_PALETTE["Other"];
                const isOpen = !!expanded[c.category];
                const pct = totalSpent > 0 ? ((c.total_spent / totalSpent) * 100).toFixed(1) : "0";

                return (
                  <div
                    key={c.category}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${colors.border} ${colors.bg}`}
                  >
                    {/* Category row header */}
                    <button
                      onClick={() => toggleExpand(c.category)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colors.dot}`} />
                        <span className={`font-bold text-sm ${colors.text}`}>{c.category}</span>
                        <span className="text-xs text-slate-500 font-mono">{c.item_count} items · {c.receipts.length} receipts</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-base font-black ${colors.text}`}>{c.total_spent.toFixed(2)}</p>
                          <p className="text-xs text-slate-500 font-mono">{pct}% of total</p>
                        </div>
                        <svg
                          className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded: linked receipts */}
                    {isOpen && (
                      <div className="border-t border-white/5 divide-y divide-white/5">
                        {c.receipts.map((r) => (
                          <Link
                            key={r.receipt_id}
                            href="/"
                            className="flex items-center justify-between px-6 py-3.5 hover:bg-white/5 transition group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-center text-sm">
                                🧾
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition">
                                  {r.merchant_name || "Unknown Merchant"}
                                </p>
                                <p className="text-xs text-slate-500 font-mono">
                                  {r.date ? new Date(r.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Date unknown"}
                                  <span className="ml-2 text-slate-600">#{r.receipt_id.slice(0, 8)}</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-200">
                                {getCurrencySymbol(r.currency)}{r.total_amount?.toFixed(2) ?? "—"}
                              </p>
                              <p className="text-xs text-slate-600 group-hover:text-slate-400 transition">View receipt →</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-center text-xs text-slate-600 font-mono">
        <p>Expense Scanner Agent • AI Category Classification</p>
      </footer>
    </div>
  );
}
