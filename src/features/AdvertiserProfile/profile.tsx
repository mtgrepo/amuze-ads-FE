import { ProfileComponent } from "../../components/AdvertiserProfiles/profile_component";
import { useProfileListQuery } from "../../Composable/Query/advertiserProfiles/useProfileListQuery"


export default function ProfilePage() {
    const { profileListData, isLoading} = useProfileListQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <p className="items-center justify-center text-center my-auto">Loading.....</p> : <ProfileComponent data={profileListData ?? []}/> }
    </div>
  )
}
