#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BedrockAgentStack } from '../lib/bedrock-agent-stack';
import { getEnvironmentConfig } from '../environments';

const app = new cdk.App();

// Get environment from context or environment variable
const environment = app.node.tryGetContext('environment') || process.env.CDK_ENVIRONMENT || 'dev';
const config = getEnvironmentConfig(environment);

new BedrockAgentStack(app, config.stackName, {
  env: {
    account: config.accountId || process.env.CDK_DEFAULT_ACCOUNT,
    region: config.region,
  },
  description: `Stack for Bedrock Agent with Nova Pro model - ${config.tags.Environment}`,
  tags: config.tags,
  environmentConfig: config,
});

app.synth();
