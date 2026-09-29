export interface TopUpInput {
    amount: number,
    type: "paid" | "bonus",
    note: string
}
