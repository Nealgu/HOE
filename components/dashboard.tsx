"use client";

import { useMemo, useState, useTransition } from "react";
import {
  BadgeCheck,
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Cloud,
  CloudUpload,
  FileCheck2,
  FilePlus2,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Plus,
  ReceiptText,
  Scale,
  Send,
  Settings2,
  ShieldCheck,
  Trash2,
  UsersRound,
  WalletCards,
  XCircle
} from "lucide-react";
import { saveProjectSnapshot } from "@/app/actions";
import {
  buildProjectSnapshot,
  calculateMargin,
  calculatePayments,
  calculateStandardCost,
  formatCurrency,
  formatPercent,
  sumExtraCosts
} from "@/lib/calculations";
import type {
  ApplicationForm,
  CostSource,
  ExtraCost,
  FinanceStatus,
  InstallationProject,
  SalesOrder
} from "@/types/domain";

type DashboardProps = {
  initialProject: InstallationProject;
  cloudReady: boolean;
};

const firstPaymentRates = [0.5, 0.666, 0.7];

const statusSteps: Array<{ key: FinanceStatus; label: string; icon: typeof ClipboardList }> = [
  { key: "draft", label: "Draft", icon: ClipboardList },
  { key: "submitted", label: "Submitted", icon: Send },
  { key: "finance_approved", label: "Finance Approved", icon: ShieldCheck },
  { key: "posted", label: "Posted", icon: BadgeCheck }
];

const sourceLabels: Record<CostSource, string> = {
  dispatch_form: "派工单",
  acceptance_form: "验收单",
  special_request: "特殊申请"
};

export function Dashboard({ initialProject, cloudReady }: DashboardProps) {
  const [salesOrder, setSalesOrder] = useState(initialProject.salesOrder);
  const [applicationForm, setApplicationForm] = useState(initialProject.applicationForm);
  const [extraCosts, setExtraCosts] = useState(initialProject.extraCosts);
  const [syncMessage, setSyncMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const vendorBudgets = useMemo(
    () =>
      initialProject.vendorBudgets.map((vendor) => ({
        ...vendor,
        budgetAmount: salesOrder.installationRevenue * vendor.allocationRate
      })),
    [initialProject.vendorBudgets, salesOrder.installationRevenue]
  );

  const priceListItem =
    initialProject.priceList.find((item) => item.doorModel === salesOrder.doorModel) ??
    initialProject.priceList[0];
  const selectedVendor =
    vendorBudgets.find((vendor) => vendor.id === applicationForm.selectedVendorBudgetId) ??
    vendorBudgets[0];

  const standardCost = useMemo(
    () => calculateStandardCost(salesOrder, priceListItem, applicationForm),
    [applicationForm, priceListItem, salesOrder]
  );
  const margin = useMemo(
    () => calculateMargin(selectedVendor, standardCost, extraCosts),
    [extraCosts, selectedVendor, standardCost]
  );
  const payments = useMemo(() => calculatePayments(applicationForm, margin), [applicationForm, margin]);

  const activeStepIndex = Math.max(
    statusSteps.findIndex((step) => step.key === applicationForm.status),
    0
  );

  function updateSalesOrder<K extends keyof SalesOrder>(key: K, value: SalesOrder[K]) {
    setSalesOrder((current) => ({ ...current, [key]: value }));
  }

  function updateApplicationForm<K extends keyof ApplicationForm>(
    key: K,
    value: ApplicationForm[K]
  ) {
    setApplicationForm((current) => ({ ...current, [key]: value }));
  }

  function updateExtraCost(id: string, patch: Partial<ExtraCost>) {
    setExtraCosts((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function addExtraCost() {
    setExtraCosts((current) => [
      ...current,
      {
        id: `extra_${Date.now()}`,
        costType: "New Cost",
        description: "Pending detail",
        amount: 0,
        source: "dispatch_form",
        marginCheckable: true
      }
    ]);
  }

  function removeExtraCost(id: string) {
    setExtraCosts((current) => current.filter((item) => item.id !== id));
  }

  function handleSync() {
    const snapshot = buildProjectSnapshot({
      salesOrder,
      applicationForm,
      vendorBudgets,
      priceList: initialProject.priceList,
      extraCosts,
      standardCost,
      margin,
      payments
    });

    startTransition(async () => {
      const result = await saveProjectSnapshot(snapshot);
      setSyncMessage(result.message);
    });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <BriefcaseBusiness aria-hidden="true" size={20} />
          </div>
          <div>
            <strong>Install Procea</strong>
            <span>Online</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <a className="nav-item is-active" href="#">
            <LayoutDashboard aria-hidden="true" size={18} />
            Workbench
          </a>
          <a className="nav-item" href="#">
            <ReceiptText aria-hidden="true" size={18} />
            SO
          </a>
          <a className="nav-item" href="#">
            <UsersRound aria-hidden="true" size={18} />
            Vendors
          </a>
          <a className="nav-item" href="#">
            <Scale aria-hidden="true" size={18} />
            Margin
          </a>
          <a className="nav-item" href="#">
            <WalletCards aria-hidden="true" size={18} />
            Payment
          </a>
          <a className="nav-item" href="#">
            <Settings2 aria-hidden="true" size={18} />
            Admin
          </a>
        </nav>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Installation Settlement</p>
            <h1>安装分包结算工作台</h1>
          </div>
          <div className="topbar-actions">
            <span className={cloudReady ? "cloud-pill is-ready" : "cloud-pill"}>
              <Cloud aria-hidden="true" size={16} />
              {cloudReady ? "Cloud ready" : "Cloud env pending"}
            </span>
            <button className="primary-button" type="button" onClick={handleSync} disabled={isPending}>
              <CloudUpload aria-hidden="true" size={16} />
              {isPending ? "Syncing" : "Sync"}
            </button>
          </div>
        </header>

        {syncMessage ? (
          <div className="notice" role="status">
            {syncMessage}
          </div>
        ) : null}

        <section className="metrics-grid" aria-label="Project totals">
          <Metric
            icon={BadgeDollarSign}
            label="Installation Revenue"
            value={formatCurrency(salesOrder.installationRevenue)}
          />
          <Metric icon={Gauge} label="Vendor Budget" value={formatCurrency(selectedVendor.budgetAmount)} />
          <Metric icon={CircleDollarSign} label="Payable Total" value={formatCurrency(margin.totalPayable)} />
          <Metric
            icon={margin.passed ? CheckCircle2 : XCircle}
            label="Margin"
            value={formatPercent(margin.actualMarginRate)}
            tone={margin.passed ? "success" : "danger"}
          />
        </section>

        <div className="content-grid">
          <section className="panel span-12 process-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Flow</p>
                <h2>SO 到付款过账</h2>
              </div>
              <span className="status-badge">{applicationForm.formNumber}</span>
            </div>
            <img className="workflow-map" src="/workflow-map.svg" alt="SO to payment workflow" />
          </section>

          <section className="panel span-7">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Customer</p>
                <h2>SO / 合同收入</h2>
              </div>
              <span className="status-badge">{salesOrder.soNumber}</span>
            </div>

            <div className="form-grid">
              <label>
                Customer
                <input
                  value={salesOrder.customerName}
                  onChange={(event) => updateSalesOrder("customerName", event.target.value)}
                />
              </label>
              <label>
                Contract
                <input
                  value={salesOrder.contractNumber}
                  onChange={(event) => updateSalesOrder("contractNumber", event.target.value)}
                />
              </label>
              <label>
                Revenue
                <input
                  type="number"
                  min="0"
                  value={salesOrder.installationRevenue}
                  onChange={(event) =>
                    updateSalesOrder("installationRevenue", Number(event.target.value))
                  }
                />
              </label>
              <label>
                Door Model
                <select
                  value={salesOrder.doorModel}
                  onChange={(event) => updateSalesOrder("doorModel", event.target.value)}
                >
                  {initialProject.priceList.map((item) => (
                    <option key={item.id} value={item.doorModel}>
                      {item.doorModel}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  min="0"
                  value={salesOrder.quantity}
                  onChange={(event) => updateSalesOrder("quantity", Number(event.target.value))}
                />
              </label>
              <label>
                Area m2
                <input
                  type="number"
                  min="0"
                  value={salesOrder.areaSquareMeter}
                  onChange={(event) =>
                    updateSalesOrder("areaSquareMeter", Number(event.target.value))
                  }
                />
              </label>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Split</th>
                    <th>Budget</th>
                    <th>Max Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorBudgets.map((vendor) => (
                    <tr key={vendor.id}>
                      <td>{vendor.vendorName}</td>
                      <td>{formatPercent(vendor.allocationRate)}</td>
                      <td>{formatCurrency(vendor.budgetAmount)}</td>
                      <td>{formatCurrency(vendor.budgetAmount * (1 - vendor.requiredMarginRate))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel span-5">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Application</p>
                <h2>派工单计算</h2>
              </div>
              <ClipboardCheck aria-hidden="true" size={20} />
            </div>

            <div className="form-grid single">
              <label>
                Vendor
                <select
                  value={applicationForm.selectedVendorBudgetId}
                  onChange={(event) =>
                    updateApplicationForm("selectedVendorBudgetId", event.target.value)
                  }
                >
                  {vendorBudgets.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.vendorName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Requested Price
                <input
                  type="number"
                  min="0"
                  value={applicationForm.requestedUnitPrice}
                  onChange={(event) =>
                    updateApplicationForm("requestedUnitPrice", Number(event.target.value))
                  }
                />
              </label>
            </div>

            <div className="price-band">
              <div>
                <span>Min</span>
                <strong>{formatCurrency(priceListItem.minPrice)}</strong>
              </div>
              <ChevronRight aria-hidden="true" size={16} />
              <div>
                <span>Actual</span>
                <strong>{formatCurrency(standardCost.acceptedUnitPrice)}</strong>
              </div>
              <ChevronRight aria-hidden="true" size={16} />
              <div>
                <span>Max</span>
                <strong>{formatCurrency(priceListItem.maxPrice)}</strong>
              </div>
            </div>

            <div className="calculation-list">
              <Row label="Mode" value={priceListItem.pricingMode === "area_price" ? "Area x Price" : "Whole Door"} />
              <Row label="Billable Qty" value={standardCost.billableQuantity.toString()} />
              <Row label="Standard Installation" value={formatCurrency(standardCost.total)} />
              <Row label="Extra Cost" value={formatCurrency(sumExtraCosts(extraCosts, { marginCheckable: true }))} />
              <Row label="Special" value={formatCurrency(sumExtraCosts(extraCosts, { marginCheckable: false }))} />
            </div>
          </section>

          <section className="panel span-7">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Cost Source</p>
                <h2>Extra Cost / 特殊申请</h2>
              </div>
              <button className="icon-button" type="button" onClick={addExtraCost} title="Add cost">
                <Plus aria-hidden="true" size={18} />
              </button>
            </div>

            <div className="cost-list">
              {extraCosts.map((item) => (
                <div className="cost-row" key={item.id}>
                  <input
                    aria-label="Cost type"
                    value={item.costType}
                    onChange={(event) => updateExtraCost(item.id, { costType: event.target.value })}
                  />
                  <select
                    aria-label="Source"
                    value={item.source}
                    onChange={(event) =>
                      updateExtraCost(item.id, { source: event.target.value as CostSource })
                    }
                  >
                    <option value="dispatch_form">{sourceLabels.dispatch_form}</option>
                    <option value="acceptance_form">{sourceLabels.acceptance_form}</option>
                    <option value="special_request">{sourceLabels.special_request}</option>
                  </select>
                  <input
                    aria-label="Amount"
                    type="number"
                    min="0"
                    value={item.amount}
                    onChange={(event) => updateExtraCost(item.id, { amount: Number(event.target.value) })}
                  />
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={item.marginCheckable}
                      onChange={(event) =>
                        updateExtraCost(item.id, { marginCheckable: event.target.checked })
                      }
                    />
                    Margin
                  </label>
                  <button
                    className="icon-button muted"
                    type="button"
                    onClick={() => removeExtraCost(item.id)}
                    title="Remove"
                  >
                    <Trash2 aria-hidden="true" size={17} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="panel span-5">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Margin</p>
                <h2>30% 检查</h2>
              </div>
              <span className={margin.passed ? "result-pill pass" : "result-pill fail"}>
                {margin.passed ? "Pass" : "Hold"}
              </span>
            </div>

            <div className="margin-meter" aria-label="Margin meter">
              <div style={{ width: `${Math.min(Math.max(margin.actualMarginRate * 100, 0), 100)}%` }} />
            </div>

            <div className="calculation-list">
              <Row label="Budget" value={formatCurrency(margin.vendorBudgetAmount)} />
              <Row label="Max Payable" value={formatCurrency(margin.maxPayableAmount)} />
              <Row label="Checkable Cost" value={formatCurrency(margin.checkableCost)} />
              <Row label="Special Excluded" value={formatCurrency(margin.specialCost)} />
              <Row label="Margin Amount" value={formatCurrency(margin.marginAmount)} />
            </div>
          </section>

          <section className="panel span-7">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Payment</p>
                <h2>付款节奏</h2>
              </div>
              <div className="segmented" role="group" aria-label="First payment rate">
                {firstPaymentRates.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    className={applicationForm.firstPaymentRate === rate ? "is-selected" : ""}
                    onClick={() => updateApplicationForm("firstPaymentRate", rate)}
                  >
                    {formatPercent(rate)}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>Trigger</th>
                    <th>Rate</th>
                    <th>Base</th>
                    <th>Prior Paid</th>
                    <th>Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((line) => (
                    <tr key={line.id}>
                      <td>{line.label}</td>
                      <td>{line.trigger}</td>
                      <td>{formatPercent(line.cumulativeRate)}</td>
                      <td>{formatCurrency(line.baseAmount)}</td>
                      <td>{formatCurrency(line.priorPaidAmount)}</td>
                      <td>{formatCurrency(line.payableAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel span-5">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Finance</p>
                <h2>审批 / Post</h2>
              </div>
              <FileCheck2 aria-hidden="true" size={20} />
            </div>

            <div className="approval-steps">
              {statusSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isDone = index <= activeStepIndex;

                return (
                  <button
                    type="button"
                    key={step.key}
                    className={isDone ? "approval-step is-done" : "approval-step"}
                    onClick={() => updateApplicationForm("status", step.key)}
                  >
                    <StepIcon aria-hidden="true" size={18} />
                    {step.label}
                  </button>
                );
              })}
            </div>

            <div className="quantity-check">
              <ListChecks aria-hidden="true" size={18} />
              <span>派工数量 {salesOrder.quantity}</span>
              <span>验收数量 {salesOrder.quantity}</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone = "neutral"
}: {
  icon: typeof BadgeDollarSign;
  label: string;
  value: string;
  tone?: "neutral" | "success" | "danger";
}) {
  return (
    <div className={`metric-card ${tone}`}>
      <div className="metric-icon">
        <Icon aria-hidden="true" size={19} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="calc-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
