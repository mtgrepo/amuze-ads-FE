import type { ActorType } from "../../response/activity/activityResponse";

/** Query for GET /activity. Every field is optional; dates are YYYY-MM-DD and `to` is inclusive. */
export interface ActivityFilters {
    campaignId?: string;
    advertiserId?: string;
    /** One type or several, comma-separated: campaign,ad,ad_set,extension,advertiser,points,package,system_config. */
    entityType?: string;
    entityId?: string;
    /** An exact action, or a prefix like "campaign". */
    action?: string;
    actorType?: ActorType;
    from?: string;
    to?: string;
    /** 1-based. */
    page?: number;
    /** At most 100. */
    limit?: number;
    /** Every matching row (up to 5000), for an export. */
    all?: boolean;
}
