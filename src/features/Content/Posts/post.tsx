import { PostComponent } from "../../../components/Content/Posts/post_component";
import { TableSkeleton } from "../../../components/Common/Skeleton/table_skeleton";
import { usePostListQuery } from "@/Composable/Query/content/usePostListQuery";

export default function PostPage() {
    const { postListData, isLoading} = usePostListQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <TableSkeleton filters={3} /> : <PostComponent data={postListData ?? []}/> }
    </div>
  )
}
