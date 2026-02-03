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
        business_name: string,
        business_no: string,
        business_type: string,
        Dica_number: string,
        website: string,
        address: string,
        timezone: string,
        country: string,
    }[],
    createdAt: string,
    updatedAt: string
}