import { SystemConfigComponent } from "../../../components/System/SystemConfigs/system_config_component";
import { useSystemConfigQuery } from "../../../Composable/Query/system/useSystemConfigQuery"

function SystemConfigsLoading() {
  return (
    <div role="status" aria-label="Loading system configs" className="flex flex-col gap-5">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex max-w-[260px] flex-[1_1_200px] flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-9 animate-pulse rounded-lg bg-muted/70" />)}
        </div>
        <div className="flex min-w-0 flex-[4_1_520px] flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-[14px] border bg-card" />)}
        </div>
      </div>
    </div>
  );
}

export default function SystemConfigs() {
  const { systemConfigQueryData, isLoading } = useSystemConfigQuery();
  return (
    <div className="w-full px-4 py-6 lg:px-6">
      {isLoading ? <SystemConfigsLoading /> : <SystemConfigComponent data={systemConfigQueryData ?? []} />}
    </div>
  )
}
