import { EnvironmentConfig } from './types';

export const stagingConfig: EnvironmentConfig = {
  accountId: process.env.CDK_DEFAULT_ACCOUNT || '',
  region: 'ap-southeast-1',
  stackName: 'BedrockAgentStack-Staging',
  agentName: 'nova-pro-agent-staging',
  bucketPrefix: 'bedrock-agent-staging',
  foundationModel: 'apac.amazon.nova-pro-v1:0', // Nova Pro inference profile
  tags: {
    Environment: 'Staging',
    Project: 'BedrockAgent',
    CostCenter: 'QA',
    Owner: 'QATeam'
  }
};
