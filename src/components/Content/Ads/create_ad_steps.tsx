import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Calendar } from "../../ui/calendar";
import ImageUpload from "../../Common/image_upload";
import { cn } from "../../../lib/utils";
import type { AdvertisersResponse } from "../../../dto/response/advertisers/advertisersResponse";
import { daysLabel } from "../../../dto/response/adPackage/adPackageResponse";
import { OBJECTIVE_LABELS, type ObjectiveInput, type ObjectivePrice, type ObjectiveType } from "../../../dto/response/campaignObjective/campaignObjectiveResponse";
import { AD_TYPE_OPTIONS, ASSET_TYPE_LABELS, type AssetType, type PlacementOption } from "./ad_formats";
import { MAX_RUN_DAYS, wholeNumber, type PackageSummary, type PackageTerms } from "./package_terms";
import { objectiveFitsAsset, priceText } from "./objective_terms";
import type { CreateAdValues } from "./create_ad_form";

type Form = UseFormReturn<CreateAdValues>;

/** One-line explanation under each ad type card. */
const AD_TYPE_HINTS: Record<string, string> = {
  banner: "In the feed, between posts",
  interstitial: "Full screen between screens",
  reward_video: "Watched for a reward",
  native: "Looks like a post",
  pop_ups: "Small card over content",
};

const GENDER_OPTIONS = [
  { value: "all", label: "Everyone" },
  { value: "female", label: "Women" },
  { value: "male", label: "Men" },
] as const;

const labelCls = "text-[13px] font-medium text-foreground/80";
const helpCls = "text-xs leading-snug text-muted-foreground";
const inputCls = "h-10 rounded-[9px] bg-card";
const choiceCls = (on: boolean) =>
  cn(
    "flex min-h-11 flex-col items-start gap-1 rounded-xl border border-input bg-card p-3.5 text-left text-[13px] text-foreground/80 transition-colors hover:border-primary/50",
    on && "border-primary bg-primary/5 ring-1 ring-primary",
  );

function Help({ children, error }: { children?: ReactNode; error?: boolean }) {
  if (!children) return null;
  return <span className={cn(helpCls, error && "text-destructive")}>{children}</span>;
}

const grid = (min: number) => ({ gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))` });

/* Step 1 — Campaign: advertiser, name, ad type and placement. */
export function CampaignStep({ form, advertisers, placements }: { form: Form; advertisers: AdvertisersResponse[]; placements: readonly PlacementOption[] }) {
  const adType = form.watch("adType");
  return (
    <>
      <div className="grid gap-[18px]" style={grid(240)}>
        <FormField
          control={form.control}
          name="advertiserId"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={labelCls}>Advertiser</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className={cn(inputCls, "w-full data-[size=default]:h-10")}>
                    <SelectValue placeholder="Select advertiser" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {advertisers.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.agency ? `${a.agency.name} › ${a.name}` : a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Help>Points are charged to this advertiser (or their agency).</Help>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={labelCls}>Campaign name</FormLabel>
              <FormControl>
                <Input {...field} className={inputCls} />
              </FormControl>
              <Help>Only you and the advertiser see this.</Help>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="adType"
        render={({ field }) => (
          <FormItem className="gap-1.5">
            <span id="adtype-label" className={labelCls}>Ad type</span>
            <div role="radiogroup" aria-labelledby="adtype-label" className="grid gap-2.5" style={grid(150)}>
              {AD_TYPE_OPTIONS.map((option) => {
                const on = field.value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={choiceCls(on)}
                    onClick={() => {
                      if (on) return;
                      field.onChange(option.value);
                      // Placements differ per ad type, so earlier choices may no longer exist.
                      form.setValue("placementKey", "");
                      form.setValue("assetType", "");
                      form.setValue("asset", undefined);
                    }}
                  >
                    <span className="text-sm font-medium text-foreground">{option.label}</span>
                    {AD_TYPE_HINTS[option.value]}
                  </button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="placementKey"
        render={({ field }) => (
          <FormItem className="max-w-[360px] gap-1.5">
            <FormLabel className={labelCls}>Placement</FormLabel>
            <Select
              value={field.value}
              disabled={!adType}
              onValueChange={(value) => {
                field.onChange(value);
                const types = placements.find((p) => p.value === value)?.types ?? [];
                form.setValue("assetType", types.length === 1 ? types[0] : "");
                form.setValue("asset", undefined);
              }}
            >
              <FormControl>
                <SelectTrigger className={cn(inputCls, "w-full data-[size=default]:h-10")}>
                  <SelectValue placeholder={adType ? "Select placement" : "Choose an ad type first"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {placements.map((placement) => (
                  <SelectItem key={placement.value} value={placement.value}>{placement.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

const assetTypeOf = (file: File): AssetType | "" =>
  file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "";

const typesText = (types: readonly AssetType[]) => types.map((t) => ASSET_TYPE_LABELS[t]).join(" or ");

/* Step 2 — Creative: name, destination and the uploaded image or video. */
export function CreativeStep({ form, placement }: { form: Form; placement?: PlacementOption }) {
  const types = placement?.types ?? [];
  const accept = types.length === 1 ? `${types[0]}/*` : "image/*,video/*";
  const errors = form.formState.errors;
  const assetError = (errors.asset?.message as string | undefined) ?? errors.assetType?.message;
  const revalidate = { shouldValidate: form.formState.isSubmitted };

  return (
    <>
      <div className="grid gap-[18px]" style={grid(240)}>
        <FormField
          control={form.control}
          name="creativeName"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={labelCls}>Creative name</FormLabel>
              <FormControl>
                <Input {...field} className={inputCls} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="destinationLink"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={labelCls}>Destination link</FormLabel>
              <FormControl>
                <Input {...field} type="url" placeholder="https://..." className={inputCls} />
              </FormControl>
              <Help>Where people go when they tap the ad.</Help>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="asset"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <ImageUpload
              value={field.value}
              label={types.length === 1 ? ASSET_TYPE_LABELS[types[0]] : "Image or video"}
              accept={accept}
              size="small"
              hint={accept.includes("video") && accept.includes("image") ? "JPG, PNG or MP4" : accept.includes("video") ? "MP4 video" : "JPG or PNG image"}
              onChange={(file) => {
                if (!file) {
                  field.onChange(undefined);
                  if (types.length > 1) form.setValue("assetType", "", revalidate);
                  return;
                }
                // The asset type follows the uploaded file; a placement only takes certain types.
                const type = assetTypeOf(file);
                if (!type || !types.includes(type)) {
                  form.setError("asset", { message: `This placement takes ${typesText(types) || "an image or video"} only.` });
                  return;
                }
                field.onChange(file);
                form.setValue("assetType", type, revalidate);
                form.clearErrors(["asset", "assetType"]);
              }}
            />
            <Help>
              {placement
                ? `${placement.label} · ${typesText(types)}${field.value instanceof File ? ` · ${field.value.name}` : ""}`
                : "Choose a placement in step 1 first."}
            </Help>
            {assetError && <Help error>{assetError}</Help>}
          </div>
        )}
      />
    </>
  );
}

/* Step 3 — Audience: age range and gender. */
export function AudienceStep({ form }: { form: Form }) {
  const ageField = (name: "ageMin" | "ageMax", label: string, placeholder: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="gap-1.5">
          <FormLabel className={labelCls}>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={placeholder}
              className={cn(inputCls, "font-mono tabular-nums")}
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <>
      <div className="grid gap-[18px]" style={grid(160)}>
        {ageField("ageMin", "Age from", "e.g. 18")}
        {ageField("ageMax", "Age to", "e.g. 65")}
      </div>
      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem className="gap-1.5">
            <span id="gender-label" className={labelCls}>Gender</span>
            <div role="radiogroup" aria-labelledby="gender-label" className="inline-flex gap-0.5 self-start rounded-[10px] bg-muted p-[3px]">
              {GENDER_OPTIONS.map((g) => {
                const on = field.value === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => field.onChange(g.value)}
                    className={cn(
                      "h-9 rounded-lg px-3.5 text-[13px] font-medium text-foreground/80",
                      on && "bg-card text-foreground shadow-sm ring-1 ring-border",
                    )}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

/* Step 4 — Budget: package, how many, start date, and optional objectives. */
export function BudgetStep({
  form, packages, packagesLoading, summary, prices, objectives, onObjectivesChange,
}: {
  form: Form;
  packages: PackageTerms[];
  packagesLoading: boolean;
  summary: PackageSummary;
  prices: ObjectivePrice[];
  objectives: ObjectiveInput[];
  onObjectivesChange: (value: ObjectiveInput[]) => void;
}) {
  const assetType = form.watch("assetType");
  const qty = form.watch("packageQuantity");
  const revalidate = { shouldValidate: form.formState.isSubmitted };
  const setQty = (n: number) => form.setValue("packageQuantity", n, revalidate);
  const setCount = (type: ObjectiveType, count: number) => {
    const rest = objectives.filter((o) => o.objectiveType !== type);
    onObjectivesChange(count >= 1 ? [...rest, { objectiveType: type, targetCount: count }] : rest);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="packageId"
        render={({ field }) => (
          <FormItem className="gap-1.5">
            <span id="pkg-label" className={labelCls}>Package</span>
            {packagesLoading ? (
              <Help>Loading packages…</Help>
            ) : packages.length === 0 ? (
              <Help>No packages on sale.</Help>
            ) : (
              <div role="radiogroup" aria-labelledby="pkg-label" className="grid gap-2.5" style={grid(200)}>
                {packages.map((p) => {
                  const on = field.value === p.id;
                  return (
                    <button key={p.id} type="button" role="radio" aria-checked={on} className={choiceCls(on)} onClick={() => field.onChange(p.id)}>
                      <span className="text-[15px] font-semibold text-foreground">{p.name}</span>
                      <span className="font-mono text-lg tabular-nums text-foreground">{p.price.toLocaleString()} pts</span>
                      <span>per {p.durationDays === 1 ? "day" : daysLabel(p.durationDays)}{p.description ? ` · ${p.description}` : ""}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-[18px]" style={grid(200)}>
        <FormField
          control={form.control}
          name="packageQuantity"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={labelCls}>How many</FormLabel>
              <div className="flex gap-1.5">
                <Button type="button" variant="outline" className="h-10 w-10 bg-card p-0" aria-label="One less" onClick={() => setQty(Math.max(1, (qty || 1) - 1))}>
                  <Minus />
                </Button>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    className={cn(inputCls, "text-center font-mono tabular-nums")}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(wholeNumber(e.target.value))}
                  />
                </FormControl>
                <Button type="button" variant="outline" className="h-10 w-10 bg-card p-0" aria-label="One more" onClick={() => setQty((qty || 0) + 1)}>
                  <Plus />
                </Button>
              </div>
              <Help>
                {summary.terms
                  ? `${qty || 0} × ${summary.terms.name} = ${daysLabel(summary.runDays)}`
                  : "Pick a package first."}
              </Help>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={labelCls}>Start date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("h-10 w-full rounded-[9px] bg-card pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "d MMM yyyy") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={(d) => field.onChange(d ?? undefined)} captionLayout="dropdown" />
                </PopoverContent>
              </Popover>
              {summary.tooLong ? (
                <Help error>An ad can run for at most {MAX_RUN_DAYS} days.</Help>
              ) : (
                <Help>{summary.endDate ? `Ends ${format(summary.endDate, "d MMM yyyy")}` : "The end date follows from the package and how many."}</Help>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {prices.length > 0 && (
        <>
          <div className="h-px bg-muted" />
          <div className="flex flex-col gap-1.5">
            <span className={labelCls}>Objectives <span className="font-normal text-muted-foreground">(optional)</span></span>
            <Help>Buy a number of results on top of the package. Ads behind on a target are shown more often; the ad still stops at its end date.</Help>
          </div>
          <div className="grid gap-[18px]" style={grid(180)}>
            {prices.map((price) => {
              const type = price.objectiveType;
              const fits = objectiveFitsAsset(type, assetType);
              const count = fits ? objectives.find((o) => o.objectiveType === type)?.targetCount : undefined;
              return (
                <div key={type} className="flex flex-col gap-1.5">
                  <label htmlFor={`objective-${type}`} className={labelCls}>{OBJECTIVE_LABELS[type]}</label>
                  <Input
                    id={`objective-${type}`}
                    type="number"
                    min={0}
                    placeholder="0"
                    disabled={!fits}
                    className={cn(inputCls, "font-mono tabular-nums")}
                    value={count || ""}
                    onChange={(e) => setCount(type, wholeNumber(e.target.value))}
                  />
                  <Help>{fits ? priceText(price) : "Video creatives only"}</Help>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

/** "goldenlotus.example/menu" from a full URL. */
const shortLink = (link: string) => link.replace(/^https?:\/\//i, "").replace(/\/$/, "");

const adTypeLabel = (value: string) => AD_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? "";

/* Step 5 — Review: everything at a glance before paying. */
export function ReviewStep({ form, advertiserName, placementLabel, summary }: {
  form: Form;
  advertiserName: string;
  placementLabel: string;
  summary: PackageSummary;
}) {
  const v = form.watch();
  const gender = GENDER_OPTIONS.find((g) => g.value === v.gender)?.label ?? "";
  const ages = v.ageMin || v.ageMax ? `${v.ageMin ?? "?"}–${v.ageMax ?? "?"}` : "";
  const items = [
    { label: "Advertiser", value: advertiserName },
    { label: "Campaign", value: v.name },
    { label: "Ad", value: [adTypeLabel(v.adType), placementLabel].filter(Boolean).join(" · ") },
    { label: "Audience", value: [gender, ages].filter(Boolean).join(", ") },
    {
      label: "Runs",
      value: v.startDate && summary.endDate
        ? `${format(v.startDate, "d MMM")} → ${format(summary.endDate, "d MMM yyyy")}`
        : v.startDate ? `From ${format(v.startDate, "d MMM yyyy")}` : "",
    },
    { label: "Destination", value: shortLink(v.destinationLink) },
  ];
  return (
    <>
      <dl className="m-0 grid gap-x-6 gap-y-4" style={grid(220)}>
        {items.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className={helpCls}>{item.label}</dt>
            <dd className="mt-[3px] break-words font-medium">{item.value || "—"}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-xl border border-warning/25 bg-warning-soft px-4 py-3.5 leading-normal text-warning-soft-foreground">
        Nothing is charged until you pay. Once paid with points, the ad goes live straight away; until then it stays a draft under Ads.
      </div>
    </>
  );
}

