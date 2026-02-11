import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { updateAdStatus } from "@/http/apis/Content/adApi";

export const useUpdateAdStatusCommand = () => {
    const qc = useQueryClient();

    const adStatusMutation = useMutation({
        mutationKey: ['update-ad-status'],
        mutationFn: async ({id, status}: {id: string, status: string}) => {
            const response = await updateAdStatus(id, status);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['ad-list'] });
            toast.success('Ad status updated successfully.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update ad status.');
        }
    })

    return {
        updateAdStatusCommand: adStatusMutation.mutateAsync,
        isPending: adStatusMutation.isPending,
        isError: adStatusMutation.isError
    }
}
