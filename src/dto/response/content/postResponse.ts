export interface PostResponse {
    id: string;
    advertiser_id: string;
    title: string;
    description: string;
    status: string;
    photo: string;
    created_at: string;
    advertiser: {
        name: string
    }
}