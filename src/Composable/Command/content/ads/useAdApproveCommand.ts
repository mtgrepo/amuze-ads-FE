import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { approveAd } from "../../../../http/apis/content/adApi";

export const useAdApproveCommand = () => {
    const qc = useQueryClient();

    const adApproveMutation = useMutation({
        mutationKey: ['approve-ad'],
        mutationFn: async (id: string) => {
            const response = await approveAd(id);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['ad-list'] });
            toast.success('Ad approved successfully.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to approve ad.');
        }
    })

    return {
        approveAdCommand: adApproveMutation.mutateAsync,
        isPending: adApproveMutation.isPending,
        isError: adApproveMutation.isError
    }
}
