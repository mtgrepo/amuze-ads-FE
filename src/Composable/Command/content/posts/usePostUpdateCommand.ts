import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { updatePost } from "../../../../http/apis/content/postApi";

export const usePostUpdateCommand = () => {
    const qc = useQueryClient();
    const postUpdateMutation = useMutation({
        mutationKey: ['update-post'],
        mutationFn: async ({ id, data }: { id: string, data: FormData }) => {
            const response = await updatePost(id, data)
            return response?.data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['post-list'] });
            toast.success('Post updated successfully.');
        }
    })
    return {
        updatePostCommand: postUpdateMutation.mutateAsync,
        isPending: postUpdateMutation.isPending,
        isError: postUpdateMutation.isError
    }
}