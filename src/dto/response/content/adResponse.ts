import type { AdSetResponse } from "./adSetResponse";

export interface AdResponse {
    id: string,
    adSetId: string,
    status: string,
    adSet: AdSetResponse
}