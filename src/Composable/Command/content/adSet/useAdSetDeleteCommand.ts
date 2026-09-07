import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { deleteAdSet } from "../../../../http/apis/content/adSetApi";

export const useAdSetDeleteCommand = () => {
    const qc = useQueryClient();

    const adSetDeleteMutation = useMutation({
        mutationKey: ['delete-ad-set'],
        mutationFn: async (id: string) => {
            const response = await deleteAdSet(id);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['ad-set-list'] });
            toast.success('Ad set deleted successfully.');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete ad set.');
        }
    })

    return {
        deleteAdSetCommand: adSetDeleteMutation.mutateAsync,
        isPending: adSetDeleteMutation.isPending,
        isError: adSetDeleteMutation.isError
    }
}
