/** Mirrors AdminDisplayRule in advertiser-system/src/ad-display-rules. */
export type DisplayTrigger =
    | "page_open"
    | "app_open"
    | "after_items"
    | "content_open"
    | "content_complete"
    | "video_play"
    | "download_all"
    | "module_switch";

export type VideoPosition = "start" | "middle" | "either";

export type DisplayRuleField = "every" | "cooldownMinutes" | "videoPosition" | "modules";

export interface DisplayRule {
    type: string;
    placement: string;
    trigger: DisplayTrigger;
    unit: "videos" | "posts" | null;
    enabled: boolean;
    every: { min: number; max: number } | null;
    cooldownMinutes: number | null;
    videoPosition: VideoPosition | null;
    modules: string[] | null;
    updatedAt: string | null;
    editable: DisplayRuleField[];
}

export interface DisplayRuleInput {
    enabled?: boolean;
    everyMin?: number;
    everyMax?: number;
    cooldownMinutes?: number;
    videoPosition?: VideoPosition;
    modules?: string[];
}
