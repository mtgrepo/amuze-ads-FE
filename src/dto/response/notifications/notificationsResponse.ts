import type { AdvertisersResponse } from "../advertisers/advertisersResponse";

export interface NotificationsResponse {
    id: string;
    advertiserId: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
    advertiser : AdvertisersResponse
}