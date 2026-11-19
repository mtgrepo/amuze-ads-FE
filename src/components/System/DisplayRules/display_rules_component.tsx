import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AD_TYPE_OPTIONS, DISPLAY_FORMATS } from "../../Content/Ads/ad_formats";
import { useDisplayRuleUpdateCommand } from "../../../Composable/Command/displayRules/useDisplayRuleUpdateCommand";
import type { DisplayRule, DisplayRuleInput, VideoPosition } from "../../../dto/response/displayRules/displayRulesResponse";

const POSITION_LABEL: Record<VideoPosition, string> = { start: "start", middle: "middle", either: "start or middle" };

/** What the admin is editing, as text so a field can be cleared while typing. */
interface Draft {
    enabled: boolean;
    everyMin: string;
    everyMax: string;
    cooldownMinutes: string;
    videoPosition: VideoPosition;
    modules: string;
}

const toDraft = (r: DisplayRule): Draft => ({
    enabled: r.enabled,
    everyMin: String(r.every?.min ?? ""),
    everyMax: String(r.every?.max ?? ""),
    cooldownMinutes: String(r.cooldownMinutes ?? ""),
    videoPosition: r.videoPosition ?? "either",
    modules: (r.modules ?? []).join(", "),
});

const whole = (v: string) => (/^\d+$/.test(v.trim()) ? Number(v) : NaN);
const splitModules = (v: string) => [...new Set(v.split(",").map((m) => m.trim()).filter(Boolean))];

/** The first problem with the draft, or null. Matches the backend's limits. */
function problem(rule: DisplayRule, d: Draft): string | null {
    if (rule.editable.includes("every")) {
        const min = whole(d.everyMin), max = whole(d.everyMax);
        if (!(min >= 1 && min <= 100) || !(max >= 1 && max <= 100)) return `Use whole numbers from 1 to 100 ${rule.unit ?? "items"}.`;
        if (min > max) return "The first number can't be more than the second.";
    }
    if (rule.editable.includes("cooldownMinutes")) {
        const m = whole(d.cooldownMinutes);
        if (!(m >= 0 && m <= 1440)) return "Wait must be 0 to 1,440 minutes.";
    }
    if (rule.editable.includes("modules") && splitModules(d.modules).some((m) => m.length > 50)) return "Each module name can be up to 50 characters.";
    return null;
}

function changes(rule: DisplayRule, d: Draft): DisplayRuleInput {
    const out: DisplayRuleInput = {};
    if (d.enabled !== rule.enabled) out.enabled = d.enabled;
    if (rule.editable.includes("every")) {
        if (whole(d.everyMin) !== rule.every?.min) out.everyMin = whole(d.everyMin);
        if (whole(d.everyMax) !== rule.every?.max) out.everyMax = whole(d.everyMax);
    }
    if (rule.editable.includes("cooldownMinutes") && whole(d.cooldownMinutes) !== rule.cooldownMinutes) out.cooldownMinutes = whole(d.cooldownMinutes);
    if (rule.editable.includes("videoPosition") && d.videoPosition !== rule.videoPosition) out.videoPosition = d.videoPosition;
    if (rule.editable.includes("modules")) {
        const next = splitModules(d.modules);
        if (next.join("\n") !== (rule.modules ?? []).join("\n")) out.modules = next;
    }
    return out;
}

const NUM = "h-8 w-16 bg-card px-2 text-center font-mono tabular-nums";

function NumberBox({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled: boolean }) {
    return <Input aria-label={label} inputMode="numeric" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={NUM} />;
}

/** The "when" sentence with the editable numbers in place. */
function WhenText({ rule, d, set, off }: { rule: DisplayRule; d: Draft; set: (patch: Partial<Draft>) => void; off: boolean }) {
    const range = (
        <span className="inline-flex items-center gap-1.5">
            <NumberBox label="From" value={d.everyMin} onChange={(v) => set({ everyMin: v })} disabled={off} />
            <span className="text-muted-foreground">to</span>
            <NumberBox label="To" value={d.everyMax} onChange={(v) => set({ everyMax: v })} disabled={off} />
        </span>
    );
    const wait = (
        <span className="inline-flex flex-wrap items-center gap-1.5">
            then wait <NumberBox label="Minutes to wait" value={d.cooldownMinutes} onChange={(v) => set({ cooldownMinutes: v })} disabled={off} /> minutes after it's closed
        </span>
    );
    switch (rule.trigger) {
        case "page_open":
            return <>When the user opens the page, {wait}</>;
        case "app_open":
            return <>When the user reaches the home page after opening the app. Once each time the app opens.</>;
        case "after_items":
            return <span className="inline-flex flex-wrap items-center gap-1.5">After every {range} {rule.unit ?? "items"}. The count starts again after each ad.</span>;
        case "content_open":
            return <>Every time the user opens a different piece of content.</>;
        case "content_complete":
            return <>When the user finishes a piece of content, {wait}</>;
        case "video_play":
            return (
                <span className="inline-flex flex-wrap items-center gap-1.5">
                    Every {range} videos, at the
                    <Select value={d.videoPosition} onValueChange={(v) => set({ videoPosition: v as VideoPosition })} disabled={off}>
                        <SelectTrigger size="sm" aria-label="Where in the video" className="h-8 w-[156px] bg-card"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {(Object.keys(POSITION_LABEL) as VideoPosition[]).map((p) => <SelectItem key={p} value={p}>{POSITION_LABEL[p]}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    of the video.
                </span>
            );
        case "download_all":
            return <>When the user downloads all the free episodes.</>;
        case "module_switch":
            return (
                <span className="flex flex-col gap-1.5">
                    When the user switches to one of these modules:
                    <Input aria-label="Modules" value={d.modules} disabled={off} onChange={(e) => set({ modules: e.target.value })} placeholder="e.g. Muze, Museum, Muzebox" className="h-8 max-w-[420px] bg-card" />
                    <span className="text-xs text-muted-foreground">Separate names with commas. With none listed, this pop-up never shows. Use the names the app team gives you.</span>
                </span>
            );
    }
}

function SlotRow({ rule }: { rule: DisplayRule }) {
    const [draft, setDraft] = React.useState(() => toDraft(rule));
    const { updateDisplayRule, isPending } = useDisplayRuleUpdateCommand();
    const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
    const placement = DISPLAY_FORMATS[rule.type]?.find((p) => p.value === rule.placement)?.label ?? rule.placement;
    const error = problem(rule, draft);
    const patch = changes(rule, draft);
    const dirty = Object.keys(patch).length > 0;

    const save = async () => {
        if (error || !dirty) return;
        try {
            await updateDisplayRule({ type: rule.type, placement: rule.placement, data: patch });
        } catch {
            // The command shows the error; keep the draft so it can be fixed.
        }
    };

    return (
        <div className="flex flex-wrap items-start gap-x-5 gap-y-3 border-b px-[18px] py-4 last:border-b-0">
            <div className="flex w-[180px] flex-none flex-col gap-0.5">
                <span className="font-medium">{placement}</span>
                <span className="font-mono text-xs text-muted-foreground">{rule.placement}</span>
            </div>
            <div className={cn("min-w-0 flex-[1_1_360px] text-sm leading-8", !draft.enabled && "text-muted-foreground")}>
                <WhenText rule={rule} d={draft} set={set} off={!draft.enabled} />
                {error && dirty && <div className="text-xs leading-5 text-destructive">{error}</div>}
            </div>
            <div className="flex flex-none items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                    <Switch checked={draft.enabled} onCheckedChange={(on) => set({ enabled: on })} aria-label={`Show ${placement}`} />
                    {draft.enabled ? "On" : "Off"}
                </label>
                {dirty && (
                    <>
                        <Button size="sm" variant="ghost" onClick={() => setDraft(toDraft(rule))} disabled={isPending}>Undo</Button>
                        <Button size="sm" onClick={() => void save()} disabled={isPending || !!error}>{isPending ? "Saving…" : "Save"}</Button>
                    </>
                )}
            </div>
        </div>
    );
}

/** Settings → Ad display rules: when the AMUZE app shows each ad slot, and how often. */
export function DisplayRulesComponent({ rules }: { rules: DisplayRule[] }) {
    return (
        <div className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-col gap-[18px]">
            <header className="flex flex-col gap-1">
                <h1 className="text-[26px] font-semibold tracking-tight">Ad display rules</h1>
                <p className="max-w-[760px] text-muted-foreground">
                    When the AMUZE app shows each kind of ad, and how often. The app loads these when it starts, and waits and counts start again each time it restarts.
                    A slot that's off isn't shown, even if ads are booked for it.
                </p>
            </header>

            {AD_TYPE_OPTIONS.map((type) => {
                const slots = rules.filter((r) => r.type === type.value);
                if (!slots.length) return null;
                return (
                    <section key={type.value} aria-labelledby={`rules-${type.value}`} className="flex flex-col gap-2.5">
                        <h2 id={`rules-${type.value}`} className="text-[15px] font-semibold">{type.label}</h2>
                        <div className="rounded-[14px] border bg-card">
                            {/* Keyed on updatedAt so a saved row starts again from what was saved. */}
                            {slots.map((r) => <SlotRow key={`${r.placement}-${r.updatedAt ?? "default"}`} rule={r} />)}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
