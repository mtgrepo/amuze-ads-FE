import { NotiComponent } from "../../components/Notifications/noti_component";
import { useNotificationsQuery } from "../../Composable/Query/notifications/useNotificationsQuery"

function NotificationsLoading() {
  return (
    <div role="status" aria-label="Loading notifications" className="flex flex-col gap-5">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-[1_1_380px] overflow-hidden rounded-[14px] border bg-card">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 border-b px-4 py-4 last:border-b-0">
              <div className="h-3 animate-pulse rounded bg-muted" style={{ maxWidth: `${70 - i * 5}%` }} />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted/70" />
            </div>
          ))}
        </div>
        <div className="h-64 flex-[1.4_1_420px] animate-pulse rounded-[14px] border bg-card" />
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { notificationsData, isLoading } = useNotificationsQuery();
  return (
    <div className="w-full px-4 py-6 lg:px-6">
      {isLoading ? <NotificationsLoading /> : <NotiComponent data={notificationsData ?? []} />}
    </div>
  )
}
