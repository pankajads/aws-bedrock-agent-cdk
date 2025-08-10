export interface EnvironmentConfig {
    accountId: string;
    region: string;
    stackName: string;
    agentName: string;
    bucketPrefix: string;
    tags: {
        [key: string]: string;
    };
    existingRoleArn?: string;
    createRole?: boolean;
}
