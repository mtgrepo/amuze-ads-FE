import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"

// Hands the AMUZE admin token to our backend once: it's verified and the local admin is created/updated.
export const adminSso = async (amuzeToken: string) => {
    try {
        const response = await axiosInstance.post("/auth/admin/sso", undefined, {
            headers: { Authorization: `Bearer ${amuzeToken}` },
        })
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Couldn't sign you in")
        }
        throw new Error("An unexpected error occurred")
    }
}
