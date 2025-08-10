import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BedrockAgentStack } from '../lib/bedrock-agent-stack';
import { devConfig } from '../environments/dev';

test('Bedrock Agent Stack Created', () => {
  const app = new cdk.App();
  const stack = new BedrockAgentStack(app, 'TestBedrockAgentStack', {
    env: {
      account: '123456789012',
      region: 'us-east-1',
    },
    environmentConfig: devConfig,
  });

  const template = Template.fromStack(stack);

  // Test that a Bedrock Agent is created
  template.hasResourceProperties('AWS::Bedrock::Agent', {
    AgentName: devConfig.agentName,
    FoundationModel: devConfig.foundationModel, // 🔥 Use foundation model from environment config
  });

  // Test that Lambda function is created
  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'python3.11',
    Handler: 'index.handler',
  });

  // Test that S3 bucket is created
  template.hasResourceProperties('AWS::S3::Bucket', {
    VersioningConfiguration: {
      Status: 'Enabled',
    },
  });

  // Test that IAM role is created for the agent
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'bedrock.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
  });
});
