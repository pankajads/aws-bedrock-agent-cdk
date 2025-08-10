import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../environments';
export interface BedrockAgentStackProps extends cdk.StackProps {
    environmentConfig: EnvironmentConfig;
}
export declare class BedrockAgentStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: BedrockAgentStackProps);
}
