import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createPost } from "../../../../http/apis/content/postApi";

export const usePostCreateCommand = () => {
    const qc = useQueryClient();
    const postCreateMutation = useMutation({
         mutationKey: ['create-post'],
         mutationFn: async (data: FormData) => {
             const response = await createPost(data)
             return response?.data;
         },
         onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['post-list'] });
            toast.success('Post created successfully.');
         },
         onError: (error) => {
             toast.error( error?.message || 'Post creation failed.');
         }
    })
    return {
        createPostCommand: postCreateMutation.mutateAsync,
        isPending: postCreateMutation.isPending,
        isError: postCreateMutation.isError
    }
}