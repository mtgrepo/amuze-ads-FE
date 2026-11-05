import type { QueryClient } from "@tanstack/react-query";
import { refreshAfterAdChange } from "../content/refreshAfterAdChange";

/** Shared by the extension commands. Not a hook: it takes the query client they already have. */
export function refreshAfterExtensionChange(qc: QueryClient): void {
    refreshAfterAdChange(qc);
    // Drop old quotes instead of refetching them: right after a request the campaign has an extension
    // under review, so a refetch would fail. The dialog fetches a fresh quote the next time it opens.
    qc.removeQueries({ queryKey: ["extension-quote"] });
}
