"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BedrockAgentStack = void 0;
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const bedrock = require("aws-cdk-lib/aws-bedrock");
const s3 = require("aws-cdk-lib/aws-s3");
const lambda = require("aws-cdk-lib/aws-lambda");
class BedrockAgentStack extends cdk.Stack {
    constructor(scope, id, props) {
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
        let bedrockAgentRole;
        if (environmentConfig.createRole !== false) {
            // Create new role (default behavior)
            bedrockAgentRole = new iam.Role(this, 'BedrockAgentRole', {
                roleName: `${environmentConfig.stackName}-BedrockAgentRole`,
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
                                    `arn:aws:bedrock:${this.region}::foundation-model/amazon.nova-pro-v1:0`,
                                    `arn:aws:bedrock:${this.region}:${this.account}:inference-profile/apac.amazon.nova-pro-v1:0`,
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
        }
        else {
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
            foundationModel: 'apac.amazon.nova-pro-v1:0',
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
exports.BedrockAgentStack = BedrockAgentStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkcm9jay1hZ2VudC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9iZWRyb2NrLWFnZW50LXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUVuQywyQ0FBMkM7QUFDM0MsbURBQW1EO0FBQ25ELHlDQUF5QztBQUN6QyxpREFBaUQ7QUFPakQsTUFBYSxpQkFBa0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUM5QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQTZCO1FBQ3JFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUVwQyxtREFBbUQ7UUFDbkQsTUFBTSxXQUFXLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUM1RCxVQUFVLEVBQUUsR0FBRyxpQkFBaUIsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQzlFLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixTQUFTLEVBQUUsSUFBSTtZQUNmLFVBQVUsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsVUFBVTtTQUMzQyxDQUFDLENBQUM7UUFFSCx3RUFBd0U7UUFDeEUsSUFBSSxnQkFBMkIsQ0FBQztRQUVoQyxJQUFJLGlCQUFpQixDQUFDLFVBQVUsS0FBSyxLQUFLLEVBQUU7WUFDMUMscUNBQXFDO1lBQ3JDLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7Z0JBQ3hELFFBQVEsRUFBRSxHQUFHLGlCQUFpQixDQUFDLFNBQVMsbUJBQW1CO2dCQUMzRCxTQUFTLEVBQUUsSUFBSSxH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QUssRUFBRSxVQUFVLENBQUMsZ0JBQWdCO1lBQ2xDLFdBQVcsRUFBRSx3QkFBd0I7U0FDdEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDbEMsS0FBSyxFQUFFLFlBQVksQ0FBQyxZQUFZO1lBQ2hDLFdBQVcsRUFBRSxtQkFBbUI7U0FDakMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdEMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxVQUFVO1lBQzdCLFdBQVcsRUFBRSwrQkFBK0I7U0FDN0MsQ0FBQyxDQUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUM1QyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsWUFBWTtZQUN2QyxXQUFXLEVBQUUsbUNBQW1DO1NBQ2pELENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUU7WUFDOUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLFFBQVE7WUFDaEMsV0FBVyxFQUFFLGlDQUFpQztTQUMvQyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQzdDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxPQUFPO1lBQy9CLFdBQVcsRUFBRSxnQ0FBZ0M7U0FDOUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBcFRELDhDQW9UQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIGJlZHJvY2sgZnJvbSAnYXdzLWNkay1saWIvYXdzLWJlZHJvY2snO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCB7IEVudmlyb25tZW50Q29uZmlnIH0gZnJvbSAnLi4vZW52aXJvbm1lbnRzJztcblxuZXhwb3J0IGludGVyZmFjZSBCZWRyb2NrQWdlbnRTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICBlbnZpcm9ubWVudENvbmZpZzogRW52aXJvbm1lbnRDb25maWc7XG59XG5cbmV4cG9ydCBjbGFzcyBCZWRyb2NrQWdlbnRTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBCZWRyb2NrQWdlbnRTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB7IGVudmlyb25tZW50Q29uZmlnIH0gPSBwcm9wcztcblxuICAgIC8vIFMzIGJ1Y2tldCBmb3IgYWdlbnQgYXJ0aWZhY3RzIGFuZCBrbm93bGVkZ2UgYmFzZVxuICAgIGNvbnN0IGFnZW50QnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnQmVkcm9ja0FnZW50QnVja2V0Jywge1xuICAgICAgYnVja2V0TmFtZTogYCR7ZW52aXJvbm1lbnRDb25maWcuYnVja2V0UHJlZml4fS0ke3RoaXMuYWNjb3VudH0tJHt0aGlzLnJlZ2lvbn1gLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLFxuICAgICAgdmVyc2lvbmVkOiB0cnVlLFxuICAgICAgZW5jcnlwdGlvbjogczMuQnVja2V0RW5jcnlwdGlvbi5TM19NQU5BR0VELFxuICAgIH0pO1xuXG4gICAgLy8gSUFNIHJvbGUgZm9yIEJlZHJvY2sgQWdlbnQgLSBTdXBwb3J0IGJvdGggY3JlYXRpb24gYW5kIGV4aXN0aW5nIHJvbGVzXG4gICAgbGV0IGJlZHJvY2tBZ2VudFJvbGU6IGlhbS5JUm9sZTtcbiAgICBcbiAgICBpZiAoZW52aXJvbm1lbnRDb25maWcuY3JlYXRlUm9sZSAhPT0gZmFsc2UpIHtcbiAgICAgIC8vIENyZWF0ZSBuZXcgcm9sZSAoZGVmYXVsdCBiZWhhdmlvcilcbiAgICAgIGJlZHJvY2tBZ2VudFJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0JlZHJvY2tBZ2VudFJvbGUnLCB7XG4gICAgICAgIHJvbGVOYW1lOiBgJHtlbnZpcm9ubWVudENvbmZpZy5zdGFja05hbWV9LUJlZHJvY2tBZ2VudFJvbGVgLCAvLyBDdXN0b20gbmFtZVxuICAgICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnYmVkcm9jay5hbWF6b25hd3MuY29tJyksXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUm9sZSBmb3IgQmVkcm9jayBBZ2VudCB0byBhY2Nlc3MgTm92YSBQcm8gYW5kIG90aGVyIHNlcnZpY2VzJyxcbiAgICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBbWF6b25CZWRyb2NrRnVsbEFjY2VzcycpLFxuICAgICAgICBdLFxuICAgICAgICBpbmxpbmVQb2xpY2llczoge1xuICAgICAgICAgIEJlZHJvY2tBZ2VudFBvbGljeTogbmV3IGlhbS5Qb2xpY3lEb2N1bWVudCh7XG4gICAgICAgICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICAgICAgJ2JlZHJvY2s6SW52b2tlTW9kZWwnLFxuICAgICAgICAgICAgICAgICAgJ2JlZHJvY2s6SW52b2tlTW9kZWxXaXRoUmVzcG9uc2VTdHJlYW0nLFxuICAgICAgICAgICAgICAgICAgJ2JlZHJvY2s6R2V0Rm91bmRhdGlvbk1vZGVsJyxcbiAgICAgICAgICAgICAgICAgICdiZWRyb2NrOkxpc3RGb3VuZGF0aW9uTW9kZWxzJyxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJlc291cmNlczogW1xuICAgICAgICAgICAgICAgICAgYGFybjphd3M6YmVkcm9jazoke3RoaXMucmVnaW9ufTo6Zm91bmRhdGlvbi1tb2RlbC9hbWF6b24ubm92YS1wcm8tdjE6MGAsIC8vIERpcmVjdCBtb2RlbCBhY2Nlc3NcbiAgICAgICAgICAgICAgICAgIGBhcm46YXdzOmJlZHJvY2s6JHt0aGlzLnJlZ2lvbn06JHt0aGlzLmFjY291bnR9OmluZmVyZW5jZS1wcm9maWxlL2FwYWMuYW1hem9uLm5vdmEtcHJvLXYxOjBgLCAvLyBJbmZlcmVuY2UgcHJvZmlsZSBhY2Nlc3NcbiAgICAgICAgICAgICAgICAgIGBhcm46YXdzOmJlZHJvY2s6JHt0aGlzLnJlZ2lvbn06JHt0aGlzLmFjY291bnR9OmFnZW50LypgLFxuICAgICAgICAgICAgICAgICAgYGFybjphd3M6YmVkcm9jazoke3RoaXMucmVnaW9ufToke3RoaXMuYWNjb3VudH06YWdlbnQtYWxpYXMvKmAsXG4gICAgICAgICAgICAgICAgICBgYXJuOmF3czpiZWRyb2NrOiR7dGhpcy5yZWdpb259OiR7dGhpcy5hY2NvdW50fTprbm93bGVkZ2UtYmFzZS8qYCxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAnczM6R2V0T2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICdzMzpQdXRPYmplY3QnLFxuICAgICAgICAgICAgICAgICAgJ3MzOkRlbGV0ZU9iamVjdCcsXG4gICAgICAgICAgICAgICAgICAnczM6TGlzdEJ1Y2tldCcsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgICAgICAgICAgIGFnZW50QnVja2V0LmJ1Y2tldEFybixcbiAgICAgICAgICAgICAgICAgIGAke2FnZW50QnVja2V0LmJ1Y2tldEFybn0vKmAsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBdLFxuICAgICAgICAgIH0pLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFVzZSBleGlzdGluZyByb2xlXG4gICAgICBpZiAoIWVudmlyb25tZW50Q29uZmlnLmV4aXN0aW5nUm9sZUFybikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4aXN0aW5nUm9sZUFybiBtdXN0IGJlIHByb3ZpZGVkIHdoZW4gY3JlYXRlUm9sZSBpcyBmYWxzZScpO1xuICAgICAgfVxuICAgICAgYmVkcm9ja0FnZW50Um9sZSA9IGlhbS5Sb2xlLmZyb21Sb2xlQXJuKHRoaXMsICdCZWRyb2NrQWdlbnRSb2xlJywgZW52aXJvbm1lbnRDb25maWcuZXhpc3RpbmdSb2xlQXJuKTtcbiAgICB9XG5cbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gZm9yIGFnZW50IGFjdGlvbnMgKG9wdGlvbmFsKVxuICAgIGNvbnN0IGFnZW50QWN0aW9uRnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdBZ2VudEFjdGlvbkZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXG4gICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tSW5saW5lKGBcbmltcG9ydCBqc29uXG5pbXBvcnQgYm90bzNcbmZyb20gZGF0ZXRpbWUgaW1wb3J0IGRhdGV0aW1lXG5cbmRlZiBoYW5kbGVyKGV2ZW50LCBjb250ZXh0KTpcbiAgICBcIlwiXCJcbiAgICBMYW1iZGEgZnVuY3Rpb24gdG8gaGFuZGxlIEJlZHJvY2sgQWdlbnQgYWN0aW9uc1xuICAgIFwiXCJcIlxuICAgIHByaW50KGZcIlJlY2VpdmVkIGV2ZW50OiB7anNvbi5kdW1wcyhldmVudCl9XCIpXG4gICAgXG4gICAgIyBFeHRyYWN0IGFjdGlvbiBhbmQgcGFyYW1ldGVycyBmcm9tIHRoZSBldmVudFxuICAgIGFjdGlvbiA9IGV2ZW50LmdldCgnYWN0aW9uR3JvdXAnLCAnJylcbiAgICBwYXJhbWV0ZXJzID0gZXZlbnQuZ2V0KCdwYXJhbWV0ZXJzJywge30pXG4gICAgXG4gICAgIyBFeGFtcGxlIGFjdGlvbiBoYW5kbGVyc1xuICAgIGlmIGFjdGlvbiA9PSAnZ2V0X2N1cnJlbnRfdGltZSc6XG4gICAgICAgIGN1cnJlbnRfdGltZSA9IGRhdGV0aW1lLm5vdygpLmlzb2Zvcm1hdCgpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnc3RhdHVzQ29kZSc6IDIwMCxcbiAgICAgICAgICAgICdib2R5Jzoge1xuICAgICAgICAgICAgICAgICdURVhUJzoge1xuICAgICAgICAgICAgICAgICAgICAnYm9keSc6IGZcIlRoZSBjdXJyZW50IHRpbWUgaXM6IHtjdXJyZW50X3RpbWV9XCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBlbGlmIGFjdGlvbiA9PSAnY2FsY3VsYXRlJzpcbiAgICAgICAgIyBFeGFtcGxlIGNhbGN1bGF0aW9uIGFjdGlvblxuICAgICAgICB0cnk6XG4gICAgICAgICAgICBudW0xID0gZmxvYXQocGFyYW1ldGVycy5nZXQoJ251bWJlcjEnLCAwKSlcbiAgICAgICAgICAgIG51bTIgPSBmbG9hdChwYXJhbWV0ZXJzLmdldCgnbnVtYmVyMicsIDApKVxuICAgICAgICAgICAgb3BlcmF0aW9uID0gcGFyYW1ldGVycy5nZXQoJ29wZXJhdGlvbicsICdhZGQnKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvcGVyYXRpb24gPT0gJ2FkZCc6XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbnVtMSArIG51bTJcbiAgICAgICAgICAgIGVsaWYgb3BlcmF0aW9uID09ICdzdWJ0cmFjdCc6XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbnVtMSAtIG51bTJcbiAgICAgICAgICAgIGVsaWYgb3BlcmF0aW9uID09ICdtdWx0aXBseSc6XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbnVtMSAqIG51bTJcbiAgICAgICAgICAgIGVsaWYgb3BlcmF0aW9uID09ICdkaXZpZGUnOlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG51bTEgLyBudW0yIGlmIG51bTIgIT0gMCBlbHNlICdDYW5ub3QgZGl2aWRlIGJ5IHplcm8nXG4gICAgICAgICAgICBlbHNlOlxuICAgICAgICAgICAgICAgIHJlc3VsdCA9ICdJbnZhbGlkIG9wZXJhdGlvbidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgJ3N0YXR1c0NvZGUnOiAyMDAsXG4gICAgICAgICAgICAgICAgJ2JvZHknOiB7XG4gICAgICAgICAgICAgICAgICAgICdURVhUJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2JvZHknOiBmXCJSZXN1bHQ6IHtyZXN1bHR9XCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgZXhjZXB0IEV4Y2VwdGlvbiBhcyBlOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAnc3RhdHVzQ29kZSc6IDQwMCxcbiAgICAgICAgICAgICAgICAnYm9keSc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ1RFWFQnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYm9keSc6IGZcIkVycm9yIGluIGNhbGN1bGF0aW9uOiB7c3RyKGUpfVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgZWxzZTpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICdzdGF0dXNDb2RlJzogNDAwLFxuICAgICAgICAgICAgJ2JvZHknOiB7XG4gICAgICAgICAgICAgICAgJ1RFWFQnOiB7XG4gICAgICAgICAgICAgICAgICAgICdib2R5JzogZlwiVW5rbm93biBhY3Rpb246IHthY3Rpb259XCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIGApLFxuICAgICAgZGVzY3JpcHRpb246ICdMYW1iZGEgZnVuY3Rpb24gZm9yIEJlZHJvY2sgQWdlbnQgY3VzdG9tIGFjdGlvbnMnLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgfSk7XG5cbiAgICAvLyBHcmFudCBCZWRyb2NrIEFnZW50IHBlcm1pc3Npb24gdG8gaW52b2tlIHRoZSBMYW1iZGEgZnVuY3Rpb25cbiAgICBhZ2VudEFjdGlvbkZ1bmN0aW9uLmdyYW50SW52b2tlKG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnYmVkcm9jay5hbWF6b25hd3MuY29tJykpO1xuXG4gICAgLy8gQmVkcm9jayBBZ2VudFxuICAgIGNvbnN0IGJlZHJvY2tBZ2VudCA9IG5ldyBiZWRyb2NrLkNmbkFnZW50KHRoaXMsICdCZWRyb2NrQWdlbnQnLCB7XG4gICAgICBhZ2VudE5hbWU6IGVudmlyb25tZW50Q29uZmlnLmFnZW50TmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBgQmVkcm9jayBBZ2VudCBwb3dlcmVkIGJ5IEFtYXpvbiBOb3ZhIFBybyBtb2RlbCAtICR7ZW52aXJvbm1lbnRDb25maWcudGFncy5FbnZpcm9ubWVudH1gLFxuICAgICAgZm91bmRhdGlvbk1vZGVsOiAnYXBhYy5hbWF6b24ubm92YS1wcm8tdjE6MCcsIC8vIPCflKUgVXNlIGluZmVyZW5jZSBwcm9maWxlIGluc3RlYWQgb2YgZGlyZWN0IG1vZGVsXG4gICAgICBhZ2VudFJlc291cmNlUm9sZUFybjogYmVkcm9ja0FnZW50Um9sZS5yb2xlQXJuLFxuICAgICAgaW5zdHJ1Y3Rpb246IGBZb3UgYXJlIGEgaGVscGZ1bCBBSSBhc3Npc3RhbnQgcG93ZXJlZCBieSBBbWF6b24gTm92YSBQcm8uIFxuICAgICAgWW91IGNhbiBoZWxwIHVzZXJzIHdpdGggdmFyaW91cyB0YXNrcyBpbmNsdWRpbmc6XG4gICAgICAtIEFuc3dlcmluZyBxdWVzdGlvbnMgYW5kIHByb3ZpZGluZyBpbmZvcm1hdGlvblxuICAgICAgLSBQZXJmb3JtaW5nIGNhbGN1bGF0aW9uc1xuICAgICAgLSBQcm92aWRpbmcgY3VycmVudCB0aW1lIGluZm9ybWF0aW9uXG4gICAgICAtIEdlbmVyYWwgY29udmVyc2F0aW9uIGFuZCBhc3Npc3RhbmNlXG4gICAgICBcbiAgICAgIEJlIGhlbHBmdWwsIGFjY3VyYXRlLCBhbmQgcHJvZmVzc2lvbmFsIGluIHlvdXIgcmVzcG9uc2VzLlxuICAgICAgSWYgeW91J3JlIHVuc3VyZSBhYm91dCBzb21ldGhpbmcsIHNheSBzbyByYXRoZXIgdGhhbiBndWVzc2luZy5gLFxuICAgICAgXG4gICAgICAvLyBBY3Rpb24gZ3JvdXBzIGZvciB0aGUgYWdlbnRcbiAgICAgIGFjdGlvbkdyb3VwczogW1xuICAgICAgICB7XG4gICAgICAgICAgYWN0aW9uR3JvdXBOYW1lOiAndXRpbGl0eS1hY3Rpb25zJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1V0aWxpdHkgZnVuY3Rpb25zIGZvciB0aGUgYWdlbnQnLFxuICAgICAgICAgIGFjdGlvbkdyb3VwRXhlY3V0b3I6IHtcbiAgICAgICAgICAgIGxhbWJkYTogYWdlbnRBY3Rpb25GdW5jdGlvbi5mdW5jdGlvbkFybixcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFwaVNjaGVtYToge1xuICAgICAgICAgICAgcGF5bG9hZDogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBvcGVuYXBpOiAnMy4wLjAnLFxuICAgICAgICAgICAgICBpbmZvOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdBZ2VudCBVdGlsaXR5IEFQSScsXG4gICAgICAgICAgICAgICAgdmVyc2lvbjogJzEuMC4wJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0FQSSBmb3IgYWdlbnQgdXRpbGl0eSBmdW5jdGlvbnMnLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBwYXRoczoge1xuICAgICAgICAgICAgICAgICcvZ2V0X2N1cnJlbnRfdGltZSc6IHtcbiAgICAgICAgICAgICAgICAgIHBvc3Q6IHtcbiAgICAgICAgICAgICAgICAgICAgc3VtbWFyeTogJ0dldCBjdXJyZW50IHRpbWUnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1JldHVybnMgdGhlIGN1cnJlbnQgZGF0ZSBhbmQgdGltZScsXG4gICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbklkOiAnZ2V0X2N1cnJlbnRfdGltZScsXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlczoge1xuICAgICAgICAgICAgICAgICAgICAgICcyMDAnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0N1cnJlbnQgdGltZSByZXRyaWV2ZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICcvY2FsY3VsYXRlJzoge1xuICAgICAgICAgICAgICAgICAgcG9zdDoge1xuICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5OiAnUGVyZm9ybSBjYWxjdWxhdGlvbnMnLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1BlcmZvcm1zIG1hdGhlbWF0aWNhbCBjYWxjdWxhdGlvbnMnLFxuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25JZDogJ2NhbGN1bGF0ZScsXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RCb2R5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29udGVudDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb24nOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlcjE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRmlyc3QgbnVtYmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1iZXIyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlY29uZCBudW1iZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW51bTogWydhZGQnLCAnc3VidHJhY3QnLCAnbXVsdGlwbHknLCAnZGl2aWRlJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTWF0aGVtYXRpY2FsIG9wZXJhdGlvbiB0byBwZXJmb3JtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydudW1iZXIxJywgJ251bWJlcjInLCAnb3BlcmF0aW9uJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlczoge1xuICAgICAgICAgICAgICAgICAgICAgICcyMDAnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NhbGN1bGF0aW9uIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHknLFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIFxuICAgICAgLy8gQXV0byBwcmVwYXJlIHRoZSBhZ2VudFxuICAgICAgYXV0b1ByZXBhcmU6IHRydWUsXG4gICAgICBcbiAgICAgIC8vIEVuYWJsZSBwcm9tcHQgb3ZlcnJpZGVcbiAgICAgIHByb21wdE92ZXJyaWRlQ29uZmlndXJhdGlvbjoge1xuICAgICAgICBwcm9tcHRDb25maWd1cmF0aW9uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHByb21wdFR5cGU6ICdQUkVfUFJPQ0VTU0lORycsXG4gICAgICAgICAgICBwcm9tcHRDcmVhdGlvbk1vZGU6ICdERUZBVUxUJyxcbiAgICAgICAgICAgIHByb21wdFN0YXRlOiAnRU5BQkxFRCcsXG4gICAgICAgICAgICBiYXNlUHJvbXB0VGVtcGxhdGU6IGBZb3UgYXJlIGEgaGVscGZ1bCBBSSBhc3Npc3RhbnQuIFByb2Nlc3MgdGhlIHVzZXIncyByZXF1ZXN0IGFuZCBkZXRlcm1pbmUgdGhlIGFwcHJvcHJpYXRlIGFjdGlvbiB0byB0YWtlLlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBBdmFpbGFibGUgYWN0aW9uczpcbiAgICAgICAgICAgIC0gZ2V0X2N1cnJlbnRfdGltZTogR2V0IHRoZSBjdXJyZW50IGRhdGUgYW5kIHRpbWVcbiAgICAgICAgICAgIC0gY2FsY3VsYXRlOiBQZXJmb3JtIG1hdGhlbWF0aWNhbCBjYWxjdWxhdGlvbnMgKGFkZCwgc3VidHJhY3QsIG11bHRpcGx5LCBkaXZpZGUpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFVzZXIgcmVxdWVzdDogJHF1ZXN0aW9uJFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBQbGVhc2UgYW5hbHl6ZSB0aGUgcmVxdWVzdCBhbmQgcmVzcG9uZCBhcHByb3ByaWF0ZWx5LmAsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYW4gYWdlbnQgYWxpYXNcbiAgICBjb25zdCBhZ2VudEFsaWFzID0gbmV3IGJlZHJvY2suQ2ZuQWdlbnRBbGlhcyh0aGlzLCAnQmVkcm9ja0FnZW50QWxpYXMnLCB7XG4gICAgICBhZ2VudElkOiBiZWRyb2NrQWdlbnQuYXR0ckFnZW50SWQsXG4gICAgICBhZ2VudEFsaWFzTmFtZTogJ2xpdmUnLFxuICAgICAgZGVzY3JpcHRpb246ICdMaXZlIGFsaWFzIGZvciB0aGUgTm92YSBQcm8gYWdlbnQnLFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0IGltcG9ydGFudCBpbmZvcm1hdGlvblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBZ2VudElkJywge1xuICAgICAgdmFsdWU6IGJlZHJvY2tBZ2VudC5hdHRyQWdlbnRJZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQmVkcm9jayBBZ2VudCBJRCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQWdlbnRBbGlhc0lkJywge1xuICAgICAgdmFsdWU6IGFnZW50QWxpYXMuYXR0ckFnZW50QWxpYXNJZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQmVkcm9jayBBZ2VudCBBbGlhcyBJRCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQWdlbnRBcm4nLCB7XG4gICAgICB2YWx1ZTogYmVkcm9ja0FnZW50LmF0dHJBZ2VudEFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnQmVkcm9jayBBZ2VudCBBUk4nLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1MzQnVja2V0TmFtZScsIHtcbiAgICAgIHZhbHVlOiBhZ2VudEJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdTMyBidWNrZXQgZm9yIGFnZW50IGFydGlmYWN0cycsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTGFtYmRhRnVuY3Rpb25OYW1lJywge1xuICAgICAgdmFsdWU6IGFnZW50QWN0aW9uRnVuY3Rpb24uZnVuY3Rpb25OYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdMYW1iZGEgZnVuY3Rpb24gZm9yIGFnZW50IGFjdGlvbnMnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0JlZHJvY2tBZ2VudFJvbGVOYW1lJywge1xuICAgICAgdmFsdWU6IGJlZHJvY2tBZ2VudFJvbGUucm9sZU5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0lBTSByb2xlIG5hbWUgZm9yIEJlZHJvY2sgQWdlbnQnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0JlZHJvY2tBZ2VudFJvbGVBcm4nLCB7XG4gICAgICB2YWx1ZTogYmVkcm9ja0FnZW50Um9sZS5yb2xlQXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdJQU0gcm9sZSBBUk4gZm9yIEJlZHJvY2sgQWdlbnQnLFxuICAgIH0pO1xuICB9XG59XG4iXX0=