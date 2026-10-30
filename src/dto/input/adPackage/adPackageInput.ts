export interface AdPackageInput {
    name: string;
    durationDays: number;
    price: number;
    description?: string | null;
    sortOrder?: number;
}
