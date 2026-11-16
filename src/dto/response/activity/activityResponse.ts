export type ActorType = "admin" | "advertiser" | "system";

/** One recorded action: who did what to which record, and when. */
export interface ActivityLog {
    id: string;
    createdAt: string;
    actorType: ActorType;
    actorId: string | null;
    /** The actor's name at the time. */
    actorName: string | null;
    /** e.g. "campaign.approved", "points.added". */
    action: string;
    entityType: string;
    entityId: string;
    campaignId: string | null;
    advertiserId: string | null;
    /** Ready to show, e.g. "Approved", "Budget changed". */
    summary: string;
    changes: Record<string, { from: unknown; to: unknown }> | null;
    meta: Record<string, unknown> | null;
}

export interface ActivityPage {
    items: ActivityLog[];
    total: number;
}
