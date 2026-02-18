import { AxiosError } from "axios"
import axiosInstance from "../../httpClient";

export const getAllPosts = async () => {
    try {
        const response = await axiosInstance.get("/advertiser-posts");
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "An error occurred while fetching posts.")
        }
        throw new Error("An unexpected error occurred.")
    }
}

export const getPostById = async (id: string) => {
    try {   
        const response = await axiosInstance.get(`/advertiser-posts/${id}`);
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "An error occurred while fetching post.")
        }
        throw new Error("An unexpected error occurred.")
    }
}

export const createPost = async (data: FormData) => {
    try {
        const response = await axiosInstance.post("/advertiser-posts", data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "An error occurred while creating post.")
        }
        throw new Error("An unexpected error occurred.")
    }
}

export const updatePost = async (id: string, data: FormData) => {
    try {
        const response = await axiosInstance.patch(`/advertiser-posts/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "An error occurred while updating post.")
        }
        throw new Error("An unexpected error occurred.")
    }
}

export const updatePostStatus = async (id: string, status: string) => {
    try {
        const response = await axiosInstance.patch(`/advertiser-posts/${id}/status`, {
            status: status
        })
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "An error occurred while updating post.")
        }
        throw new Error("An unexpected error occurred.")
    }
}

export const deletePost = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/advertiser-posts/${id}`);
        return response.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data.message || "An error occurred while deleting post.")
        }
        throw new Error("An unexpected error occurred.")
    }
}