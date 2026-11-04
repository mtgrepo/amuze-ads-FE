import { ProfileComponent } from "../../components/AdvertiserProfiles/profile_component";
import { useProfileListQuery } from "../../Composable/Query/advertiserProfiles/useProfileListQuery"

function ProfilesLoading() {
  return (
    <div role="status" aria-label="Loading profiles" className="flex flex-col gap-5">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />)}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profileListData, isLoading } = useProfileListQuery();
  return (
    <div className="w-full px-4 py-6 lg:px-6">
      {isLoading ? <ProfilesLoading /> : <ProfileComponent data={profileListData ?? []} />}
    </div>
  )
}
