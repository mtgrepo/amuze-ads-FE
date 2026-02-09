import { ProfileComponent } from "../../components/AdvertiserProfiles/profile_component";
import { TableSkeleton } from "../../components/Common/Skeleton/table_skeleton";
import { useProfileListQuery } from "../../Composable/Query/advertiserProfiles/useProfileListQuery"


export default function ProfilePage() {
    const { profileListData, isLoading} = useProfileListQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <TableSkeleton filters={2} /> : <ProfileComponent data={profileListData ?? []}/> }
    </div>
  )
}
