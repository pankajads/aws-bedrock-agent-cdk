import { EnvironmentConfig } from './types';

export const devConfig: EnvironmentConfig = {
  accountId: process.env.CDK_DEFAULT_ACCOUNT || '',
  region: 'ap-southeast-1',
  stackName: 'BedrockAgentStack-Dev',
  agentName: 'nova-pro-agent-dev',
  bucketPrefix: 'bedrock-agent-dev',
  foundationModel: 'apac.amazon.nova-pro-v1:0', // Nova Pro inference profile
  createRole: true, // Set to false to use existing role
  // existingRoleArn: 'arn:aws:iam::ACCOUNT:role/MyPreExistingRole', // Uncomment if using existing
  tags: {
    Environment: 'Development',
    Project: 'BedrockAgent',
    CostCenter: 'Development',
    Owner: 'DevTeam'
  }
};
