"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchWithAuth } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Eye,
  AlertCircle,
  Clock,
  Download,
  Calendar,
  Filter,
  RefreshCcw,
  Coins,
  ShoppingBag,
  Car,
  Plane,
  Hotel,
  Briefcase,
  Database,
  Coffee,
  Receipt,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";

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

interface LineItem {
  id: string;
  description: string;
  price: number;
  category: string | null;
}

interface DetailedReceipt {
  id: string;
  merchant_name: string | null;
  date: string | null;
  total_amount: number | null;
  currency: string | null;
  status: string;
  line_items: LineItem[];
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

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<ReceiptRef[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [maxAmount, setMaxAmount] = useState(5000);

  // Modal State
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [detailedReceipt, setDetailedReceipt] = useState<DetailedReceipt | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchWithAuth("/api/v1/categories/summary");
        if (!res.ok) throw new Error("Failed to load history data.");
        const json: CategorySummary[] = await res.json();

        // Distinct categories
        const distinctCats = json.map((c) => c.category);
        setCategories(distinctCats);

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

  // Fetch full details when modal opens
  useEffect(() => {
    if (!selectedReceiptId) {
      setDetailedReceipt(null);
      return;
    }

    async function loadDetails() {
      try {
        setDetailLoading(true);
        setDetailError(null);
        const res = await fetchWithAuth(`/api/v1/receipts/${selectedReceiptId}`);
        if (!res.ok) throw new Error("Failed to load receipt line items.");
        const json: DetailedReceipt = await res.json();
        setDetailedReceipt(json);
      } catch (e: any) {
        setDetailError(e.message);
      } finally {
        setDetailLoading(false);
      }
    }
    loadDetails();
  }, [selectedReceiptId]);

  // Filter Logic
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      // 1. Search term match (Merchant name or ID)
      const matchesSearch =
        (r.merchant_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.receipt_id.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Category match
      const matchesCategory =
        selectedCategory === "all" || r.category === selectedCategory;

      // 3. Status match
      const matchesStatus =
        selectedStatus === "all" || r.status === selectedStatus;

      // 4. Amount match
      const matchesAmount = (r.total_amount || 0) <= maxAmount;

      return matchesSearch && matchesCategory && matchesStatus && matchesAmount;
    });
  }, [receipts, searchTerm, selectedCategory, selectedStatus, maxAmount]);

  // Pagination Logic
  const paginatedReceipts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReceipts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReceipts, currentPage]);

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage) || 1;

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setMaxAmount(5000);
    setCurrentPage(1);
  };

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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-100 to-cyan-400 bg-clip-text text-transparent">
              Expense History
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              View and audit all historical OCR scanned receipts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold"
            >
              <Download className="h-4 w-4 mr-2" />
              <span>CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span>PDF</span>
            </Button>
          </div>
        </div>

        {/* Filter Card */}
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-200">Search Filters</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleResetFilters}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:bg-transparent px-0 font-bold"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Reset Filters
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
            {/* Search Input */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400">Search Merchant</Label>
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="E.g. AWS, Starbucks..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-slate-950 border-slate-800 focus:border-cyan-500/50 text-slate-200 rounded-xl pl-9 text-xs"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-300 rounded-xl text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-300">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400">Status</Label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={selectedStatus === "all" ? "default" : "outline"}
                  onClick={() => {
                    setSelectedStatus("all");
                    setCurrentPage(1);
                  }}
                  className={`text-xs font-bold rounded-xl flex-1 ${
                    selectedStatus === "all"
                      ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={selectedStatus === "completed" ? "default" : "outline"}
                  onClick={() => {
                    setSelectedStatus("completed");
                    setCurrentPage(1);
                  }}
                  className={`text-xs font-bold rounded-xl flex-1 ${
                    selectedStatus === "completed"
                      ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900"
                  }`}
                >
                  Verified
                </Button>
              </div>
            </div>

            {/* Amount Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <Label className="font-bold text-slate-400">Max Spend</Label>
                <span className="font-mono font-bold text-cyan-400">${maxAmount.toLocaleString()}</span>
              </div>
              <div className="pt-2">
                <Slider
                  defaultValue={[5000]}
                  value={[maxAmount]}
                  onValueChange={(val) => {
                    setMaxAmount(val[0]);
                    setCurrentPage(1);
                  }}
                  max={5000}
                  step={50}
                  className="accent-cyan-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 animate-spin" />
                </div>
                <p className="text-slate-500 font-mono text-xs">Loading ledger transaction records...</p>
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="text-center py-20">
                <Receipt className="h-12 w-12 text-slate-800 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">No matching records found</p>
                <p className="text-xs text-slate-600 mt-1">Adjust search filter parameters and try again.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-950/40 border-b border-slate-900">
                      <TableRow className="border-slate-900 hover:bg-transparent">
                        <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-4 pl-6 w-[160px]">
                          Receipt ID
                        </TableHead>
                        <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-4 w-[160px]">
                          Date
                        </TableHead>
                        <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-4">
                          Merchant
                        </TableHead>
                        <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-4">
                          Category
                        </TableHead>
                        <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-4 text-right pr-10">
                          Total Amount
                        </TableHead>
                        <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-4 text-center">
                          Status
                        </TableHead>
                        <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-4 text-center pr-6 w-[100px]">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedReceipts.map((r) => {
                        const IconComponent = CATEGORY_ICONS[r.category || ""] || Coins;
                        return (
                          <TableRow key={r.receipt_id} className="border-slate-900 hover:bg-slate-900/30 transition">
                            <TableCell className="py-4 font-mono text-[10px] font-bold text-cyan-500 pl-6">
                              #{r.receipt_id.slice(0, 8)}
                            </TableCell>
                            <TableCell className="py-4 text-slate-300 font-medium text-xs">
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
                              {getCurrencySymbol(r.currency)}
                              {(r.total_amount || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-400 border-none font-bold text-[10px] rounded-full px-2.5 py-0.5">
                                Verified
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-center pr-6">
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => setSelectedReceiptId(r.receipt_id)}
                                className="h-7 w-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                <div className="bg-slate-950/40 px-6 py-4 flex items-center justify-between border-t border-slate-900">
                  <span className="text-[11px] text-slate-500">
                    Showing <span className="font-bold text-slate-300">{((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredReceipts.length)}</span> of <span className="font-bold text-slate-300">{filteredReceipts.length}</span> items
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="h-8 border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 disabled:opacity-30 rounded-xl"
                    >
                      Prev
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        // For large totalPages, restrict visual nodes (simple logic here)
                        if (totalPages > 5 && Math.abs(pageNum - currentPage) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                          if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="text-slate-600 px-0.5">.</span>;
                          return null;
                        }
                        return (
                          <Button
                            key={pageNum}
                            size="icon-xs"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-8 w-8 text-xs font-bold rounded-xl ${
                              currentPage === pageNum
                                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black"
                                : "bg-transparent text-slate-400 hover:bg-slate-900"
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      className="h-8 border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 disabled:opacity-30 rounded-xl"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Detailed Audit Modal Dialog */}
        <Dialog open={!!selectedReceiptId} onOpenChange={(open) => !open && setSelectedReceiptId(null)}>
          <DialogContent className="bg-slate-950 border-slate-900 text-slate-100 rounded-3xl max-w-2xl shadow-2xl overflow-hidden p-0">
            {detailLoading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-900" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 animate-spin" />
                </div>
                <p className="text-slate-500 font-mono text-xs">Accessing line item indices...</p>
              </div>
            )}

            {detailError && (
              <div className="p-6 text-center space-y-4">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-red-400">Failed to load detailed record</p>
                  <p className="text-xs text-slate-500 mt-1">{detailError}</p>
                </div>
                <Button onClick={() => setSelectedReceiptId(null)} className="bg-slate-900 text-slate-300">
                  Close
                </Button>
              </div>
            )}

            {!detailLoading && !detailError && detailedReceipt && (
              <>
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-900 bg-slate-900/30 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/20 border border-cyan-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      OCR Audit Log
                    </span>
                    <DialogTitle className="text-xl font-bold text-slate-100 mt-2">
                      {detailedReceipt.merchant_name || "Unknown Merchant"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs font-mono mt-1">
                      Receipt UUID: {detailedReceipt.id}
                    </DialogDescription>
                  </div>
                  <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-400 border-none font-bold text-[10px] px-2.5 py-0.5">
                    Verified
                  </Badge>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 max-h-[450px] overflow-y-auto">
                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 gap-4 border border-slate-900 bg-slate-900/10 p-4 rounded-2xl text-xs">
                    <div>
                      <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        Transaction Date
                      </p>
                      <p className="text-slate-200 font-semibold mt-1">
                        {detailedReceipt.date
                          ? new Date(detailedReceipt.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        Total Ledger Value
                      </p>
                      <p className="text-slate-200 font-black mt-1 font-mono text-sm text-cyan-400">
                        {getCurrencySymbol(detailedReceipt.currency)}
                        {(detailedReceipt.total_amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="space-y-3">
                    <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-slate-500" />
                      <span>Itemized Extraction Breakdown</span>
                    </p>

                    <div className="border border-slate-900 rounded-2xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-900/30 border-b border-slate-900">
                          <TableRow className="border-slate-900 hover:bg-transparent">
                            <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-3 pl-4">
                              Description
                            </TableHead>
                            <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-3 w-[120px]">
                              Category
                            </TableHead>
                            <TableHead className="text-slate-500 font-bold text-[10px] uppercase tracking-wider py-3 text-right pr-4 w-[100px]">
                              Price
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailedReceipt.line_items.map((item) => (
                            <TableRow key={item.id} className="border-slate-900/60 hover:bg-slate-900/20">
                              <TableCell className="py-3 text-xs text-slate-300 font-semibold pl-4">
                                {item.description}
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0.5 rounded-full border-slate-800 bg-slate-900 text-slate-500"
                                >
                                  {item.category || "Unassigned"}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 text-right font-bold font-mono text-slate-200 text-xs pr-4">
                                {getCurrencySymbol(detailedReceipt.currency)}
                                {item.price.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-900 bg-slate-950/40 flex justify-end">
                  <Button
                    onClick={() => setSelectedReceiptId(null)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 rounded-xl cursor-pointer"
                  >
                    Done Audit
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
