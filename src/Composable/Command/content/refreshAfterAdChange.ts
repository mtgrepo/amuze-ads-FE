import type { QueryClient } from "@tanstack/react-query";

/**
 * Everything that shows an ad or campaign. An ad can be acted on from the list, its side panel or its detail
 * page, so any action that changes one refreshes all of them, plus the money and counts it touches.
 */
const AFFECTED_QUERIES = [
    ["ad-list"],
    ["ad-details"],
    ["ad-set-list"],
    ["campaign-list"],
    ["campaign-extensions"],
    ["campaign-objectives"],
    ["payment-info"],
    ["wallet"],
    ["points-ledger"],
    ["transaction-list"],
    ["dashboard-attention"],
    ["dashboard-summary"],
    ["dashboard-points"],
    ["notifications"],
];

/** Shared by every ad and campaign command. Not a hook: it takes the query client they already have. */
export function refreshAfterAdChange(qc: QueryClient): void {
    AFFECTED_QUERIES.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
}
