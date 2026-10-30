/** A time package admins sell; customers buy it in whole units. */
export interface AdPackageResponse {
    id: string;
    name: string;
    /** Days one unit covers. */
    durationDays: number;
    /** Points for one unit. */
    price: number;
    description: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

/** "1 day", "30 days" */
export const daysLabel = (days: number) => `${days.toLocaleString()} ${days === 1 ? "day" : "days"}`;
