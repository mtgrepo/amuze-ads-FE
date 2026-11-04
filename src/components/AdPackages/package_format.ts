/** "1,000 pts" */
export const pts = (v: number) => `${(Number.isFinite(v) ? v : 0).toLocaleString("en-US")} pts`
/** "per day", "per 30 days" */
export const perDays = (days: number) => `per ${days === 1 ? "day" : `${(Number.isFinite(days) ? days : 0).toLocaleString("en-US")} days`}`
