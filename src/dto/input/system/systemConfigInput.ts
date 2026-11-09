export interface SystemConfigInput {
    category: string;
    configKey: string;
    configValue: Record<string, unknown>;
    description?: string;
    isActive?: boolean;
}
