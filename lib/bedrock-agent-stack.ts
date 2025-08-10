import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { EnvironmentConfig } from '../environments';

export interface BedrockAgentStackProps extends cdk.StackProps {
  environmentConfig: EnvironmentConfig;
}

export class BedrockAgentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BedrockAgentStackProps) {
    super(scope, id, props);

    const { environmentConfig } = props;

    // S3 bucket for agent artifacts and knowledge base
    const agentBucket = new s3.Bucket(this, 'BedrockAgentBucket', {
      bucketName: `${environmentConfig.bucketPrefix}-${this.account}-${this.region}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // IAM role for Bedrock Agent - Support both creation and existing roles
    let bedrockAgentRole: iam.IRole;
    
    if (environmentConfig.createRole !== false) {
      // Create new role (default behavior)
      bedrockAgentRole = new iam.Role(this, 'BedrockAgentRole', {
        roleName: `${environmentConfig.stackName}-BedrockAgentRole`, // Custom name
        assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
        description: 'Role for Bedrock Agent to access Nova Pro and other services',
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess'),
        ],
        inlinePolicies: {
          BedrockAgentPolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  'bedrock:InvokeModel',
                  'bedrock:InvokeModelWithResponseStream',
                  'bedrock:GetFoundationModel',
                  'bedrock:ListFoundationModels',
                ],
                resources: [
                  `arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-pro-v1:0`, // Direct model access
                  `arn:aws:bedrock:${this.region}:${this.account}:inference-profile/apac.amazon.nova-pro-v1:0`, // Inference profile access
                  `arn:aws:bedrock:${this.region}:${this.account}:agent/*`,
                  `arn:aws:bedrock:${this.region}:${this.account}:agent-alias/*`,
                  `arn:aws:bedrock:${this.region}:${this.account}:knowledge-base/*`,
                ],
              }),
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  's3:GetObject',
                  's3:PutObject',
                  's3:DeleteObject',
                  's3:ListBucket',
                ],
                resources: [
                  agentBucket.bucketArn,
                  `${agentBucket.bucketArn}/*`,
                ],
              }),
            ],
          }),
        },
      });
    } else {
      // Use existing role
      if (!environmentConfig.existingRoleArn) {
        throw new Error('existingRoleArn must be provided when createRole is false');
      }
      bedrockAgentRole = iam.Role.fromRoleArn(this, 'BedrockAgentRole', environmentConfig.existingRoleArn);
    }

    // Lambda function for agent actions (optional)
    const agentActionFunction = new lambda.Function(this, 'AgentActionFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
import json
import boto3
from datetime import datetime

def handler(event, context):
    """
    Lambda function to handle Bedrock Agent actions
    """
    print(f"Received event: {json.dumps(event)}")
    
    # Extract action and parameters from the event
    action = event.get('actionGroup', '')
    parameters = event.get('parameters', {})
    
    # Example action handlers
    if action == 'get_current_time':
        current_time = datetime.now().isoformat()
        return {
            'statusCode': 200,
            'body': {
                'TEXT': {
                    'body': f"The current time is: {current_time}"
                }
            }
        }
    elif action == 'calculate':
        # Example calculation action
        try:
            num1 = float(parameters.get('number1', 0))
            num2 = float(parameters.get('number2', 0))
            operation = parameters.get('operation', 'add')
            
            if operation == 'add':
                result = num1 + num2
            elif operation == 'subtract':
                result = num1 - num2
            elif operation == 'multiply':
                result = num1 * num2
            elif operation == 'divide':
                result = num1 / num2 if num2 != 0 else 'Cannot divide by zero'
            else:
                result = 'Invalid operation'
                
            return {
                'statusCode': 200,
                'body': {
                    'TEXT': {
                        'body': f"Result: {result}"
                    }
                }
            }
        except Exception as e:
            return {
                'statusCode': 400,
                'body': {
                    'TEXT': {
                        'body': f"Error in calculation: {str(e)}"
                    }
                }
            }
    else:
        return {
            'statusCode': 400,
            'body': {
                'TEXT': {
                    'body': f"Unknown action: {action}"
                }
            }
        }
      `),
      description: 'Lambda function for Bedrock Agent custom actions',
      timeout: cdk.Duration.minutes(5),
    });

    // Grant Bedrock Agent permission to invoke the Lambda function
    agentActionFunction.grantInvoke(new iam.ServicePrincipal('bedrock.amazonaws.com'));

    // Bedrock Agent
    const bedrockAgent = new bedrock.CfnAgent(this, 'BedrockAgent', {
      agentName: environmentConfig.agentName,
      description: `Bedrock Agent powered by Amazon Nova Pro model - ${environmentConfig.tags.Environment}`,
      foundationModel: environmentConfig.foundationModel, // 🔥 Use foundation model from environment config
      agentResourceRoleArn: bedrockAgentRole.roleArn,
      instruction: `You are a helpful AI assistant powered by Amazon Nova Pro. 
      You can help users with various tasks including:
      - Answering questions and providing information
      - Performing calculations
      - Providing current time information
      - General conversation and assistance
      
      Be helpful, accurate, and professional in your responses.
      If you're unsure about something, say so rather than guessing.`,
      
      // Action groups for the agent
      actionGroups: [
        {
          actionGroupName: 'utility-actions',
          description: 'Utility functions for the agent',
          actionGroupExecutor: {
            lambda: agentActionFunction.functionArn,
          },
          apiSchema: {
            payload: JSON.stringify({
              openapi: '3.0.0',
              info: {
                title: 'Agent Utility API',
                version: '1.0.0',
                description: 'API for agent utility functions',
              },
              paths: {
                '/get_current_time': {
                  post: {
                    summary: 'Get current time',
                    description: 'Returns the current date and time',
                    operationId: 'get_current_time',
                    responses: {
                      '200': {
                        description: 'Current time retrieved successfully',
                      },
                    },
                  },
                },
                '/calculate': {
                  post: {
                    summary: 'Perform calculations',
                    description: 'Performs mathematical calculations',
                    operationId: 'calculate',
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {
                              number1: {
                                type: 'number',
                                description: 'First number',
                              },
                              number2: {
                                type: 'number',
                                description: 'Second number',
                              },
                              operation: {
                                type: 'string',
                                enum: ['add', 'subtract', 'multiply', 'divide'],
                                description: 'Mathematical operation to perform',
                              },
                            },
                            required: ['number1', 'number2', 'operation'],
                          },
                        },
                      },
                    },
                    responses: {
                      '200': {
                        description: 'Calculation completed successfully',
                      },
                    },
                  },
                },
              },
            }),
          },
        },
      ],
      
      // Auto prepare the agent
      autoPrepare: true,
      
      // Enable prompt override
      promptOverrideConfiguration: {
        promptConfigurations: [
          {
            promptType: 'PRE_PROCESSING',
            promptCreationMode: 'DEFAULT',
            promptState: 'ENABLED',
            basePromptTemplate: `You are a helpful AI assistant. Process the user's request and determine the appropriate action to take.
            
            Available actions:
            - get_current_time: Get the current date and time
            - calculate: Perform mathematical calculations (add, subtract, multiply, divide)
            
            User request: $question$
            
            Please analyze the request and respond appropriately.`,
          },
        ],
      },
    });

    // Create an agent alias
    const agentAlias = new bedrock.CfnAgentAlias(this, 'BedrockAgentAlias', {
      agentId: bedrockAgent.attrAgentId,
      agentAliasName: 'live',
      description: 'Live alias for the Nova Pro agent',
    });

    // Output important information
    new cdk.CfnOutput(this, 'AgentId', {
      value: bedrockAgent.attrAgentId,
      description: 'Bedrock Agent ID',
    });

    new cdk.CfnOutput(this, 'AgentAliasId', {
      value: agentAlias.attrAgentAliasId,
      description: 'Bedrock Agent Alias ID',
    });

    new cdk.CfnOutput(this, 'AgentArn', {
      value: bedrockAgent.attrAgentArn,
      description: 'Bedrock Agent ARN',
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: agentBucket.bucketName,
      description: 'S3 bucket for agent artifacts',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: agentActionFunction.functionName,
      description: 'Lambda function for agent actions',
    });

    new cdk.CfnOutput(this, 'BedrockAgentRoleName', {
      value: bedrockAgentRole.roleName,
      description: 'IAM role name for Bedrock Agent',
    });

    new cdk.CfnOutput(this, 'BedrockAgentRoleArn', {
      value: bedrockAgentRole.roleArn,
      description: 'IAM role ARN for Bedrock Agent',
    });
  }
}
