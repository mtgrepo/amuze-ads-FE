import { useMutation, useQueryClient } from "@tanstack/react-query"
import { verifyAdvertiser } from "../../../http/apis/advertisers/advertisersApi"

export const useAdvertiserVerifyCommand = () => {
    const qc = useQueryClient();
    const verifyAdvertiserMutation = useMutation({
        mutationKey: ["verify-advertiser-command"],
        mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
            const response = await verifyAdvertiser(id, verified);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["advertiser-details"] });
            qc.invalidateQueries({ queryKey: ["advertisers-list"] });
            qc.invalidateQueries({ queryKey: ["advertisers"] });
        }
    })
    return {
        verifyAdvertiserCommand: verifyAdvertiserMutation.mutateAsync,
        isPending: verifyAdvertiserMutation.isPending,
        isError: verifyAdvertiserMutation.isError
    }
}
