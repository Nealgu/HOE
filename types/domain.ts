export type UserRole = "sales" | "operations" | "finance" | "admin";

export type PricingMode = "whole_door" | "area_price";

export type CostSource = "dispatch_form" | "acceptance_form" | "special_request";

export type FinanceStatus = "draft" | "submitted" | "finance_approved" | "posted" | "rejected";

export type SalesOrder = {
  id: string;
  customerName: string;
  soNumber: string;
  contractNumber: string;
  installationRevenue: number;
  doorModel: string;
  quantity: number;
  areaSquareMeter: number;
};

export type VendorBudget = {
  id: string;
  vendorName: string;
  allocationRate: number;
  budgetAmount: number;
  requiredMarginRate: number;
};

export type PriceListItem = {
  id: string;
  doorModel: string;
  pricingMode: PricingMode;
  minPrice: number;
  listPrice: number;
  maxPrice: number;
  validFrom: string;
  validTo: string;
};

export type ExtraCost = {
  id: string;
  costType: string;
  description: string;
  amount: number;
  source: CostSource;
  marginCheckable: boolean;
};

export type ApplicationForm = {
  id: string;
  formNumber: string;
  selectedVendorBudgetId: string;
  requestedUnitPrice: number;
  firstPaymentRate: number;
  status: FinanceStatus;
};

export type InstallationProject = {
  salesOrder: SalesOrder;
  vendorBudgets: VendorBudget[];
  priceList: PriceListItem[];
  applicationForm: ApplicationForm;
  extraCosts: ExtraCost[];
};

export type StandardCostResult = {
  acceptedUnitPrice: number;
  billableQuantity: number;
  pricingMode: PricingMode;
  total: number;
  priceReason: "min_price" | "actual_price" | "max_price";
};

export type MarginResult = {
  vendorBudgetAmount: number;
  requiredMarginRate: number;
  maxPayableAmount: number;
  checkableCost: number;
  specialCost: number;
  totalPayable: number;
  marginAmount: number;
  actualMarginRate: number;
  passed: boolean;
};

export type PaymentLine = {
  id: "payment_1" | "payment_2" | "payment_3";
  label: string;
  cumulativeRate: number;
  baseAmount: number;
  priorPaidAmount: number;
  payableAmount: number;
  trigger: string;
};

export type ProjectSnapshot = {
  savedAt: string;
  salesOrder: SalesOrder;
  applicationForm: ApplicationForm;
  vendorBudgets: VendorBudget[];
  priceList: PriceListItem[];
  extraCosts: ExtraCost[];
  standardCost: StandardCostResult;
  margin: MarginResult;
  payments: PaymentLine[];
};
