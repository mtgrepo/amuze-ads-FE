import type { AdSetResponse } from "./adSetResponse";
import type { AdCreativeResponse } from "./adCreativeResponse";

export interface AdResponse {
    id: string,
    adSetId: string,
    adCreativeId: string,
    adType: string,
    placementKey: string,
    status: string,
    /** Running totals since the ad started. */
    totalImpressions?: number,
    totalClicks?: number,
    totalWatches?: number,
    totalCompletions?: number,
    adSet: AdSetResponse,
    adCreative: AdCreativeResponse
}
