import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"
import type { AdminUserInput } from "../../../dto/input/system/adminUserInput"

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

export const createAdminUser = async (data: AdminUserInput) => {
    try {
        const response = await axiosInstance.post("/admin-users", data)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to create admin user")
        }
        throw new Error("An unexpected error occurred")
    }
}   

export const deleteAdminUser = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/admin-users/${id}`)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to delete admin user")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const updateAdminUser = async (id: string, data: AdminUserInput) => {
    try {
        const response = await axiosInstance.patch(`/admin-users/${id}/update`, data)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to update admin user")
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