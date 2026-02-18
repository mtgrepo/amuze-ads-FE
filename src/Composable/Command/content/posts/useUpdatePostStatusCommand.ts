import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { updatePostStatus } from "../../../../http/apis/content/postApi";

export const useUpdatePostStatusCommand = () => {
    const qc = useQueryClient();
    const postStatusUpdateMutation = useMutation({
        mutationKey: ['update-post-status'],
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const response = await updatePostStatus(id, status)
            return response?.data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['post-list'] });
            toast.success('Post Status updated successfully.');
        }
    })
    return {
        updatePostStatusCommand: postStatusUpdateMutation.mutateAsync,
        isPending: postStatusUpdateMutation.isPending,
        isError: postStatusUpdateMutation.isError
    }
}