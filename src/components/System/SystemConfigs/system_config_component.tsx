import * as React from "react";
import {
  CirclePlus,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  XCircle,
  Pencil,
  PowerOff,
  Search,
  Settings2,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DrawerFormLayout from "../../Common/Layout/drawer_form_layout";
import DrawerButton from "../../Common/drawer-button";
import SystemConfigForm from "./system_config_form";
import type { SystemConfigResponse } from "../../../dto/response/System/systemConfigResponse";
import { useSystemConfigActiveCommand } from "../../../Composable/Command/system/useSystemConfigInactiveCommand";

type SystemConfigProps = {
  data: SystemConfigResponse[];
};

/** Turn "max_retry_count" into "Max Retry Count" */
function humanize(key: string) {
  return key
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SystemConfigComponent({ data }: SystemConfigProps) {
  const [search, setSearch] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editConfig, setEditConfig] =
    React.useState<SystemConfigResponse | null>(null);
  const [toggleOpen, setToggleOpen] = React.useState(false);
  const [toggleConfig, setToggleConfig] =
    React.useState<SystemConfigResponse | null>(null);

  const { setActiveCommand } = useSystemConfigActiveCommand();

  const filteredData = React.useMemo(() => {
    if (!search.trim()) return data;
    const lower = search.toLowerCase();
    return data.filter(
      (item) =>
        item.category.toLowerCase().includes(lower) ||
        item.configKey.toLowerCase().includes(lower) ||
        item.description?.toLowerCase().includes(lower)
    );
  }, [data, search]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, SystemConfigResponse[]>();
    for (const item of filteredData) {
      const existing = map.get(item.category);
      if (existing) {
        existing.push(item);
      } else {
        map.set(item.category, [item]);
      }
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredData]);

  const handleToggleActive = async () => {
    if (!toggleConfig) return;
    await setActiveCommand({ id: toggleConfig.id, isActive: !toggleConfig.isActive });
    setToggleOpen(false);
    setToggleConfig(null);
  };

  const handleEditOpen = (config: SystemConfigResponse) => {
    setEditConfig(config);
    setEditOpen(true);
  };

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Search & Add */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search settings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-2 rounded-lg"
            />
          </div>
          <DrawerFormLayout
            open={addOpen}
            setOpen={setAddOpen}
            title="System Config Form"
            description="Add system config here."
            formContent={
              <SystemConfigForm
                mode="add"
                onSuccess={() => setAddOpen(false)}
              />
            }
            cancelButton={
              <Button variant="outline" className="w-full my-3">
                Cancel
              </Button>
            }
            drawerButton={
              <DrawerButton btn_icon={CirclePlus} title="Add Config" />
            }
          />
        </CardContent>
      </Card>

      {/* Category Cards */}
      {grouped.length === 0 ? (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-muted/60 p-4">
                <Settings className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No settings found.</p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl mt-2"
                onClick={() => setAddOpen(true)}
              >
                <CirclePlus className="h-4 w-4" />
                Add Config
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        grouped.map(([category, items]) => (
          <CategoryCard
            key={category}
            category={category}
            items={items}
            onEdit={handleEditOpen}
            onToggleActive={(config) => {
              setToggleConfig(config);
              setToggleOpen(true);
            }}
          />
        ))
      )}

      {/* Edit Drawer */}
      {editConfig && (
        <DrawerFormLayout
          open={editOpen}
          setOpen={(open) => {
            setEditOpen(open);
            if (!open) setEditConfig(null);
          }}
          title="Edit System Config"
          description="Update system config information below."
          formContent={
            <SystemConfigForm
              mode="edit"
              defaultValues={{
                id: editConfig.id,
                category: editConfig.category,
                configKey: editConfig.configKey,
                configValue: JSON.stringify(editConfig.configValue, null, 2),
                description: editConfig.description,
              }}
              onSuccess={() => {
                setEditOpen(false);
                setEditConfig(null);
              }}
            />
          }
          cancelButton={
            <Button variant="outline" className="w-full my-3">
              Cancel
            </Button>
          }
        />
      )}

      {/* Toggle Active Dialog */}
      <Dialog open={toggleOpen} onOpenChange={setToggleOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {toggleConfig?.isActive ? "Turn Off Setting" : "Turn On Setting"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {toggleConfig?.isActive ? "turn off" : "turn on"}{" "}
              <strong>
                {toggleConfig ? humanize(toggleConfig.configKey) : ""}
              </strong>
              ?{" "}
              {toggleConfig?.isActive
                ? "This setting will become inactive and stop being applied."
                : "This setting will become active and start being applied."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setToggleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={toggleConfig?.isActive ? "destructive" : "default"}
              onClick={handleToggleActive}
            >
              {toggleConfig?.isActive ? "Turn Off" : "Turn On"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Category Card ── */

type CategoryCardProps = {
  category: string;
  items: SystemConfigResponse[];
  onEdit: (config: SystemConfigResponse) => void;
  onToggleActive: (config: SystemConfigResponse) => void;
};

function CategoryCard({
  category,
  items,
  onEdit,
  onToggleActive,
}: CategoryCardProps) {
  const [open, setOpen] = React.useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="rounded-2xl shadow-sm overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-6 py-5 bg-muted/30 border-b cursor-pointer select-none hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Settings2 className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-base font-semibold capitalize">
                {category}
              </h3>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {items.length} {items.length === 1 ? "setting" : "settings"}
              </span>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-5">
            <div className="space-y-3">
              {items.map((config) => (
                <ConfigRow
                  key={config.id}
                  config={config}
                  onEdit={() => onEdit(config)}
                  onToggleActive={() => onToggleActive(config)}
                />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

/* ── Config Row ── */

type ConfigRowProps = {
  config: SystemConfigResponse;
  onEdit: () => void;
  onToggleActive: () => void;
};

function ConfigRow({ config, onEdit, onToggleActive }: ConfigRowProps) {
  const [valueOpen, setValueOpen] = React.useState(false);
  const jsonStr = JSON.stringify(config.configValue, null, 2);

  return (
    <div className="rounded-xl bg-muted/40 p-4 space-y-3">
      {/* Row 1: Name + Status badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <h4 className="font-semibold text-sm">
            {humanize(config.configKey)}
          </h4>
          {config.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {config.description}
            </p>
          )}
        </div>

        {config.isActive ? (
          <CircleCheck className="h-5 w-5 text-green-600 shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
        )}
      </div>

      {/* Row 2: View Value toggle */}
      <button
        type="button"
        onClick={() => setValueOpen(!valueOpen)}
        className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
      >
        {valueOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {valueOpen ? "Hide value" : "View value"}
      </button>

      {valueOpen && (
        <pre className="text-xs bg-background/80 border rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap break-all max-h-48">
          {jsonStr}
        </pre>
      )}

      {/* Row 3: Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" className="h-8" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 ${config.isActive ? "text-destructive hover:text-destructive" : ""}`}
          onClick={onToggleActive}
        >
          <PowerOff className="h-3.5 w-3.5" />
          {config.isActive ? "Turn Off" : "Turn On"}
        </Button>
      </div>
    </div>
  );
}
