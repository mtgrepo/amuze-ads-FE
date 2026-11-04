import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Spinner } from "../../ui/spinner";
import { cn } from "../../../lib/utils";
import { useAdvertisersQuery } from "../../../Composable/Query/advertiser/useAdvertisersQuery";
import { useWalletQuery } from "../../../Composable/Query/points/useWalletQuery";
import { useCreateFullCampaignCommand } from "../../../Composable/Command/content/campaign/useCreateFullCampaignCommand";
import type { AdvertisersResponse } from "../../../dto/response/advertisers/advertisersResponse";
import { DISPLAY_FORMATS } from "./ad_formats";
import { summarize } from "./package_terms";
import { billableObjectives, objectiveCost } from "./objective_terms";
import { useObjectivePricesQuery } from "../../../Composable/Query/campaignObjective/useObjectivePricesQuery";
import { OBJECTIVE_LABELS, type ObjectiveInput } from "../../../dto/response/campaignObjective/campaignObjectiveResponse";
import { useActivePackagesQuery } from "../../../Composable/Query/adPackage/useActivePackagesQuery";
import { usePreventScriptTag } from "@/lib/scriptTag";
import { AudienceStep, BudgetStep, CampaignStep, CreativeStep, ReviewStep } from "./create_ad_steps";
import { CreateAdCost, CreateAdPreview } from "./create_ad_aside";
import { pts } from "./column";

const formSchema = z
  .object({
    advertiserId: z.string().min(1, { message: "Advertiser is required." }),
    name: z.string().min(1, { message: "Campaign name is required." }),
    packageId: z.string().min(1, { message: "Pick a package." }),
    packageQuantity: z.number().int().min(1, { message: "Buy at least 1." }),
    startDate: z.date({ message: "Start date is required." }),
    creativeName: z.string().min(1, { message: "Creative name is required." }),
    assetType: z.string().min(1, { message: "Asset type is required." }),
    destinationLink: z
      .string()
      .min(1, { message: "Destination link is required." }),
    asset: z.any().refine((v) => v instanceof File, {
      message: "An image or video is required.",
    }),
    ageMin: z.number({ message: "Age min is required." }).min(1, { message: "Age min must be at least 1." }),
    ageMax: z.number({ message: "Age max is required." }).min(1, { message: "Age max must be at least 1." }),
    gender: z.string().min(1, { message: "Gender is required." }),
    adType: z.string().min(1, { message: "Ad type is required." }),
    placementKey: z.string().min(1, { message: "Placement is required." }),
  });

export type CreateAdValues = z.infer<typeof formSchema>;

// What the create endpoint returns that the payment step needs.
export interface CreatedAd {
  campaign: { id: string; name: string; totalBudget: number };
}

/** "pay" opens the payment step; "draft" just saves it. */
export type CreateIntent = "pay" | "draft";

const STEPS: { label: string; title: string; hint: string; fields: (keyof CreateAdValues)[] }[] = [
  { label: "Campaign", title: "Who it is for and what kind of ad", hint: "Pick the advertiser, name the campaign and choose where the ad appears.", fields: ["advertiserId", "name", "adType", "placementKey"] },
  { label: "Creative", title: "The image or video people see", hint: "Upload the creative and set where a tap takes people.", fields: ["creativeName", "destinationLink", "asset", "assetType"] },
  { label: "Audience", title: "Who should see it", hint: "Narrow by age and gender. Leave it wide if unsure.", fields: ["ageMin", "ageMax", "gender"] },
  { label: "Budget", title: "Package, schedule and objectives", hint: "Buy time with a package, then optionally add results on top.", fields: ["packageId", "packageQuantity", "startDate"] },
  { label: "Review", title: "Check everything, then pay", hint: "Nothing is charged until you press Pay.", fields: [] },
];
const LAST = STEPS.length;

export default function CreateAdForm({
  onCreated,
}: {
  onCreated?: (created: CreatedAd, intent: CreateIntent) => void;
}) {
  const form = useForm<CreateAdValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      advertiserId: "",
      name: "",
      packageId: "",
      packageQuantity: 1,
      startDate: undefined,
      creativeName: "",
      assetType: "",
      destinationLink: "",
      asset: undefined,
      ageMin: undefined,
      ageMax: undefined,
      gender: "all",
      adType: "",
      placementKey: "",
    },
  });

  usePreventScriptTag(form);

  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<CreateIntent | null>(null);

  const adType = form.watch("adType");
  const placementKey = form.watch("placementKey");
  const assetType = form.watch("assetType");
  const advertiserId = form.watch("advertiserId");

  const placements = DISPLAY_FORMATS[adType] ?? [];
  const selectedPlacement = placements.find((placement) => placement.value === placementKey);

  const { advertisersList } = useAdvertisersQuery();
  const selectableAdvertisers: AdvertisersResponse[] = (advertisersList ?? []).filter(
    (a: AdvertisersResponse) => a.type === "advertiser",
  );
  const advertiser = selectableAdvertisers.find((a) => String(a.id) === advertiserId);
  // Agency clients are paid for from the agency's wallet.
  const payerId = advertiser ? String(advertiser.agencyId ?? advertiser.id) : "";
  const payerName = advertiser ? (advertiser.agency?.name ?? advertiser.name) : undefined;
  const { wallet, isLoading: walletLoading } = useWalletQuery(payerId, !!payerId);

  const { createFullCampaignCommand, isPending } =
    useCreateFullCampaignCommand();

  const { packages: packagesOnSale, isLoading: packagesLoading } = useActivePackagesQuery();
  const packageSummary = summarize(
    {
      packageId: form.watch("packageId"),
      packageQuantity: form.watch("packageQuantity"),
      startDate: form.watch("startDate"),
    },
    packagesOnSale,
  );
  const [objectives, setObjectives] = useState<ObjectiveInput[]>([]);
  const { prices: objectivePrices } = useObjectivePricesQuery();

  const objectiveLines = billableObjectives(objectives, objectivePrices, assetType).map((o) => {
    const price = objectivePrices.find((p) => p.objectiveType === o.objectiveType)!;
    return { label: `${o.targetCount.toLocaleString()} ${OBJECTIVE_LABELS[o.objectiveType].toLowerCase()}`, cost: objectiveCost(o.targetCount, price) };
  });
  const total = packageSummary.planCost + objectiveLines.reduce((sum, l) => sum + l.cost, 0);

  const errors = form.formState.errors;
  const stepHasError = (n: number) => STEPS[n - 1].fields.some((f) => errors[f]) || (n === 4 && packageSummary.tooLong);

  const onSubmit = async (values: CreateAdValues, how: CreateIntent) => {
    if (packageSummary.tooLong) {
      setStep(4);
      return;
    }
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        formData.append(key, `${year}-${month}-${day}`);
      } else {
        formData.append(key, String(value));
      }
    });

    const picked = billableObjectives(objectives, objectivePrices, values.assetType);
    if (picked.length) formData.append("objectives", JSON.stringify(picked));

    setIntent(how);
    try {
      const created = await createFullCampaignCommand(formData);
      form.reset();
      setObjectives([]);
      setStep(1);
      onCreated?.(created, how);
    } catch {
      // The command's onError already shows the reason.
    } finally {
      setIntent(null);
    }
  };

  // Jump to the first step that still has a problem.
  const onInvalid = (errs: FieldErrors<CreateAdValues>) => {
    const first = STEPS.findIndex((s) => s.fields.some((f) => errs[f]));
    if (first >= 0) setStep(first + 1);
  };

  const submit = (how: CreateIntent) => form.handleSubmit((values) => onSubmit(values, how), onInvalid)();

  const next = async () => {
    if (step === LAST) return submit("pay");
    const ok = await form.trigger(STEPS[step - 1].fields);
    if (!ok) return;
    if (step === 4 && packageSummary.tooLong) return;
    setStep(step + 1);
  };

  const current = STEPS[step - 1];

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => { e.preventDefault(); next(); }}
        className="-mx-4 -mt-4 flex min-h-full flex-1 flex-col"
      >
        <header className="flex flex-wrap items-center gap-4 border-b bg-card px-4 py-4 lg:px-8">
          <Button asChild variant="outline" className="h-[34px] rounded-[9px] bg-card px-3">
            <Link to="/ads"><ArrowLeft /> Ads</Link>
          </Button>
          <div className="flex flex-col leading-tight">
            <h1 className="m-0 text-lg font-semibold">Create ad</h1>
            <span className="text-xs text-muted-foreground">Saved as a draft until it is paid</span>
          </div>
          <nav aria-label="Steps" className="ml-auto flex flex-wrap gap-x-[18px] gap-y-1.5">
            {STEPS.map((s, i) => {
              const k = i + 1;
              const cur = k === step;
              const done = k < step;
              const bad = form.formState.isSubmitted && stepHasError(k);
              return (
                <button
                  key={s.label}
                  type="button"
                  aria-current={cur ? "step" : undefined}
                  onClick={() => setStep(k)}
                  className={cn(
                    "flex items-center gap-2.5 whitespace-nowrap px-1 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground",
                    cur && "text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full font-mono text-xs tabular-nums",
                      cur ? "bg-primary text-primary-foreground" : done ? "bg-primary/10 text-primary" : "bg-muted text-foreground/80",
                      bad && !cur && "bg-destructive-soft text-destructive-soft-foreground",
                    )}
                  >
                    {done && !bad ? <Check className="size-3.5" /> : k}
                  </span>
                  {s.label}
                </button>
              );
            })}
          </nav>
        </header>

        <div className="mx-auto box-border flex w-full max-w-[1360px] flex-1 flex-wrap items-start gap-6 px-4 pt-7 pb-12 lg:px-8">
          <section className="flex min-w-0 flex-[2_1_560px] flex-col rounded-2xl border bg-card">
            <div className="flex flex-col gap-1 px-[26px] pt-[22px] pb-1.5">
              <span className="font-mono text-xs tabular-nums text-muted-foreground">Step {step} of {LAST}</span>
              <h2 className="m-0 text-xl font-semibold">{current.title}</h2>
              <p className="m-0 text-muted-foreground">{current.hint}</p>
            </div>

            <div className="flex flex-col gap-5 px-[26px] pt-5 pb-[26px]">
              {step === 1 && <CampaignStep form={form} advertisers={selectableAdvertisers} placements={placements} />}
              {step === 2 && <CreativeStep form={form} placement={selectedPlacement} />}
              {step === 3 && <AudienceStep form={form} />}
              {step === 4 && (
                <BudgetStep
                  form={form}
                  packages={packagesOnSale}
                  packagesLoading={packagesLoading}
                  summary={packageSummary}
                  prices={objectivePrices}
                  objectives={objectives}
                  onObjectivesChange={setObjectives}
                />
              )}
              {step === 5 && (
                <ReviewStep
                  form={form}
                  advertiserName={advertiser ? (advertiser.agency ? `${advertiser.agency.name} › ${advertiser.name}` : advertiser.name) : ""}
                  placementLabel={selectedPlacement?.label ?? ""}
                  summary={packageSummary}
                />
              )}
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-2.5 border-t px-[26px] py-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-[9px] bg-card"
                disabled={step === 1 || isPending}
                onClick={() => setStep(Math.max(1, step - 1))}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="outline"
                className="ml-auto h-10 rounded-[9px] bg-card"
                disabled={isPending}
                onClick={() => submit("draft")}
              >
                {isPending && intent === "draft" && <Spinner />}
                Save draft
              </Button>
              <Button type="submit" className="h-10 rounded-[9px]" disabled={isPending}>
                {isPending && intent === "pay" && <Spinner />}
                {step === LAST ? `Pay ${pts(total)}` : "Continue"}
              </Button>
            </div>
          </section>

          <aside aria-label="Preview and cost" className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
            <CreateAdPreview
              adType={adType}
              placementLabel={selectedPlacement?.label}
              title={form.watch("name")}
              link={form.watch("destinationLink")}
              asset={form.watch("asset") instanceof File ? form.watch("asset") : undefined}
            />
            <CreateAdCost
              packageLine={packageSummary.terms ? `${form.watch("packageQuantity") || 0} × ${packageSummary.terms.name}` : undefined}
              planCost={packageSummary.planCost}
              objectiveLines={objectiveLines}
              total={total}
              payerName={payerName}
              balance={wallet ? Number(wallet.balance) : undefined}
              balanceLoading={walletLoading}
            />
          </aside>
        </div>
      </form>
    </Form>
  );
}
