import { z } from "zod"

/** Admin top-up: "paid" = customer paid offline (revenue), "bonus" = promotional (not revenue). */
export const topUpSchema = z.object({
    amount: z.number().int().min(1, { message: "Amount must be at least 1." }),
    type: z.enum(["paid", "bonus"]),
    note: z.string().min(1, { message: "Note is required." }),
})
