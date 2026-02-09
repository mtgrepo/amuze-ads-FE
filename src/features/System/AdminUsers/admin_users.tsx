import { AdminComponent } from "../../../components/System/AdminUsers/admin_component";
import { TableSkeleton } from "../../../components/Common/Skeleton/table_skeleton";
import { useAdminUserQuery } from "../../../Composable/Query/system/useAdminUserQuery"


export default function AdminUsers() {
  const { adminUserQueryData, isLoading} = useAdminUserQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <TableSkeleton filters={1} /> : <AdminComponent data={adminUserQueryData ?? []}/> }
    </div>
  )
}
