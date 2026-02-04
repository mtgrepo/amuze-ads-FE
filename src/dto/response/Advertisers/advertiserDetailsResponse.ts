export interface AdvertiserDetailsResponse {
    id: string,
    // advertiser: {
    // name: string,
    // email: string,
    // phone: string,
    // status: string,
    // verified: boolean,
    // password: string,
    // last_login: string | null,
    // },
    advertiser_id: string,
    business_name: string,
    business_no: string,
    business_type: string,
    dica_number: string,
    website: string,
    address: string,
    timezone: string,
    country: string,    
    photo: string,
    created_at: string,
    updated_at: string
}