export interface SystemConfigResponse {
    id: string;
    category: string;
    configKey: string;
    configValue: Record<string, any>;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
