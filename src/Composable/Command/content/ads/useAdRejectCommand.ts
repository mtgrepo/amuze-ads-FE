import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { rejectAd } from "../../../../http/apis/content/adApi";
import { refreshAfterAdChange } from "../refreshAfterAdChange";

export const useAdRejectCommand = () => {
    const qc = useQueryClient();

    const adRejectMutation = useMutation({
        mutationKey: ['reject-ad'],
        mutationFn: async (id: string) => {
            const response = await rejectAd(id);
            return response?.data;
        },
        onSuccess: () => {
            refreshAfterAdChange(qc);
            toast.success('Ad rejected.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reject ad.');
        }
    })

    return {
        rejectAdCommand: adRejectMutation.mutateAsync,
        isPending: adRejectMutation.isPending,
        isError: adRejectMutation.isError
    }
}
