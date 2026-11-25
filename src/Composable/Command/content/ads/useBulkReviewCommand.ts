import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { approveAd, rejectAd } from "../../../../http/apis/content/adApi";
import { refreshAfterAdChange } from "../refreshAfterAdChange";

type Decision = "approve" | "reject";

/** Approves or rejects several ads one after another, then reports once. A rejection sends the same reason for every ad. */
export const useBulkReviewCommand = () => {
    const qc = useQueryClient();
    const mutation = useMutation({
        mutationKey: ["bulk-review-ads"],
        mutationFn: async ({ ids, decision, reason = "" }: { ids: string[]; decision: Decision; reason?: string }) => {
            let done = 0;
            const failed: string[] = [];
            for (const id of ids) {
                try {
                    await (decision === "approve" ? approveAd(id) : rejectAd(id, reason));
                    done++;
                } catch (error) {
                    failed.push(error instanceof Error ? error.message : String(error));
                }
            }
            return { done, failed, decision };
        },
        onSuccess: ({ done, failed, decision }) => {
            refreshAfterAdChange(qc);
            const noun = (n: number) => `${n} ${n === 1 ? "ad" : "ads"}`;
            if (done) {
                toast.success(`${noun(done)} ${decision === "approve" ? "approved" : "rejected"}`, {
                    description: decision === "approve" ? "They start serving on their start dates." : "Their points are refunded to the advertisers.",
                });
            }
            if (failed.length) toast.error(`${noun(failed.length)} couldn't be ${decision === "approve" ? "approved" : "rejected"}`, { description: failed[0] });
        },
    });
    return { bulkReview: mutation.mutateAsync, isReviewing: mutation.isPending };
};
