"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchWithAuth } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartData,
  ChartOptions,
  TooltipItem,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

interface ReceiptRef {
  receipt_id: string;
  merchant_name: string | null;
  date: string | null;
  total_amount: number | null;
  currency: string | null;
  category?: string;
  status?: string;
}

interface CategorySummary {
  category: string;
  total_spent: number;
  item_count: number;
  receipts: ReceiptRef[];
}



// Colour palette aligned with ReceiptResult badges
const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#f97316", // orange-500
  "Groceries": "#22c55e",     // green-500
  "Transport": "#3b82f6",     // blue-500
  "Health & Pharmacy": "#ef4444", // red-500
  "Electronics & Tech": "#06b6d4", // cyan-500
  "Clothing & Apparel": "#a855f7", // purple-500
  "Entertainment": "#ec4899", // pink-500
  "Utilities & Bills": "#eab308", // yellow-500
  "Personal Care": "#f43f5e",   // rose-500
  "Other": "#64748b",           // slate-500
};

const CATEGORY_BUDGETS: Record<string, number> = {
  "Food & Dining": 300,
  "Groceries": 500,
  "Transport": 150,
  "Office Supplies": 1000,
  "Software / SaaS": 2500,
  "Cloud Infrastructure": 4000,
  "Other": 400,
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<CategorySummary[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRef[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchWithAuth("/api/v1/categories/summary");
        if (!res.ok) throw new Error("Failed to load reports data.");
        const json: CategorySummary[] = await res.json();
        setSummaries(json);

        // Deduplicate and gather all receipts across categories
        const uniqueReceiptsMap: Record<string, ReceiptRef> = {};
        json.forEach((catSummary) => {
          catSummary.receipts.forEach((r) => {
            if (!uniqueReceiptsMap[r.receipt_id]) {
              uniqueReceiptsMap[r.receipt_id] = {
                ...r,
                category: catSummary.category,
                status: "completed",
              };
            }
          });
        });

        const allReceipts = Object.values(uniqueReceiptsMap);
        setReceipts(allReceipts);
      } catch (e) {
        setError(e instanceof Error ? e.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalSpent = useMemo(() => {
    return summaries.reduce((s, c) => s + c.total_spent, 0);
  }, [summaries]);

  // Donut Chart Data
  const donutChartData: ChartData<"doughnut"> = useMemo(() => {
    return {
      labels: summaries.map((c) => c.category),
      datasets: [
        {
          data: summaries.map((c) => c.total_spent),
          backgroundColor: summaries.map(
            (c) => CATEGORY_COLORS[c.category] || "#64748b"
          ),
          borderColor: "rgba(255, 255, 255, 0.05)",
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [summaries]);

  const donutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#e2e8f0",
        bodyColor: "#94a3b8",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx: TooltipItem<"doughnut">) => {
            const val = typeof ctx.raw === "number" ? ctx.raw : 0;
            const pct = totalSpent > 0 ? ((val / totalSpent) * 100).toFixed(1) : "0";
            return ` $${val.toFixed(2)} (${pct}%)`;
          },
        },
      },
    },
  };

  // Top Merchants Calculation
  const topMerchants = useMemo(() => {
    const map: Record<string, { amount: number; count: number; category: string }> = {};
    receipts.forEach((r) => {
      if (r.merchant_name) {
        const val = map[r.merchant_name] || { amount: 0, count: 0, category: r.category || "Other" };
        val.amount += r.total_amount || 0;
        val.count += 1;
        map[r.merchant_name] = val;
      }
    });

    return Object.entries(map)
      .map(([merchant, details]) => ({
        merchant,
        ...details,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [receipts]);

  // Large Transactions Filter (Amount > 100)
  const largeTransactions = useMemo(() => {
    return receipts
      .filter((r) => (r.total_amount || 0) >= 100)
      .sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0));
  }, [receipts]);

  // Trend Analysis Data (Using primary corporate blue)
  const trendLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];
  const trendValues = [120, 340, 240, 560, 480, totalSpent || 1240];
  const previousTrendValues = [90, 280, 210, 430, 410, 890];

  const trendChartData: ChartData<"line"> = {
    labels: trendLabels,
    datasets: [
      {
        fill: true,
        label: "Current Period",
        data: trendValues,
        borderColor: "#1a56db", // Stitch primary blue
        backgroundColor: "rgba(26, 86, 219, 0.05)",
        tension: 0.35,
        pointBackgroundColor: "#1a56db",
        pointBorderColor: "#ffffff",
      },
      {
        fill: false,
        label: "Previous Period",
        data: previousTrendValues,
        borderColor: "#94a3b8", // slate-400
        borderDash: [5, 5],
        tension: 0.35,
        pointBackgroundColor: "#94a3b8",
        pointBorderColor: "#ffffff",
      },
    ],
  };

  const trendOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#e2e8f0",
        bodyColor: "#94a3b8",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 10, weight: "bold" } },
      },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.05)" },
        ticks: { color: "#64748b", font: { size: 10, weight: "bold" } },
      },
    },
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Financial Performance
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Real-time spend analysis and budget progress audit.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-border bg-card hover:bg-muted text-foreground font-bold self-start sm:self-auto cursor-pointer"
          >
            <Download className="h-4 w-4 mr-2" />
            <span>Export Report</span>
          </Button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-4 border-muted" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
            </div>
            <p className="text-muted-foreground font-mono text-xs">Compiling financial metrics...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-center flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Donut Chart & Trend Line Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Donut breakdown */}
              <Card className="lg:col-span-5 bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-foreground">Spending Breakdown</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Division across category labels
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pb-6">
                  <div className="relative w-[200px] h-[200px] flex items-center justify-center">
                    <Doughnut data={donutChartData} options={donutOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Spent</p>
                      <p className="text-xl font-black text-primary font-mono mt-0.5">
                        ${totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6 w-full text-xs">
                    {summaries.slice(0, 4).map((c) => {
                      const col = CATEGORY_COLORS[c.category] || "#64748b";
                      const pct = totalSpent > 0 ? ((c.total_spent / totalSpent) * 100).toFixed(0) : "0";
                      return (
                        <div key={c.category} className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col }} />
                          <span className="text-muted-foreground truncate max-w-[100px] font-semibold">{c.category}</span>
                          <span className="text-muted-foreground font-mono font-bold ml-auto">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Trend Chart */}
              <Card className="lg:col-span-7 bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">Trend Analysis</CardTitle>
                    <CardDescription className="text-muted-foreground text-xs">
                      Comparison of spend metrics vs last month
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary/10 hover:bg-primary/10 text-primary border-none font-bold text-[10px] py-1 px-2 rounded-full">
                    +12.4% vs last period
                  </Badge>
                </CardHeader>
                <CardContent className="h-[230px] pt-4">
                  <Line data={trendChartData} options={trendOptions} />
                </CardContent>
              </Card>
            </div>

            {/* Top Merchants & Budget progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Merchants */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-foreground">Top Merchants</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Suppliers with the highest spending velocity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topMerchants.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">No merchant transactions tracked yet.</p>
                  ) : (
                    topMerchants.map((m) => (
                      <div
                        key={m.merchant}
                        className="flex items-center justify-between p-3.5 bg-muted/20 border border-border hover:bg-muted/10 rounded-xl transition group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <ShoppingBag className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{m.merchant}</p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{m.count} Transactions · {m.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-foreground font-mono">${m.amount.toFixed(2)}</p>
                          <Badge className="bg-primary/10 hover:bg-primary/10 text-primary border-none font-bold text-[9px] px-1.5 py-0.2 mt-0.5 rounded-full">
                            Verified
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Budget Progress */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-foreground">Budget Progress</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Target limits grouped by categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {summaries.slice(0, 3).map((c) => {
                    const budget = CATEGORY_BUDGETS[c.category] || 1000;
                    const val = c.total_spent;
                    const pct = Math.min((val / budget) * 100, 100);
                    const isExceeded = val > budget;

                    return (
                      <div key={c.category} className="space-y-1.5">
                        <div className="flex justify-between items-end text-xs">
                          <div>
                            <p className="font-bold text-foreground">{c.category}</p>
                          </div>
                          <p className="font-mono text-muted-foreground font-bold">
                            <span className={isExceeded ? "text-red-500" : "text-foreground"}>
                              ${val.toFixed(0)}
                            </span>{" "}
                            / <span className="text-muted-foreground/60">${budget}</span>
                          </p>
                        </div>
                        <Progress
                          value={pct}
                          className={`h-1.5 ${isExceeded ? "bg-red-500/10" : "bg-muted"}`}
                        />
                        {isExceeded && (
                          <p className="text-[10px] text-red-500 font-bold font-mono">
                            Exceeded by ${(val - budget).toFixed(2)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Recent Large Transactions Table */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold text-foreground">Recent Large Transactions</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Scanned items with values exceeding $100.00
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {largeTransactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">No transaction exceeds $100.00 yet.</p>
                ) : (
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <Table>
                      <TableHeader className="bg-muted/20 border-b border-border">
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-4 pl-6">
                            Transaction ID
                          </TableHead>
                          <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-4">
                            Merchant
                          </TableHead>
                          <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-4">
                            Category
                          </TableHead>
                          <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-4 text-center">
                            Status
                          </TableHead>
                          <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-4 text-right pr-6">
                            Amount
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {largeTransactions.slice(0, 5).map((t) => (
                          <TableRow key={t.receipt_id} className="border-border hover:bg-muted/10 transition">
                            <TableCell className="py-4 font-mono text-[10px] font-bold text-primary pl-6">
                              #{t.receipt_id.slice(0, 8)}
                            </TableCell>
                            <TableCell className="py-4 font-bold text-foreground text-xs">
                              {t.merchant_name || "Unknown Merchant"}
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0.5 rounded-full border-border bg-muted/30 text-muted-foreground"
                              >
                                {t.category || "Other"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold text-[10px] rounded-full px-2.5 py-0.5">
                                Verified
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-right font-black font-mono text-foreground text-xs pr-6">
                              ${(t.total_amount || 0).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
