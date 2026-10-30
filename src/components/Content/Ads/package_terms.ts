// Package pricing shared by the package picker, the create form and the draft budget form.

/** Longest a campaign may run; the server enforces the same limit. */
export const MAX_RUN_DAYS = 366;

/** The parts of a package an ad is priced from: a package on sale, or the copy a draft already holds. */
export interface PackageTerms {
    id: string;
    name: string;
    durationDays: number;
    price: number;
    description?: string | null;
    /** Not on sale any more, or on sale at a different price; the draft keeps its own copy. */
    ownCopy?: boolean;
}

export interface PackageChoice {
    packageId: string;
    packageQuantity: number;
    startDate?: Date;
}

export interface PackageSummary {
    terms?: PackageTerms;
    runDays: number;
    endDate?: Date;
    planCost: number;
    tooLong: boolean;
}

/** Packages to offer: the ones on sale, with a draft's own copy of its package in place of (or ahead of) the live one. */
export function offeredPackages(onSale: PackageTerms[], current?: PackageTerms): PackageTerms[] {
    if (!current) return onSale;
    const live = onSale.find((p) => p.id === current.id);
    const own = { ...current, description: live?.description ?? current.description, ownCopy: !live || live.price !== current.price || live.durationDays !== current.durationDays };
    return live ? onSale.map((p) => (p.id === current.id ? own : p)) : [own, ...onSale];
}

/** A number field's text as a whole count: blank, negative or fractional input rounds down to what can be bought. */
export const wholeNumber = (text: string) => Math.max(0, Math.trunc(Number(text)) || 0);

/** Run length, end date and price for a choice. */
export function summarize(choice: PackageChoice, packages: PackageTerms[]): PackageSummary {
    const terms = packages.find((p) => p.id === choice.packageId);
    const quantity = Number.isInteger(choice.packageQuantity) && choice.packageQuantity >= 1 ? choice.packageQuantity : 0;
    const runDays = terms ? terms.durationDays * quantity : 0;
    let endDate: Date | undefined;
    if (choice.startDate && runDays > 0) {
        endDate = new Date(choice.startDate);
        endDate.setDate(endDate.getDate() + runDays - 1);
    }
    return { terms, runDays, endDate, planCost: terms ? terms.price * quantity : 0, tooLong: runDays > MAX_RUN_DAYS };
}
