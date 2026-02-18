import { useMutation, useQueryClient } from "@tanstack/react-query"
import { verifyAdvertiser } from "../../../http/apis/advertisers/advertisersApi"
import { toast } from "sonner";

export const useAdvertiserVerifyCommand = () => {
    const qc = useQueryClient();
    const verifyAdvertiserMutation = useMutation({
        mutationKey: ["verify-advertiser-command"],
        mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
            const response = await verifyAdvertiser(id, verified);
            return response?.data;
        },
        onSuccess: () => {
            toast.success("Advertiser verified successfully!");
            qc.invalidateQueries({ queryKey: ["advertisers"] });
        }
    })
    return {
        verifyAdvertiserCommand: verifyAdvertiserMutation.mutateAsync,
        isPending: verifyAdvertiserMutation.isPending,
        isError: verifyAdvertiserMutation.isError
    }
}
