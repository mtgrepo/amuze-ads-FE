import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"

// Admin users are created and updated from the AMUZE admin portal (on sign-in); this is read-only.
export const getAdminUsers = async () => {
    try {
        const response = await axiosInstance.get("/admin-users")
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch admin users")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const getAdminUserById = async (id: string) => {
    try {
        const response = await axiosInstance.get(`/admin-users/${id}`)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch admin user")
        }
        throw new Error("An unexpected error occurred")
    }
}
