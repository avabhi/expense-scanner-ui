"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchWithAuth } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  UploadCloud,
  FileSpreadsheet,
  Receipt,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  Briefcase,
  Plane,
  Car,
  Hotel,
  Coffee,
  Database,
  Coins,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
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

const CATEGORY_ICONS: Record<string, any> = {
  "Food & Dining": Coffee,
  "Groceries": ShoppingBag,
  "Transport": Car,
  "Travel": Plane,
  "Travel & Lodging": Plane,
  "Lodging": Hotel,
  "Office Supplies": Briefcase,
  "Software / SaaS": Database,
  "Cloud Infrastructure": Database,
  "Other": Coins,
};

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [summaries, setSummaries] = useState<CategorySummary[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchWithAuth("/api/v1/categories/summary");
        if (!res.ok) throw new Error("Failed to load dashboard data.");
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
                // Since summary returns completed receipts, set status to verified
                status: "completed",
              };
            }
          });
        });

        // Convert map to list and sort by date descending
        const allReceipts = Object.values(uniqueReceiptsMap).sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });

        setReceipts(allReceipts);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalSpent = summaries.reduce((s, c) => s + c.total_spent, 0);

  // Compile timeline data for the trend chart
  // Group receipts by date (Y-M-D) or just show recent days
  const dateSpentMap: Record<string, number> = {};
  receipts.forEach((r) => {
    if (r.date && r.total_amount) {
      const formattedDate = new Date(r.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dateSpentMap[formattedDate] = (dateSpentMap[formattedDate] || 0) + r.total_amount;
    }
  });

  // Take the last 7 unique transaction dates or pad with dummy values if empty
  let chartLabels = Object.keys(dateSpentMap).reverse();
  let chartValues = chartLabels.map((l) => dateSpentMap[l]);

  if (chartLabels.length < 5) {
    chartLabels = ["May 21", "May 22", "May 23", "May 24", "May 25", "May 26", "May 27"];
    chartValues = [240, 120, 480, 290, 890, 450, totalSpent || 1240];
  }

  const chartData: ChartData<"line"> = {
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: "Daily Spend ($)",
        data: chartValues,
        borderColor: "#06b6d4", // cyan-500
        backgroundColor: "rgba(6, 182, 212, 0.05)",
        tension: 0.3,
        pointBackgroundColor: "#06b6d4",
        pointBorderColor: "#0f172a",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
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
        ticks: { color: "#64748b", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.05)" },
        ticks: { color: "#64748b", font: { size: 10 } },
      },
    },
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-100 to-cyan-400 bg-clip-text text-transparent">
              Welcome back, {session?.user?.name?.split(" ")[0] || "User"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Here is your AI expense intelligence dashboard overview.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            >
              Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            >
              Quarter
            </Button>
          </div>
        </div>

        {/* Loading & Error Indicators */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 animate-spin" />
            </div>
            <p className="text-slate-500 font-mono text-xs">Fetching ledger details...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 text-center flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Charts & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trend line */}
              <Card className="lg:col-span-2 bg-slate-900/40 border-slate-800 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-slate-200">Spending Trends</CardTitle>
                  <CardDescription className="text-slate-500 text-xs">
                    Overview of parsed receipts transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[220px] pt-4">
                  <Line data={chartData} options={chartOptions as any} />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-slate-200">Quick Actions</CardTitle>
                  <CardDescription className="text-slate-500 text-xs">
                    Scan receipt or generate summary
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div
                    onClick={() => router.push("/")}
                    className="border-2 border-dashed border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group hover:bg-slate-900/20 transition-all duration-200"
                  >
                    <div className="h-10 w-10 rounded-full bg-cyan-950/30 border border-cyan-800/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <UploadCloud className="h-5 w-5 text-cyan-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      Scan New Receipt
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                      Upload image to begin local OCR extraction
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => router.push("/reports")}
                    className="w-full border-slate-800 bg-slate-950 hover:bg-slate-900 hover:text-slate-200 text-slate-400 py-5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>View Financial Reports</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-lg">
                <CardContent className="p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Monthly Spend
                    </span>
                    <Badge className="bg-cyan-500/10 hover:bg-cyan-500/10 text-cyan-400 border-none flex items-center gap-1 text-[10px]">
                      <TrendingUp className="h-3 w-3" />
                      <span>+12.4%</span>
                    </Badge>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-100 mt-4 font-mono">
                    ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-lg">
                <CardContent className="p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Active Syncs
                    </span>
                    <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-400 border-none flex items-center gap-1 text-[10px]">
                      <Clock className="h-3 w-3" />
                      <span>Syncing</span>
                    </Badge>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-100 mt-4 font-mono">
                    {receipts.length} <span className="text-xs font-normal text-slate-500 font-sans">items</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-lg">
                <CardContent className="p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Budget Used
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      60%
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-2xl font-black text-slate-100 font-mono">
                      $3,000.00 / <span className="text-slate-500 text-sm font-normal">$5,000</span>
                    </p>
                    <Progress value={60} className="h-1.5 bg-slate-800" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-200">Recent Activity</CardTitle>
                  <CardDescription className="text-slate-500 text-xs">
                    Latest receipts processed by the vision LLM agent
                  </CardDescription>
                </div>
                <Link
                  href="/history"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>View History</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="pt-2">
                {receipts.length === 0 ? (
                  <div className="text-center py-10">
                    <Receipt className="h-12 w-12 text-slate-800 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-400">No transactions recorded yet</p>
                    <p className="text-xs text-slate-600 mt-1">Upload receipt images on the homepage to start parsing.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-900 rounded-xl">
                    <Table>
                      <TableHeader className="bg-slate-950/40 border-b border-slate-900">
                        <TableRow className="border-slate-900 hover:bg-transparent">
                          <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-4 pl-6">
                            Date
                          </TableHead>
                          <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-4">
                            Merchant
                          </TableHead>
                          <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-4">
                            Category
                          </TableHead>
                          <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-4 text-right pr-10">
                            Amount
                          </TableHead>
                          <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-4 text-center pr-6">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receipts.slice(0, 5).map((r) => {
                          const IconComponent = CATEGORY_ICONS[r.category || ""] || Coins;
                          return (
                            <TableRow
                              key={r.receipt_id}
                              className="border-slate-900 hover:bg-slate-900/30 transition cursor-pointer"
                              onClick={() => router.push("/history")}
                            >
                              <TableCell className="py-4 text-slate-300 font-medium text-xs pl-6">
                                {r.date
                                  ? new Date(r.date).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "—"}
                              </TableCell>
                              <TableCell className="py-4 font-bold text-slate-200 text-xs">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400">
                                    <IconComponent className="h-3.5 w-3.5 text-slate-400" />
                                  </div>
                                  <span>{r.merchant_name || "Unknown Merchant"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-2 py-0.5 rounded-full border-slate-800 bg-slate-900/30 text-slate-400"
                                >
                                  {r.category || "Other"}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 text-right font-black font-mono text-slate-200 text-xs pr-10">
                                ${(r.total_amount || 0).toFixed(2)}
                              </TableCell>
                              <TableCell className="py-4 text-center pr-6">
                                <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-400 border-none font-bold text-[10px] rounded-full px-2.5 py-0.5">
                                  Verified
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
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
