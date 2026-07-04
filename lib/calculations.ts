import type {
  ApplicationForm,
  ExtraCost,
  MarginResult,
  PaymentLine,
  PriceListItem,
  ProjectSnapshot,
  SalesOrder,
  StandardCostResult,
  VendorBudget
} from "@/types/domain";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1
  }).format(value);
}

export function clampPrice(requestedPrice: number, priceListItem: PriceListItem) {
  if (requestedPrice < priceListItem.minPrice) {
    return {
      acceptedUnitPrice: priceListItem.minPrice,
      priceReason: "min_price" as const
    };
  }

  if (requestedPrice > priceListItem.maxPrice) {
    return {
      acceptedUnitPrice: priceListItem.maxPrice,
      priceReason: "max_price" as const
    };
  }

  return {
    acceptedUnitPrice: requestedPrice,
    priceReason: "actual_price" as const
  };
}

export function calculateStandardCost(
  salesOrder: SalesOrder,
  priceListItem: PriceListItem,
  applicationForm: ApplicationForm
): StandardCostResult {
  const { acceptedUnitPrice, priceReason } = clampPrice(
    applicationForm.requestedUnitPrice,
    priceListItem
  );
  const billableQuantity =
    priceListItem.pricingMode === "area_price"
      ? salesOrder.areaSquareMeter
      : salesOrder.quantity;

  return {
    acceptedUnitPrice,
    billableQuantity,
    pricingMode: priceListItem.pricingMode,
    total: acceptedUnitPrice * billableQuantity,
    priceReason
  };
}

export function sumExtraCosts(extraCosts: ExtraCost[], options?: { marginCheckable?: boolean }) {
  return extraCosts
    .filter((item) =>
      typeof options?.marginCheckable === "boolean"
        ? item.marginCheckable === options.marginCheckable
        : true
    )
    .reduce((total, item) => total + item.amount, 0);
}

export function calculateMargin(
  vendorBudget: VendorBudget,
  standardCost: StandardCostResult,
  extraCosts: ExtraCost[]
): MarginResult {
  const checkableExtraCost = sumExtraCosts(extraCosts, { marginCheckable: true });
  const specialCost = sumExtraCosts(extraCosts, { marginCheckable: false });
  const checkableCost = standardCost.total + checkableExtraCost;
  const maxPayableAmount = vendorBudget.budgetAmount * (1 - vendorBudget.requiredMarginRate);
  const marginAmount = vendorBudget.budgetAmount - checkableCost;
  const actualMarginRate = vendorBudget.budgetAmount === 0 ? 0 : marginAmount / vendorBudget.budgetAmount;

  return {
    vendorBudgetAmount: vendorBudget.budgetAmount,
    requiredMarginRate: vendorBudget.requiredMarginRate,
    maxPayableAmount,
    checkableCost,
    specialCost,
    totalPayable: checkableCost + specialCost,
    marginAmount,
    actualMarginRate,
    passed: checkableCost <= maxPayableAmount
  };
}

export function calculatePayments(applicationForm: ApplicationForm, margin: MarginResult): PaymentLine[] {
  const paymentOneBase = margin.checkableCost;
  const paymentOneAmount = roundMoney(paymentOneBase * applicationForm.firstPaymentRate);
  const paymentTwoCumulative = roundMoney(margin.totalPayable * 0.9);
  const paymentTwoAmount = roundMoney(paymentTwoCumulative - paymentOneAmount);
  const paymentThreeAmount = roundMoney(margin.totalPayable - paymentOneAmount - paymentTwoAmount);

  return [
    {
      id: "payment_1",
      label: "Payment 1",
      cumulativeRate: applicationForm.firstPaymentRate,
      baseAmount: paymentOneBase,
      priorPaidAmount: 0,
      payableAmount: paymentOneAmount,
      trigger: "Application Form"
    },
    {
      id: "payment_2",
      label: "Payment 2",
      cumulativeRate: 0.9,
      baseAmount: margin.totalPayable,
      priorPaidAmount: paymentOneAmount,
      payableAmount: paymentTwoAmount,
      trigger: "Acceptance Form"
    },
    {
      id: "payment_3",
      label: "Payment 3",
      cumulativeRate: 1,
      baseAmount: margin.totalPayable,
      priorPaidAmount: paymentOneAmount + paymentTwoAmount,
      payableAmount: paymentThreeAmount,
      trigger: "Final Balance"
    }
  ];
}

export function buildProjectSnapshot(args: {
  salesOrder: SalesOrder;
  applicationForm: ApplicationForm;
  vendorBudgets: VendorBudget[];
  priceList: PriceListItem[];
  extraCosts: ExtraCost[];
  standardCost: StandardCostResult;
  margin: MarginResult;
  payments: PaymentLine[];
}): ProjectSnapshot {
  return {
    savedAt: new Date().toISOString(),
    ...args
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
