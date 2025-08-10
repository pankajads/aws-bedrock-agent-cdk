# Bedrock Agent CDK Project

This CDK project creates an Amazon Bedrock Agent powered by the Amazon Nova Pro model with custom action groups and Lambda integration.

## Architecture

The stack creates:
- **Bedrock Agent**: Powered by Amazon Nova Pro model
- **Lambda Function**: For custom agent actions (calculations, time queries)
- **IAM Roles**: Proper permissions for agent and services
- **S3 Bucket**: For agent artifacts and knowledge base storage
- **Agent Alias**: Live deployment alias

## Features

The Bedrock Agent includes:
- Integration with Amazon Nova Pro model (`amazon.nova-pro-v1:0`)
- Custom action groups for utility functions:
  - Current time retrieval
  - Mathematical calculations (add, subtract, multiply, divide)
- Proper error handling and response formatting
- Auto-prepare configuration for immediate use

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Node.js** (version 18 or later)
3. **AWS CDK** v2 installed globally: `pnpm add -g aws-cdk`
4. **PNPM** package manager: `npm install -g pnpm`
5. **Access to Amazon Nova Pro** model in your AWS account

## Setup and Deployment

### 1. Install Dependencies
```bash
cd /Users/pankajnegi/Desktop/awsdevday/bedrock_agent_cdk
pnpm install
```

### 2. Bootstrap CDK (first time only)
```bash
pnpm exec cdk bootstrap
```

### 3. Build the Project
```bash
pnpm run build
```

### 4. Deploy the Stack
```bash
pnpm exec cdk deploy
```

### 5. View Stack Outputs
After deployment, note the outputs:
- `AgentId`: Use this to interact with your agent
- `AgentAliasId`: The alias ID for the live version
- `AgentArn`: Full ARN of the agent
- `S3BucketName`: Bucket for agent storage
- `LambdaFunctionName`: Lambda function handling custom actions

## Testing the Agent

Once deployed, you can test the agent using the AWS CLI or SDK:

```bash
# Example: Invoke the agent for a calculation
aws bedrock-agent-runtime invoke-agent \
    --agent-id <AgentId> \
    --agent-alias-id <AgentAliasId> \
    --session-id test-session-1 \
    --input-text "What is 25 + 37?" \
    --region us-east-1
```

## Agent Capabilities

### Built-in Capabilities (Nova Pro)
- General conversation and Q&A
- Text analysis and generation
- Reasoning and problem solving

### Custom Actions
- **Get Current Time**: Returns current date and time
- **Mathematical Calculations**: Performs basic math operations

### Example Interactions
- "What time is it?"
- "Calculate 15 * 8"
- "What is 100 divided by 4?"
- "Add 45 and 23"
- "Tell me about artificial intelligence"

## Configuration

### Model Configuration
- **Foundation Model**: `amazon.nova-pro-v1:0`
- **Auto Prepare**: Enabled for immediate use
- **Prompt Override**: Custom preprocessing prompts

### Lambda Function
The Lambda function handles custom actions with the following endpoints:
- `/get_current_time`: Returns current timestamp
- `/calculate`: Performs mathematical operations

### IAM Permissions
The agent has permissions for:
- Invoking Bedrock models (Nova Pro)
- Managing agent resources
- Accessing S3 bucket for artifacts
- Invoking Lambda functions for actions

## Customization

### Adding New Actions
1. Update the Lambda function in `lib/bedrock-agent-stack.ts`
2. Add new API endpoints to the OpenAPI schema
3. Implement the action handlers in the Lambda code
4. Redeploy the stack

### Modifying Agent Instructions
Update the `instruction` field in the `bedrock.CfnAgent` configuration to change the agent's behavior and personality.

### Adding Knowledge Base
To add a knowledge base:
1. Create a knowledge base resource
2. Associate it with the agent
3. Configure data sources (S3, web crawling, etc.)

## Cleanup

To avoid ongoing charges, destroy the stack when done:

```bash
pnpm exec cdk destroy
```

## Security Considerations

- The agent uses least-privilege IAM roles
- S3 bucket has encryption enabled
- Lambda function has appropriate timeout limits
- All resources follow AWS security best practices

## Troubleshooting

### Common Issues
1. **Model Access**: Ensure you have access to Nova Pro in your region
2. **IAM Permissions**: Check that your deployment role has necessary permissions
3. **Region Support**: Verify Nova Pro is available in your target region

### Useful Commands
- `pnpm exec cdk synth`: View the CloudFormation template
- `pnpm exec cdk diff`: Compare deployed stack with current code
- `pnpm exec cdk ls`: List all stacks in the app

## Cost Optimization

- S3 bucket configured with lifecycle policies
- Lambda function has appropriate memory/timeout settings
- Bedrock agent uses pay-per-use pricing model

## Next Steps

1. **Add Knowledge Base**: Integrate document repositories
2. **Enhanced Actions**: Add more complex business logic
3. **Monitoring**: Implement CloudWatch dashboards
4. **Multi-Agent**: Create specialized agents for different domains

## Support

For issues with:
- **CDK**: Check AWS CDK documentation
- **Bedrock**: Reference Amazon Bedrock developer guide
- **Nova Pro**: See Amazon Nova model documentation