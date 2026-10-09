export type ExtensionStatus = "pending" | "approved" | "rejected";

export interface CampaignExtensionResponse {
    id: string;
    campaignId: string;
    /** First extra day. */
    startDate: string;
    previousEndDate: string;
    newEndDate: string;
    days: number;
    /** Points charged. 1 point = 1 MMK. */
    amount: number;
    status: ExtensionStatus;
    requestedByRole: string;
    reviewedAt: string | null;
    createdAt: string;
    campaign?: { id: string; name: string; status: string; advertiserId: string; advertiser?: { id: string; name: string } };
}

export interface ExtensionQuoteResponse {
    campaignId: string;
    previousEndDate: string;
    startDate: string;
    newEndDate: string;
    days: number;
    dailyRate: number;
    amount: number;
    payerName: string;
    balance: number;
}

/** Statuses a campaign can be extended from (expired ones restart once approved). */
export const EXTENDABLE_CAMPAIGN_STATUSES = ["active", "paused", "expired"];

export const EXTENSION_STATUS_LABELS: Record<ExtensionStatus, string> = {
    pending: "Under Review",
    approved: "Approved",
    rejected: "Rejected · refunded",
};
