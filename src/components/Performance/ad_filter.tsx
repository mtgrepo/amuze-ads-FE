import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdListQuery } from "../../Composable/Query/content/useAdListQuery";
import type { AdResponse } from "../../dto/response/content/adResponse";
import { placementLabel } from "../Dashboard/admin/dashboard_utils";
import { CRUMB_TRIGGER } from "./performance_types";

const ALL = "all";

// Ads that have been served, so have performance to show. Drafts and ads under review have none yet.
const HAS_RUN = ["active", "paused", "expired"];

/**
 * The last step of the Performance filter path: one ad, or all ads in the chosen scope.
 * `selectedName` keeps an ad picked from elsewhere (e.g. "View performance" on a pending ad) showing by name.
 */
export function AdFilter({ scopeId, value, selectedName, onChange }: {
    scopeId?: string;
    value?: string;
    selectedName?: string;
    onChange: (adId: string | undefined) => void;
}) {
    const { adListData } = useAdListQuery(scopeId);
    const ads = ((adListData ?? []) as AdResponse[]).filter((ad) => HAS_RUN.includes(ad.status));
    const selectedMissing = value && !ads.some((ad) => ad.id === value);

    return (
        <Select key={scopeId ?? ALL} value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? undefined : v)}>
            <SelectTrigger aria-label="Ad" className={CRUMB_TRIGGER}><SelectValue /></SelectTrigger>
            <SelectContent>
                <SelectItem value={ALL}>All ads</SelectItem>
                {selectedMissing && <SelectItem value={value}>{selectedName ?? "Selected ad"}</SelectItem>}
                {ads.map((ad) => (
                    <SelectItem key={ad.id} value={ad.id}>
                        {ad.adSet?.campaign?.name}<span className="text-muted-foreground"> · {placementLabel(ad.placementKey)}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
