import { AxiosError } from "axios"
import axiosInstance from "../../httpClient"

export const getAllTransactions = async () => {
    try {
        const response = await axiosInstance.get("/transactions")
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "Failed to fetch transactions")
        }
        throw new Error("An unexpected error occurred")
    }
}
