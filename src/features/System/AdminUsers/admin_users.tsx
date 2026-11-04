import { AdminComponent } from "../../../components/System/AdminUsers/admin_component";
import { useAdminUserQuery } from "../../../Composable/Query/system/useAdminUserQuery"

function AdminUsersLoading() {
  return (
    <div role="status" aria-label="Loading admin users" className="flex flex-col gap-5">
      <div className="h-8 w-44 animate-pulse rounded-lg bg-muted" />
      <div className="h-14 animate-pulse rounded-xl bg-muted/70" />
      <div className="overflow-hidden rounded-[14px] border bg-card">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-4 last:border-b-0">
            <div className="size-8 animate-pulse rounded-full bg-muted" />
            <div className="h-3 flex-1 animate-pulse rounded bg-muted" style={{ maxWidth: `${55 - i * 5}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { adminUserQueryData, isLoading } = useAdminUserQuery();
  return (
    <div className="w-full px-4 py-6 lg:px-6">
      {isLoading ? <AdminUsersLoading /> : <AdminComponent data={adminUserQueryData ?? []} />}
    </div>
  )
}
