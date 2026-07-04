import type { InstallationProject } from "@/types/domain";

export const sampleProject: InstallationProject = {
  salesOrder: {
    id: "so_001",
    customerName: "Customer A",
    soNumber: "SO-2026-0001",
    contractNumber: "CNT-2026-Install-001",
    installationRevenue: 80000,
    doorModel: "Industrial Door A",
    quantity: 1,
    areaSquareMeter: 54
  },
  vendorBudgets: [
    {
      id: "vendor_budget_001",
      vendorName: "Vendor A",
      allocationRate: 0.3,
      budgetAmount: 24000,
      requiredMarginRate: 0.3
    },
    {
      id: "vendor_budget_002",
      vendorName: "Vendor B",
      allocationRate: 0.3,
      budgetAmount: 24000,
      requiredMarginRate: 0.3
    },
    {
      id: "vendor_budget_003",
      vendorName: "Vendor C",
      allocationRate: 0.4,
      budgetAmount: 32000,
      requiredMarginRate: 0.3
    }
  ],
  priceList: [
    {
      id: "price_001",
      doorModel: "Industrial Door A",
      pricingMode: "whole_door",
      minPrice: 12000,
      listPrice: 16200,
      maxPrice: 16800,
      validFrom: "2026-01-01",
      validTo: "2026-12-31"
    },
    {
      id: "price_002",
      doorModel: "Industrial Door B",
      pricingMode: "area_price",
      minPrice: 260,
      listPrice: 300,
      maxPrice: 360,
      validFrom: "2026-01-01",
      validTo: "2026-12-31"
    }
  ],
  applicationForm: {
    id: "app_001",
    formNumber: "AF-2026-0001",
    selectedVendorBudgetId: "vendor_budget_001",
    requestedUnitPrice: 16200,
    firstPaymentRate: 0.5,
    status: "submitted"
  },
  extraCosts: [
    {
      id: "extra_001",
      costType: "Utilities",
      description: "Water and electricity",
      amount: 100,
      source: "dispatch_form",
      marginCheckable: true
    },
    {
      id: "extra_002",
      costType: "Travel",
      description: "Installer travel expense",
      amount: 200,
      source: "dispatch_form",
      marginCheckable: true
    },
    {
      id: "extra_003",
      costType: "Site Support",
      description: "On-site support fee",
      amount: 300,
      source: "acceptance_form",
      marginCheckable: true
    },
    {
      id: "extra_004",
      costType: "SP",
      description: "Offline email approval",
      amount: 100,
      source: "special_request",
      marginCheckable: false
    }
  ]
};
