export interface EnvironmentConfig {
  accountId: string;
  region: string;
  stackName: string;
  agentName: string;
  bucketPrefix: string;
  foundationModel: string; // Foundation model or inference profile ID
  tags: { [key: string]: string };
  // Optional: Use existing role instead of creating new one
  existingRoleArn?: string;
  createRole?: boolean; // Default: true
}
