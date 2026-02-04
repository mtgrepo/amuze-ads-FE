import { AdminComponent } from "../../../components/System/AdminUsers/admin_component";
import { useAdminUserQuery } from "../../../Composable/Query/system/useAdminUserQuery"


export default function AdminUsers() {
  const { adminUserQueryData, isLoading} = useAdminUserQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <p className="items-center justify-center text-center my-auto">Loading.....</p> : <AdminComponent data={adminUserQueryData ?? []}/> }
    </div>
  )
}
