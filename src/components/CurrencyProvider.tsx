"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Currency = {
  code: string;
  symbol: string;
  label: string;
};

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", label: "US Dollar ($)" },
  { code: "INR", symbol: "₹", label: "Indian Rupee (₹)" },
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "GBP", symbol: "£", label: "British Pound (£)" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen (¥)" },
  { code: "CAD", symbol: "CA$", label: "Canadian Dollar (CA$)" },
  { code: "AUD", symbol: "AU$", label: "Australian Dollar (AU$)" },
];

type CurrencyContextType = {
  currency: string;
  currencySymbol: string;
  setCurrency: (code: string) => void;
  getCurrencySymbol: (code: string | null) => string;
  formatAmount: (amount: number, code?: string | null) => string;
  supportedCurrencies: Currency[];
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>("USD");
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency_preference");
    const initialCurrency = savedCurrency || "USD";
    
    setCurrencyState(initialCurrency);
    const matched = SUPPORTED_CURRENCIES.find((c) => c.code === initialCurrency);
    setCurrencySymbol(matched ? matched.symbol : "$");
    setMounted(true);
  }, []);

  const setCurrency = (code: string) => {
    setCurrencyState(code);
    const matched = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    const symbol = matched ? matched.symbol : "$";
    setCurrencySymbol(symbol);
    localStorage.setItem("currency_preference", code);
  };

  const getCurrencySymbol = (code: string | null) => {
    if (!code) return currencySymbol;
    switch (code.toUpperCase()) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "INR": return "₹";
      case "JPY": return "¥";
      case "CAD": return "CA$";
      case "AUD": return "AU$";
      default: return code + " ";
    }
  };

  const formatAmount = (amount: number, code?: string | null) => {
    const symbol = getCurrencySymbol(code !== undefined ? code : currency);
    return `${symbol}${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Prevent hydration layout shift
  if (!mounted) {
    return <div className="invisible">{children}</div>;
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencySymbol,
        setCurrency,
        getCurrencySymbol,
        formatAmount,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
