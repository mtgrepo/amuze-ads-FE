import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"
import type { AdPackageInput } from "../../../dto/input/adPackage/adPackageInput"

const fail = (error: unknown, fallback: string): never => {
    if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message || fallback)
    }
    throw new Error("An unexpected error occurred")
}

/** Packages customers can buy. */
export const getActivePackages = async () => {
    try {
        const response = await axiosInstance.get("/ad-packages")
        return response.data
    } catch (error) {
        return fail(error, "Failed to fetch packages")
    }
}

/** Every package, including inactive ones (admin). */
export const getAllPackages = async () => {
    try {
        const response = await axiosInstance.get("/ad-packages/all")
        return response.data
    } catch (error) {
        return fail(error, "Failed to fetch packages")
    }
}

export const createPackage = async (data: AdPackageInput) => {
    try {
        const response = await axiosInstance.post("/ad-packages", data)
        return response.data
    } catch (error) {
        return fail(error, "Failed to create package")
    }
}

export const updatePackage = async (id: string, data: AdPackageInput) => {
    try {
        const response = await axiosInstance.patch(`/ad-packages/${id}`, data)
        return response.data
    } catch (error) {
        return fail(error, "Failed to update package")
    }
}

export const setPackageActive = async (id: string, isActive: boolean) => {
    try {
        const response = await axiosInstance.patch(`/ad-packages/${id}/active`, { isActive })
        return response.data
    } catch (error) {
        return fail(error, "Failed to change package status")
    }
}
