export type PointLedgerType = "purchase" | "admin_paid" | "admin_bonus" | "spend" | "refund";

export interface PointLedgerEntry {
    id: string,
    advertiserId: string,
    type: PointLedgerType,
    amount: number,
    balanceAfter: number,
    referenceType: string | null,
    referenceId: string | null,
    note: string | null,
    createdByAdminId: string | null,
    createdAt: string
}

export interface WalletResponse {
    balance: number,
    history: PointLedgerEntry[]
}

export interface PaymentInfoResponse {
    amount: number,
    payerId: string,
    payerName: string,
    balance: number
}

export const POINT_TYPE_LABELS: Record<PointLedgerType, string> = {
    purchase: "Bought (KBZPay)",
    admin_paid: "Top-up (paid)",
    admin_bonus: "Top-up (bonus)",
    spend: "Ad payment",
    refund: "Refund",
};

/** A ledger entry on the admin points page, with the wallet it belongs to. */
export interface AdminLedgerEntry extends PointLedgerEntry {
    advertiser: { id: string, name: string, type: "agency" | "advertiser" } | null
}

/** One transaction with what it links to (GET /points/ledger/:id). */
export interface LedgerEntryDetail {
    entry: PointLedgerEntry & { balanceBefore: number },
    wallet: { id: string, name: string, type: "agency" | "advertiser", email: string | null },
    /** The money behind a purchase or a paid top-up. */
    payment: { id: string, paymentMethod: string, amount: number, createdAt: string } | null,
    /** The ad it paid for or refunded. adId opens the ad page; null if the ad has no creative yet. */
    campaign: {
        id: string, name: string, status: string, startDate: string, endDate: string,
        packageName: string, packageQuantity: number, packageDays: number, totalBudget: number,
        adId: string | null, advertiser: { id: string, name: string },
    } | null,
    extension: {
        id: string, status: string, days: number, quantity: number, amount: number,
        startDate: string, previousEndDate: string, newEndDate: string, createdAt: string, reviewedAt: string | null,
    } | null,
    /** The admin who made it (top-ups, rejected extension refunds). */
    admin: { id: string, name: string } | null,
    /** Other entries for the same ad or extension, e.g. its payment and refund. */
    related: { id: string, type: PointLedgerType, amount: number, note: string | null, createdAt: string }[],
}

export interface PointsLedgerResponse {
    /** Points all customers hold right now. */
    totalBalance: number,
    entries: AdminLedgerEntry[]
}
