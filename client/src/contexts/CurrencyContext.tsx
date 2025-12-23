import { createContext, useContext, useState, useEffect } from "react";

type Currency = "ZAR" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (zarAmount: number) => string;
  formatShortPrice: (zarAmount: number) => string;
  convertToDisplay: (zarAmount: number) => number;
}

const ZAR_TO_USD_RATE = 0.055; // 1 ZAR = 0.055 USD (approximate)

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("preferredCurrency");
      return (saved === "USD" || saved === "ZAR") ? saved : "ZAR";
    }
    return "ZAR";
  });

  useEffect(() => {
    localStorage.setItem("preferredCurrency", currency);
  }, [currency]);

  const convertToDisplay = (zarAmount: number): number => {
    if (currency === "USD") {
      return zarAmount * ZAR_TO_USD_RATE;
    }
    return zarAmount;
  };

  const formatPrice = (zarAmount: number): string => {
    const amount = convertToDisplay(zarAmount);
    if (currency === "USD") {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    }
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const formatShortPrice = (zarAmount: number): string => {
    const amount = convertToDisplay(zarAmount);
    const prefix = currency === "USD" ? "$" : "R";
    if (amount >= 1000) {
      const shortened = Math.round(amount / 1000);
      return `${prefix}${shortened}k`;
    }
    return `${prefix}${Math.round(amount)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatShortPrice, convertToDisplay }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
