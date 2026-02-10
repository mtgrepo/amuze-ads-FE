import { SystemConfigComponent } from "../../../components/System/SystemConfigs/system_config_component";
import { DetailSkeleton } from "../../../components/Common/Skeleton/detail_skeleton";
import { useSystemConfigQuery } from "../../../Composable/Query/system/useSystemConfigQuery"


export default function SystemConfigs() {
  const { systemConfigQueryData, isLoading } = useSystemConfigQuery();
  return (
    <div className="w-full mx-auto px-5 ">
      {isLoading ? <DetailSkeleton sections={3} fieldsPerSection={2} /> : <SystemConfigComponent data={systemConfigQueryData ?? []} />}
    </div>
  )
}
