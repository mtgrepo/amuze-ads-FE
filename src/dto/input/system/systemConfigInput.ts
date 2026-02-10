export interface SystemConfigInput {
    category: string;
    configKey: string;
    configValue: Record<string, any>;
    description?: string;
    isActive?: boolean;
}
