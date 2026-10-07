export interface TransactionResponse {
    id: string,
    amount: number,
    paymentMethod: string,
    referenceType: string,
    referenceId: string,
    createdAt: string,
    advertiser: {
        id: string,
        name: string,
        email: string,
    },
}

/** What the money paid for. Every transaction is money received. */
export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
    point_purchase: "Points purchase",
    admin_top_up: "Top-up paid to admin",
};
