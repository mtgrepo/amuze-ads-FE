import { NotiComponent } from "../../components/Notifications/noti_component";
import { useNotificationsQuery } from "../../Composable/Query/notifications/useNotificationsQuery"

export default function NotificationsPage() {
  const { notificationsData, isLoading } = useNotificationsQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <p className="items-center justify-center text-center my-auto">Loading.....</p> : <NotiComponent data={notificationsData ?? []}/> }
    </div>
  )
}
