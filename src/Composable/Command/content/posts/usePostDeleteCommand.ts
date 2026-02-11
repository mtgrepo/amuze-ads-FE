import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";
import { deletePost } from "../../../../http/apis/content/postApi";

export const usePostDeleteCommand = () => {
    const qc = useQueryClient();

    const postDeleteCommand = useMutation({
        mutationKey: ['delete-post'],
        mutationFn: async (id: string) => {
            const response = await deletePost(id);
            return response?.data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['post-list'] });
            toast.success('Post deleted successfully.');
        }
    })
    return {
        deletePostCommand: postDeleteCommand.mutateAsync,
        isPending: postDeleteCommand.isPending,
        isError: postDeleteCommand.isError
    }
}