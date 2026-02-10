export interface AdvertisersResponse {
    id: string,
    name: string,
    email: string,
    phone: string,
    status: string,
    verified: boolean,
    password: string,
    last_login: string | null,
    avatar?: string | null,
    profiles: {
        id: string,
        advertiser_id: string,
        business_name: string,
        business_no: string,
        business_type: string,
        dica_number: string,
        website: string,
        address: string,
        timezone: string,
        photo: string,
        country: string,
        created_at: string,
        updated_at: string
    }[],
    createdAt: string,
    updatedAt: string
}