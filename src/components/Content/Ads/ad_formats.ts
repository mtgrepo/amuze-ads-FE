/**
 * Which placements each ad type can run in, and which asset types each placement takes.
 * Mirrors src/ads/ad-formats.ts in the backend, which rejects any other combination.
 * A placement key can appear under several ad types (home_feed is both a banner slot and the Muze interstitial).
 */
export type AssetType = "image" | "video";

export interface PlacementOption {
    label: string;
    value: string;
    types: readonly AssetType[];
}

export const AD_TYPE_OPTIONS = [
    { label: "Banner", value: "banner" },
    { label: "Interstitial", value: "interstitial" },
    { label: "Reward Video", value: "reward_video" },
    { label: "Native", value: "native" },
    { label: "Pop Ups", value: "pop_ups" },
] as const;

export const DISPLAY_FORMATS: Record<string, readonly PlacementOption[]> = {
    banner: [
        { label: "Home Feed", value: "home_feed", types: ["image"] },
        { label: "Explore Feed", value: "explore_feed", types: ["image"] },
        { label: "Content Session", value: "content_session", types: ["image"] },
    ],
    interstitial: [
        { label: "Muze", value: "home_feed", types: ["image", "video"] },
        { label: "Museum", value: "explore_feed", types: ["image", "video"] },
        { label: "Free Content Episodes", value: "free_content_episodes", types: ["video"] },
    ],
    reward_video: [
        { label: "Muzebox", value: "muzebox", types: ["video"] },
        { label: "Free Content Episodes", value: "free_content_episodes", types: ["video"] },
    ],
    native: [
        { label: "Sponsored Placement", value: "sponsored_placement", types: ["image", "video"] },
    ],
    pop_ups: [
        { label: "App Open", value: "app_open", types: ["image"] },
    ],
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
    image: "Image",
    video: "Video",
};
