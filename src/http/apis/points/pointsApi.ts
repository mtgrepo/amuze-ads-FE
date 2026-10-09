import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"
import type { TopUpInput } from "../../../dto/input/points/topUpInput"

export const getWallet = async (accountId: string) => {
    try {
        const response = await axiosInstance.get(`/points/accounts/${accountId}`)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch points")
        }
        throw new Error ("An unexpected error occurred")
    }
}

export const topUpPoints = async (accountId: string, data: TopUpInput) => {
    try {
        const response = await axiosInstance.post(`/points/accounts/${accountId}/top-up`, data)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to add points")
        }
        throw new Error ("An unexpected error occurred")
    }
}

/** Every wallet's points history (admin). */
export const getPointsLedger = async () => {
    try {
        const response = await axiosInstance.get(`/points/ledger`)
        return response.data
    } catch (error) {
        if(error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch points history")
        }
        throw new Error ("An unexpected error occurred")
    }
}
