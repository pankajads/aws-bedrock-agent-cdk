# Quick Start Guide

## Deploy the Bedrock Agent in 5 Minutes

### 1. Prerequisites Check
```bash
# Verify AWS CLI is configured
aws sts get-caller-identity

# Check if you have Nova Pro access
aws bedrock list-foundation-models --region us-east-1 | grep nova-pro
```

### 2. Install and Deploy
```bash
cd /Users/pankajnegi/Desktop/awsdevday/bedrock_agent_cdk

# Install dependencies
pnpm install

# Build project
pnpm run build

# Deploy to development environment
pnpm run deploy:dev
```

### 3. Deploy to Other Environments
```bash
# Deploy to staging
pnpm run deploy:staging

# Deploy to production  
pnpm run deploy:prod
```

### 4. Test Your Agent
```bash
# Get your agent details from the deployment output, then:
aws bedrock-agent-runtime invoke-agent \
    --agent-id <your-agent-id> \
    --agent-alias-id <your-alias-id> \
    --session-id test-session \
    --input-text "What is 50 + 25?" \
    --region us-east-1
```

## What You Get

✅ **Bedrock Agent** with Nova Pro model  
✅ **Custom Actions** for calculations and time  
✅ **Lambda Function** for action processing  
✅ **S3 Bucket** for agent storage  
✅ **Proper IAM** roles and permissions  
✅ **Agent Alias** for live deployment  
✅ **Multi-environment** support (dev/staging/prod)

## Environment-Specific Commands

### Development
```bash
pnpm run bootstrap:dev    # Bootstrap dev environment
pnpm run deploy:dev       # Deploy to dev
pnpm run synth:dev        # View dev template
```

### Staging  
```bash
pnpm run bootstrap:staging    # Bootstrap staging environment
pnpm run deploy:staging       # Deploy to staging
pnpm run synth:staging        # View staging template
```

### Production
```bash
pnpm run bootstrap:prod    # Bootstrap prod environment
pnpm run deploy:prod       # Deploy to prod
pnpm run synth:prod        # View prod template
```

## Common Commands

```bash
# View what will be deployed (dev environment)
pnpm run synth:dev

# Deploy with approval prompts
pnpm run deploy:dev

# Check deployment status
aws cloudformation describe-stacks --stack-name BedrockAgentStack-Dev

# Clean up specific environment
pnpm exec cdk destroy --context environment=dev
```

## Need Help?

- Check the full documentation in `bedrocj_agent_cdk.md`
- View AWS Bedrock console for agent status
- Check CloudWatch logs for debugging
- Each environment has its own isolated resources
