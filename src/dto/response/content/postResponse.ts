export interface PostResponse {
    id: string;
    advertiser_id: string;
    title: string;
    description: string;
    status: string;
    photo: string;
    createdAt: string;
    advertiser: {
        name: string
    }
}