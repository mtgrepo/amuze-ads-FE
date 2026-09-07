import type { AdSetResponse } from "./adSetResponse";
import type { AdCreativeResponse } from "./adCreativeResponse";

export interface AdResponse {
    id: string,
    adSetId: string,
    adCreativeId: string,
    adType: string,
    placementKey: string,
    status: string,
    adSet: AdSetResponse,
    adCreative: AdCreativeResponse
}
