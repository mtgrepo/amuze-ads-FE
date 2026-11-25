import { format } from "date-fns";
import { toast } from "sonner";
import { downloadExcel, excelSheet, type ExcelColumn } from "@/lib/excel";
import type { IncomeCustomer, IncomePackage, IncomePeriod, IncomeResponse } from "../../../dto/response/dashboard/dashboardResponse";
import { parseLocalDate, priorRange } from "../../Dashboard/admin/dashboard_utils";

/** part ÷ whole as 0–1, or null when there's nothing to divide by. */
export const share = (part: number, whole: number) => (whole > 0 ? Math.min(1, Math.max(0, part / whole)) : null);


type SummaryRow = { label: string; current: string | number; previous: string | number | null };

const periodText = (from: string, to: string) => `${format(parseLocalDate(from), "d MMM yyyy")} – ${format(parseLocalDate(to), "d MMM yyyy")}`;

function summaryRows(income: IncomeResponse): SummaryRow[] {
    const prior = priorRange({ from: income.fromDate, to: income.toDate });
    const pair = (label: string, pick: (p: IncomePeriod) => number): SummaryRow => ({ label, current: pick(income.current), previous: pick(income.previous) });
    return [
        { label: "Period", current: periodText(income.fromDate, income.toDate), previous: periodText(prior.from, prior.to) },
        pair("Received (MMK)", (p) => p.received.total),
        pair("  KBZPay", (p) => p.received.kbzpay),
        pair("  Paid offline", (p) => p.received.offline),
        pair("Earned from ads (MMK)", (p) => p.earned.total),
        pair("  Packages", (p) => p.earned.packages),
        pair("  Objectives", (p) => p.earned.objectives),
        pair("  Extensions", (p) => p.earned.extensions),
        pair("  Refunded", (p) => p.earned.refunded),
        pair("Bonus given (points)", (p) => p.bonus),
        { label: "Unspent points, held now", current: income.unspent.points, previous: null },
        { label: "Wallets holding points, now", current: income.unspent.wallets, previous: null },
    ];
}

const SUMMARY_COLUMNS: ExcelColumn<SummaryRow>[] = [
    { header: "Figure", value: (r) => r.label },
    { header: "This period", value: (r) => r.current, format: "number" },
    { header: "Previous period", value: (r) => r.previous, format: "number" },
];

const DAILY_COLUMNS: ExcelColumn<IncomeResponse["daily"][number]>[] = [
    { header: "Date", value: (d) => d.date, format: "date" },
    { header: "Received (MMK)", value: (d) => d.received, format: "number" },
    { header: "Earned (MMK)", value: (d) => d.earned, format: "number" },
];

const customerColumns = (earnedTotal: number): ExcelColumn<IncomeCustomer>[] => [
    { header: "Customer", value: (c) => c.name },
    { header: "Type", value: (c) => (c.type === "agency" ? "Agency" : "Advertiser") },
    { header: "Earned (MMK)", value: (c) => c.earned, format: "number" },
    { header: "Received (MMK)", value: (c) => c.received, format: "number" },
    { header: "Share of earned", value: (c) => share(c.earned, earnedTotal), format: "percent" },
];

const packageColumns = (total: number): ExcelColumn<IncomePackage>[] => [
    { header: "Package", value: (p) => p.packageName },
    { header: "Ads", value: (p) => p.ads, format: "number" },
    { header: "Earned (MMK)", value: (p) => p.earned, format: "number" },
    { header: "Share", value: (p) => share(p.earned, total), format: "percent" },
];

export async function downloadIncomeReport(income: IncomeResponse) {
    const done = await downloadExcel(`income-${income.fromDate}-to-${income.toDate}`, [
        excelSheet("Summary", SUMMARY_COLUMNS, summaryRows(income)),
        excelSheet("Daily", DAILY_COLUMNS, income.daily),
        excelSheet("Top customers", customerColumns(income.current.earned.total), income.topCustomers),
        excelSheet("By package", packageColumns(income.byPackage.reduce((a, p) => a + p.earned, 0)), income.byPackage),
    ]);
    if (done) toast.success("Income downloaded", { description: periodText(income.fromDate, income.toDate) });
}
