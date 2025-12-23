import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="inline-flex items-center gap-1" data-testid="currency-toggle">
      <Button
        variant={currency === "ZAR" ? "default" : "outline"}
        size="sm"
        onClick={() => setCurrency("ZAR")}
        data-testid="button-currency-zar"
      >
        ZAR
      </Button>
      <Button
        variant={currency === "USD" ? "default" : "outline"}
        size="sm"
        onClick={() => setCurrency("USD")}
        data-testid="button-currency-usd"
      >
        USD
      </Button>
    </div>
  );
}
