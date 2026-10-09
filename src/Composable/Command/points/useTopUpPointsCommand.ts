import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { topUpPoints } from "../../../http/apis/points/pointsApi"
import type { TopUpInput } from "../../../dto/input/points/topUpInput"

export const useTopUpPointsCommand = () => {
    const qc = useQueryClient();
    const topUpMutation = useMutation({
        mutationKey: ['top-up-points'],
        mutationFn: async ({ accountId, data }: { accountId: string, data: TopUpInput }) => {
            const response = await topUpPoints(accountId, data);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['wallet'] });
            qc.invalidateQueries({ queryKey: ['points-ledger'] });
            qc.invalidateQueries({ queryKey: ['payment-info'] });
            toast.success("Points added.");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to add points.");
        },
    })
    return {
        topUpPointsCommand: topUpMutation.mutateAsync,
        isPending: topUpMutation.isPending,
    }
}
