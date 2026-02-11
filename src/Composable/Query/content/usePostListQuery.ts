import { useQuery } from "@tanstack/react-query"
import type { PostResponse } from "../../../dto/response/content/postResponse";
import { getAllPosts } from "../../../http/apis/content/postApi";

export const usePostListQuery = () => {
    const postListData = useQuery({
        queryKey: ['post-list'],
        queryFn: async () : Promise<PostResponse[]> => {
            const response = await getAllPosts();
            return response?.data;
        }
    })
    return {
        postListData: postListData?.data,
        isLoading: postListData?.isLoading,
        isError: postListData?.isError
    }
}