import type { QueryClient } from "@tanstack/react-query";

/** Everything a campaign extension can change: the ad's dates and budget, the wallet, and the dashboard. */
const AFFECTED_QUERIES = [
    ["campaign-extensions"],
    ["ad-details"],
    ["ad-list"],
    ["campaign-list"],
    ["my-wallet"],
    ["points-ledger"],
    ["dashboard-attention"],
    ["dashboard-summary"],
];

/** Shared by the extension commands. Not a hook: it takes the query client they already have. */
export function refreshAfterExtensionChange(qc: QueryClient): void {
    AFFECTED_QUERIES.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
    // Drop old quotes instead of refetching them: right after a request the campaign has an extension
    // under review, so a refetch would fail. The dialog fetches a fresh quote the next time it opens.
    qc.removeQueries({ queryKey: ["extension-quote"] });
}
