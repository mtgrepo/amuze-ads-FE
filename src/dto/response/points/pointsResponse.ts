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
