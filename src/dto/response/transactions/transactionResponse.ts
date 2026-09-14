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
    campaign: {
        id: string,
        name: string,
    } | null,
}
