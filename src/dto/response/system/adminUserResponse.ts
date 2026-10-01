export interface AdminUserResponse {
    id: string;
    amuzeUserId: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    isActive: boolean;
    lastLogin: string | null;
    createdAt: string;
    updatedAt: string;
}
