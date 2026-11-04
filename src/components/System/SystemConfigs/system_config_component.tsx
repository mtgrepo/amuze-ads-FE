import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { safeString, usePreventScriptTag } from "@/lib/scriptTag";
import SystemConfigForm from "./system_config_form";
import { useSystemConfigActiveCommand } from "../../../Composable/Command/system/useSystemConfigInactiveCommand";
import { useSystemConfigUpdateCommand } from "../../../Composable/Command/system/useSystemConfigUpdateCommand";
import type { SystemConfigResponse } from "../../../dto/response/system/systemConfigResponse";

/** "max_retry_count" / "pricePer" → "Max retry count" / "Price per" */
function humanize(key: string) {
  const words = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// Friendlier names for categories and value keys we know about; anything else is humanized.
const CATEGORIES: Record<string, [string, string]> = {
  objective_pricing: ["Objective pricing", "What advertisers pay for impressions, clicks and watches on top of a package."],
  ad_serving: ["Ad serving", "How the app picks which ad to show."],
  notifications: ["Notifications", "Who is told about what."],
  general: ["General", "Platform-wide limits."],
};
const FIELD_LABELS: Record<string, string> = {
  price: "Price (pts)", pricePer: "Per how many", label: "Label", maxWeight: "Max weight", refreshMinutes: "Refresh every (min)",
  thresholdPoints: "Warn below (pts)", afterHours: "Remind after (hours)", maxRunDays: "Longest run (days)",
};
const categoryTitle = (c: string) => CATEGORIES[c]?.[0] ?? humanize(c);

type Scalar = string | number | boolean;
const isScalar = (v: unknown): v is Scalar => ["string", "number", "boolean"].includes(typeof v);
const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

export function SystemConfigComponent({ data }: { data: SystemConfigResponse[] }) {
  const [picked, setPicked] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [editing, setEditing] = React.useState<SystemConfigResponse | null>(null);
  const [toggling, setToggling] = React.useState<SystemConfigResponse | null>(null);
  const { setActiveCommand, isPending: toggleBusy } = useSystemConfigActiveCommand();

  const categories = React.useMemo(() => {
    const map = new Map<string, SystemConfigResponse[]>();
    for (const item of data) map.set(item.category, [...(map.get(item.category) ?? []), item]);
    for (const items of map.values()) items.sort((a, b) => a.configKey.localeCompare(b.configKey));
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  const current = categories.find(([c]) => c === picked) ?? categories[0];

  const toggle = async () => {
    if (!toggling) return;
    await setActiveCommand({ id: toggling.id, isActive: !toggling.isActive });
    setToggling(null);
  };

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-[18px] pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-semibold tracking-tight">System configs</h1>
          <p className="text-muted-foreground">Settings the platform reads while it runs. Each is shown as a small form; the JSON is still one click away.</p>
        </div>
        <Button variant="outline" className="bg-card" onClick={() => setAdding(true)}>Add setting</Button>
      </header>

      {!current ? (
        <div className="flex flex-col items-center gap-2 rounded-[14px] border bg-card px-5 py-16 text-center">
          <span className="font-medium">No settings yet</span>
          <span className="text-sm text-muted-foreground">Add the first one; the platform reads it while it runs.</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-start gap-5">
          <nav aria-label="Categories" className="flex max-w-[260px] flex-[1_1_200px] flex-col gap-0.5">
            {categories.map(([category, items]) => {
              const on = category === current[0];
              return (
                <button
                  key={category}
                  type="button"
                  aria-current={on ? "page" : undefined}
                  onClick={() => setPicked(category)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-[9px] text-left text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground",
                    on && "bg-card text-foreground ring-1 ring-border hover:bg-card"
                  )}
                >
                  {categoryTitle(category)}
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">{items.length}</span>
                </button>
              );
            })}
          </nav>

          <section className="flex min-w-0 flex-[4_1_520px] flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-[17px] font-semibold">{categoryTitle(current[0])}</h2>
              <span className="text-xs text-muted-foreground">
                {CATEGORIES[current[0]]?.[1] ?? `${current[1].length} ${current[1].length === 1 ? "setting" : "settings"} in ${current[0]}.`}
              </span>
            </div>
            {current[1].map((config) => (
              // Remount after a save so the fields start from the saved values.
              <ConfigCard key={`${config.id}-${config.updatedAt}`} config={config} onEdit={() => setEditing(config)} onToggle={() => setToggling(config)} />
            ))}
          </section>
        </div>
      )}

      <Sheet open={adding || !!editing} onOpenChange={(open) => { if (!open) { setAdding(false); setEditing(null); } }}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 bg-card p-0 sm:max-w-[480px]">
          <div className="flex flex-col gap-1 border-b px-[22px] py-5 pr-12">
            <SheetTitle className="text-[19px] font-semibold">{editing ? `Edit ${humanize(editing.configKey)}` : "Add setting"}</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {editing ? "Change any part of the setting, including its raw JSON value." : "The platform starts reading it as soon as it's saved."}
            </SheetDescription>
          </div>
          <div className="flex-1 overflow-y-auto p-[22px]">
            {editing ? (
              <SystemConfigForm
                key={editing.id}
                mode="edit"
                defaultValues={{
                  id: editing.id,
                  category: editing.category,
                  configKey: editing.configKey,
                  configValue: JSON.stringify(editing.configValue, null, 2),
                  description: editing.description,
                }}
                onSuccess={() => setEditing(null)}
              />
            ) : adding ? (
              <SystemConfigForm mode="add" onSuccess={() => setAdding(false)} />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!toggling} onOpenChange={(open) => !open && setToggling(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{toggling?.isActive ? "Turn off" : "Turn on"} {toggling ? humanize(toggling.configKey) : ""}?</DialogTitle>
            <DialogDescription>
              {toggling?.isActive ? "The platform stops using this setting." : "The platform starts using this setting."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="bg-card" onClick={() => setToggling(null)}>Cancel</Button>
            <Button variant={toggling?.isActive ? "destructive" : "default"} disabled={toggleBusy} onClick={toggle}>
              {toggleBusy && <Spinner />}
              {toggling?.isActive ? "Turn off" : "Turn on"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type FieldDef = { name: string; key: string; kind: "number" | "string" | "boolean" };

/** One setting: its top-level plain values as form fields; nested values are edited as JSON. */
function ConfigCard({ config, onEdit, onToggle }: { config: SystemConfigResponse; onEdit: () => void; onToggle: () => void }) {
  const [showJson, setShowJson] = React.useState(false);
  const { updateSystemConfigCommand, isPending } = useSystemConfigUpdateCommand();

  const value: unknown = config.configValue;
  const entries = isPlainObject(value) ? Object.entries(value) : [];
  const fields: FieldDef[] = entries
    .filter(([, v]) => isScalar(v))
    .map(([key, v], i) => ({ name: `f${i}`, key, kind: typeof v as FieldDef["kind"] }));
  const hasNested = !isPlainObject(value) || entries.some(([, v]) => !isScalar(v));

  const schema = z.object(Object.fromEntries(fields.map((f) => [
    f.name,
    f.kind === "boolean" ? z.boolean()
      : f.kind === "number" ? z.string().trim().min(1, "Required.").refine((v) => !Number.isNaN(Number(v)), "Must be a number.")
      : safeString(z.string()),
  ])));

  const defaults: Record<string, string | boolean> = Object.fromEntries(fields.map((f) => {
    const v = (value as Record<string, Scalar>)[f.key];
    return [f.name, f.kind === "boolean" ? Boolean(v) : String(v)];
  }));
  const form = useForm<Record<string, string | boolean>>({ resolver: zodResolver(schema), defaultValues: defaults });
  usePreventScriptTag(form);

  const save = async (values: Record<string, string | boolean>) => {
    const next: Record<string, unknown> = { ...(value as Record<string, unknown>) };
    for (const f of fields) {
      const v = values[f.name];
      next[f.key] = f.kind === "number" ? Number(v) : v;
    }
    await updateSystemConfigCommand({
      id: config.id,
      data: { category: config.category, configKey: config.configKey, configValue: next, description: config.description },
    });
  };

  return (
    <article className="flex flex-col gap-3.5 rounded-[14px] border bg-card px-[18px] py-4">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-semibold">{humanize(config.configKey)}</span>
          <span className="truncate font-mono text-xs text-muted-foreground">{config.category}.{config.configKey}</span>
          {config.description && <span className="text-xs text-muted-foreground">{config.description}</span>}
        </div>
        <span className={cn("inline-flex h-6 items-center rounded-xl px-[9px] text-xs font-medium", config.isActive ? "bg-success-soft text-success-soft-foreground" : "bg-muted text-foreground/70")}>
          {config.isActive ? "On" : "Off"}
        </span>
      </div>

      <Form {...form}>
        <form id={`config-${config.id}`} onSubmit={form.handleSubmit(save)} className="flex flex-col gap-3.5">
          {fields.length > 0 && (
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
              {fields.map((f) => (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem className="min-w-0 gap-1.5">
                      <FormLabel className="text-xs font-medium text-foreground/80">{FIELD_LABELS[f.key] ?? humanize(f.key)}</FormLabel>
                      <FormControl>
                        {f.kind === "boolean" ? (
                          <Switch checked={field.value as boolean} onCheckedChange={field.onChange} className="mt-2" />
                        ) : (
                          <Input
                            type="text"
                            inputMode={f.kind === "number" ? "decimal" : undefined}
                            className={cn("h-[38px] bg-card", f.kind === "number" && "font-mono tabular-nums")}
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            value={field.value as string}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          )}
          {hasNested && (
            <span className="text-xs text-muted-foreground">
              {fields.length ? "Some values are nested and are only editable as JSON." : "This value is edited as JSON."}
            </span>
          )}
        </form>
      </Form>

      {showJson && (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-[10px] bg-background p-3 font-mono text-xs tabular-nums">
          {JSON.stringify(config.configValue, null, 2)}
        </pre>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={() => setShowJson((s) => !s)} className="text-[13px] font-medium text-primary hover:underline">
          {showJson ? "Hide JSON" : "Show JSON"}
        </button>
        <button type="button" onClick={onEdit} className="text-[13px] font-medium text-primary hover:underline">Edit as JSON</button>
        <span className="ml-auto" />
        <Button type="button" variant="outline" className="h-9 bg-card text-[13px]" onClick={onToggle}>
          {config.isActive ? "Turn off" : "Turn on"}
        </Button>
        {fields.length > 0 && (
          <Button type="submit" form={`config-${config.id}`} className="h-9 text-[13px]" disabled={isPending || !form.formState.isDirty}>
            {isPending && <Spinner />}
            Save
          </Button>
        )}
      </div>
    </article>
  );
}
