import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"
import type { SystemConfigInput } from "../../../dto/input/system/systemConfigInput"

export const getSystemConfigs = async () => {
    try {
        const response = await axiosInstance.get("/system-configs")
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch system configs")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const createSystemConfig = async (data: SystemConfigInput) => {
    try {
        const response = await axiosInstance.post("/system-configs", data)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to create system config")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const updateSystemConfig = async (id: string, data: SystemConfigInput) => {
    try {
        const response = await axiosInstance.patch(`/system-configs/${id}`, data)
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to update system config")
        }
        throw new Error("An unexpected error occurred")
    }
}

export const setSystemConfigActive = async (id: string, isActive: boolean) => {
    try {
        const response = await axiosInstance.patch(`/system-configs/${id}/active`, { isActive })
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to update system config status")
        }
        throw new Error("An unexpected error occurred")
    }
}
