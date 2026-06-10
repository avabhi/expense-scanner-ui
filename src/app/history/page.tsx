"use client";

import React, { useState, useMemo } from "react";
import { useCategoriesQuery } from "@/features/categories/hooks";
import { useReceiptQuery } from "@/features/receipts/hooks";
import { CATEGORY_ICONS } from "@/features/categories/constants";
import type { ReceiptRef, Receipt as DetailedReceipt, LineItem } from "@/features/receipts/types";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/components/ThemeProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Eye,
  AlertCircle,
  Download,
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
  FileSpreadsheet,
} from "lucide-react";

export default function HistoryPage() {
  // React Query hook for fetching data
  const { data: summaries = [], isLoading, error } = useCategoriesQuery();

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [maxAmount, setMaxAmount] = useState(5000);

  // Modal State
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  // Theme and Currency hooks
  const { theme } = useTheme();
  const { currencySymbol, formatAmount, getCurrencySymbol } = useCurrency();

  // React Query hook for fetching receipt details when modal opens
  const { data: detailedReceipt, isLoading: detailLoading, error: detailError } = useReceiptQuery(selectedReceiptId);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Derive categories and receipts from summaries
  const categories = useMemo(() => summaries.map((c) => c.category), [summaries]);

  const receipts = useMemo(() => {
    const uniqueReceiptsMap: Record<string, ReceiptRef> = {};
    summaries.forEach((catSummary) => {
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

    return Object.values(uniqueReceiptsMap).sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [summaries]);

  // Filter Logic
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch =
        (r.merchant_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.receipt_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || r.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" || r.status === selectedStatus;

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


  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Expense History
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              View and audit all historical OCR scanned receipts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-card hover:bg-muted text-foreground font-bold"
            >
              <Download className="h-4 w-4 mr-2" />
              <span>CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-card hover:bg-muted text-foreground font-bold"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span>PDF</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-center flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">{error.message}</span>
          </div>
        )}

        {/* Filter Card */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Search Filters</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleResetFilters}
              className="text-[10px] text-primary hover:bg-transparent px-0 font-bold"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Reset Filters
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
            {/* Search Input */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground">Search Merchant</Label>
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="E.g. AWS, Starbucks..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-background border-border focus:border-primary/50 text-foreground rounded-xl pl-9 text-xs"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="bg-background border-border text-foreground rounded-xl text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
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
              <Label className="text-xs font-bold text-muted-foreground">Status</Label>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedStatus("all");
                    setCurrentPage(1);
                  }}
                  className={`text-xs font-bold rounded-xl flex-1 cursor-pointer ${
                    selectedStatus === "all"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedStatus("completed");
                    setCurrentPage(1);
                  }}
                  className={`text-xs font-bold rounded-xl flex-1 cursor-pointer ${
                    selectedStatus === "completed"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Verified
                </Button>
              </div>
            </div>

            {/* Amount Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <Label className="font-bold text-muted-foreground">Max Spend</Label>
                <span className="font-mono font-bold text-primary">{currencySymbol}{maxAmount.toLocaleString()}</span>
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
                  className="accent-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-4 border-muted" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                </div>
                <p className="text-muted-foreground font-mono text-xs">Loading ledger transaction records...</p>
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="text-center py-20">
                <Receipt className="h-12 w-12 text-muted mx-auto mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">No matching records found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Adjust search filter parameters and try again.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/20 border-b border-border">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-4 pl-6 w-[160px]">
                          Receipt ID
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-4 w-[160px]">
                          Date
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-4">
                          Merchant
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-4">
                          Category
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-4 text-right pr-10">
                          Total Amount
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-4 text-center">
                          Status
                        </TableHead>
                        <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-4 text-center pr-6 w-[100px]">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedReceipts.map((r) => {
                        const IconComponent = CATEGORY_ICONS[r.category || ""] || Coins;
                        return (
                          <TableRow key={r.receipt_id} className="border-border hover:bg-muted/10 transition">
                            <TableCell className="py-4 font-mono text-[10px] font-bold text-primary pl-6">
                              #{r.receipt_id.slice(0, 8)}
                            </TableCell>
                            <TableCell className="py-4 text-foreground font-medium text-xs">
                              {r.date
                                ? new Date(r.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "—"}
                            </TableCell>
                            <TableCell className="py-4 font-bold text-foreground text-xs">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded bg-muted border border-border/80 flex items-center justify-center text-muted-foreground">
                                  <IconComponent className="h-3.5 w-3.5" />
                                </div>
                                <span>{r.merchant_name || "Unknown Merchant"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0.5 rounded-full border-border bg-muted/30 text-muted-foreground"
                              >
                                {r.category || "Other"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-right font-black font-mono text-foreground text-xs pr-10">
                              {getCurrencySymbol(r.currency)}
                              {(r.total_amount || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold text-[10px] rounded-full px-2.5 py-0.5">
                                Verified
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 text-center pr-6">
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => setSelectedReceiptId(r.receipt_id)}
                                className="h-7 w-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition cursor-pointer"
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
                <div className="bg-muted/10 px-6 py-4 flex items-center justify-between border-t border-border">
                  <span className="text-[11px] text-muted-foreground">
                    Showing <span className="font-bold text-foreground">{((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredReceipts.length)}</span> of <span className="font-bold text-foreground">{filteredReceipts.length}</span> items
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="h-8 border-border bg-card text-foreground hover:bg-muted disabled:opacity-30 rounded-xl cursor-pointer"
                    >
                      Prev
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        if (totalPages > 5 && Math.abs(pageNum - currentPage) > 1 && pageNum !== 1 && pageNum !== totalPages) {
                          if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="text-muted-foreground px-0.5">.</span>;
                          return null;
                        }
                        return (
                          <Button
                            key={pageNum}
                            size="icon-xs"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-8 w-8 text-xs font-bold rounded-xl cursor-pointer ${
                              currentPage === pageNum
                                ? "bg-primary hover:bg-primary/95 text-primary-foreground font-black"
                                : "bg-transparent text-muted-foreground hover:bg-muted"
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
                      className="h-8 border-border bg-card text-foreground hover:bg-muted disabled:opacity-30 rounded-xl cursor-pointer"
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
          <DialogContent className="bg-card border-border text-foreground rounded-3xl max-w-2xl shadow-2xl overflow-hidden p-0">
            {detailLoading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-full border-4 border-muted" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                </div>
                <p className="text-muted-foreground font-mono text-xs">Accessing line item indices...</p>
              </div>
            )}

            {detailError && (
              <div className="p-6 text-center space-y-4">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-red-500">Failed to load detailed record</p>
                  <p className="text-xs text-muted-foreground mt-1">{detailError.message}</p>
                </div>
                <Button onClick={() => setSelectedReceiptId(null)} className="bg-secondary text-foreground">
                  Close
                </Button>
              </div>
            )}

            {!detailLoading && !detailError && detailedReceipt && (
              <>
                {/* Modal Header */}
                <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      OCR Audit Log
                    </span>
                    <h3 className="text-xl font-bold text-foreground mt-2">
                      {detailedReceipt.merchant_name || "Unknown Merchant"}
                    </h3>
                    <p className="text-muted-foreground text-[10px] font-mono mt-1">
                      Receipt UUID: {detailedReceipt.id}
                    </p>
                  </div>
                  <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold text-[10px] px-2.5 py-0.5">
                    Verified
                  </Badge>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 max-h-[450px] overflow-y-auto">
                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 gap-4 border border-border bg-muted/10 p-4 rounded-2xl text-xs">
                    <div>
                      <p className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                        Transaction Date
                      </p>
                      <p className="text-foreground font-semibold mt-1">
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
                      <p className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                        Total Ledger Value
                      </p>
                      <p className="text-foreground font-black mt-1 font-mono text-sm text-primary">
                        {getCurrencySymbol(detailedReceipt.currency)}
                        {(detailedReceipt.total_amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div className="space-y-3">
                    <p className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-muted-foreground/80" />
                      <span>Itemized Extraction Breakdown</span>
                    </p>

                    <div className="border border-border rounded-2xl overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-muted/20 border-b border-border">
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-3 pl-4">
                              Description
                            </TableHead>
                            <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-3 w-[120px]">
                              Category
                            </TableHead>
                            <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider py-3 text-right pr-4 w-[100px]">
                              Price
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailedReceipt.line_items.map((item) => (
                            <TableRow key={item.id} className="border-border hover:bg-muted/10">
                              <TableCell className="py-3 text-xs text-foreground font-semibold pl-4">
                                {item.description}
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1.5 py-0.5 rounded-full border-border bg-muted text-muted-foreground"
                                >
                                  {item.category || "Unassigned"}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 text-right font-bold font-mono text-foreground text-xs pr-4">
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
                <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
                  <Button
                    onClick={() => setSelectedReceiptId(null)}
                    className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-6 rounded-xl cursor-pointer"
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
