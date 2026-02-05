import { PostComponent } from "../../../components/Content/Posts/post_component";
import { usePostListQuery } from "../../../Composable/Query/content/posts/usePostListQuery"

export default function PostPage() {
    const { postListData, isLoading} = usePostListQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <p className="items-center justify-center text-center my-auto">Loading.....</p> : <PostComponent data={postListData ?? []}/> }
    </div>
  )
}
