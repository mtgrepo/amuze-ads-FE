import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { approveExtension, rejectExtension, requestExtension } from "../../../http/apis/campaignExtension/campaignExtensionApi";

/** Everything an extension can change: the ad's dates and budget, the wallet, and the dashboard. */
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

export const useCampaignExtensionCommands = () => {
    const qc = useQueryClient();
    const refresh = () => {
        AFFECTED_QUERIES.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
        // Drop old quotes instead of refetching them: right after a request the campaign has an extension
        // under review, so a refetch would fail. The dialog fetches a fresh quote the next time it opens.
        qc.removeQueries({ queryKey: ["extension-quote"] });
    };

    const request = useMutation({
        mutationFn: ({ campaignId, newEndDate }: { campaignId: string; newEndDate: string }) => requestExtension(campaignId, newEndDate),
        onSuccess: (response) => {
            refresh();
            toast.success(response?.message ?? "Extension submitted");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const approve = useMutation({
        mutationFn: (id: string) => approveExtension(id),
        onSuccess: () => {
            refresh();
            toast.success("Extension approved");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const reject = useMutation({
        mutationFn: (id: string) => rejectExtension(id),
        onSuccess: () => {
            refresh();
            toast.success("Extension rejected and refunded");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    return {
        requestExtension: request.mutateAsync,
        isRequesting: request.isPending,
        approveExtension: approve.mutateAsync,
        rejectExtension: reject.mutateAsync,
        isReviewing: approve.isPending || reject.isPending,
    };
};
