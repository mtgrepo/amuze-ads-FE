export interface AdvertiserInput {
    name: string,
    email?: string,
    phone: string,
    status: string,
    verified: boolean
    password?: string
}

export interface AccountInput {
    name: string,
    type: "agency" | "advertiser",
    agencyId?: string,
    email?: string,
    phone?: string,
    status: string,
    verified: boolean,
    password?: string
}
