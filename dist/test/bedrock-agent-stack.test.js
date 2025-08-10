"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("aws-cdk-lib");
const assertions_1 = require("aws-cdk-lib/assertions");
const bedrock_agent_stack_1 = require("../lib/bedrock-agent-stack");
const dev_1 = require("../environments/dev");
test('Bedrock Agent Stack Created', () => {
    const app = new cdk.App();
    const stack = new bedrock_agent_stack_1.BedrockAgentStack(app, 'TestBedrockAgentStack', {
        env: {
            account: '123456789012',
            region: 'us-east-1',
        },
        environmentConfig: dev_1.devConfig,
    });
    const template = assertions_1.Template.fromStack(stack);
    // Test that a Bedrock Agent is created
    template.hasResourceProperties('AWS::Bedrock::Agent', {
        AgentName: dev_1.devConfig.agentName,
        FoundationModel: 'amazon.nova-pro-v1:0',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkcm9jay1hZ2VudC1zdGFjay50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdGVzdC9iZWRyb2NrLWFnZW50LXN0YWNrLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBbUM7QUFDbkMsdURBQWtEO0FBQ2xELG9FQUErRDtBQUMvRCw2Q0FBZ0Q7QUFFaEQsSUFBSSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtJQUN2QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMxQixNQUFNLEtBQUssR0FBRyxJQUFJLHVDQUFpQixDQUFDLEdBQUcsRUFBRSx1QkFBdUIsRUFBRTtRQUNoRSxHQUFHLEVBQUU7WUFDSCxPQUFPLEVBQUUsY0FBYztZQUN2QixNQUFNLEVBQUUsV0FBVztTQUNwQjtRQUNELGlCQUFpQixFQUFFLGVBQVM7S0FDN0IsQ0FBQyxDQUFDO0lBRUgsTUFBTSxRQUFRLEdBQUcscUJBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFM0MsdUNBQXVDO0lBQ3ZDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxxQkFBcUIsRUFBRTtRQUNwRCxTQUFTLEVBQUUsZUFBUyxDQUFDLFNBQVM7UUFDOUIsZUFBZSxFQUFFLHNCQUFzQjtLQUN4QyxDQUFDLENBQUM7SUFFSCx1Q0FBdUM7SUFDdkMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLHVCQUF1QixFQUFFO1FBQ3RELE9BQU8sRUFBRSxZQUFZO1FBQ3JCLE9BQU8sRUFBRSxlQUFlO0tBQ3pCLENBQUMsQ0FBQztJQUVILGlDQUFpQztJQUNqQyxRQUFRLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLEVBQUU7UUFDaEQsdUJBQXVCLEVBQUU7WUFDdkIsTUFBTSxFQUFFLFNBQVM7U0FDbEI7S0FDRixDQUFDLENBQUM7SUFFSCw4Q0FBOEM7SUFDOUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixFQUFFO1FBQy9DLHdCQUF3QixFQUFFO1lBQ3hCLFNBQVMsRUFBRTtnQkFDVDtvQkFDRSxNQUFNLEVBQUUsZ0JBQWdCO29CQUN4QixNQUFNLEVBQUUsT0FBTztvQkFDZixTQUFTLEVBQUU7d0JBQ1QsT0FBTyxFQUFFLHVCQUF1QjtxQkFDakM7aUJBQ0Y7YUFDRjtZQUNELE9BQU8sRUFBRSxZQUFZO1NBQ3RCO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgVGVtcGxhdGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hc3NlcnRpb25zJztcbmltcG9ydCB7IEJlZHJvY2tBZ2VudFN0YWNrIH0gZnJvbSAnLi4vbGliL2JlZHJvY2stYWdlbnQtc3RhY2snO1xuaW1wb3J0IHsgZGV2Q29uZmlnIH0gZnJvbSAnLi4vZW52aXJvbm1lbnRzL2Rldic7XG5cbnRlc3QoJ0JlZHJvY2sgQWdlbnQgU3RhY2sgQ3JlYXRlZCcsICgpID0+IHtcbiAgY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbiAgY29uc3Qgc3RhY2sgPSBuZXcgQmVkcm9ja0FnZW50U3RhY2soYXBwLCAnVGVzdEJlZHJvY2tBZ2VudFN0YWNrJywge1xuICAgIGVudjoge1xuICAgICAgYWNjb3VudDogJzEyMzQ1Njc4OTAxMicsXG4gICAgICByZWdpb246ICd1cy1lYXN0LTEnLFxuICAgIH0sXG4gICAgZW52aXJvbm1lbnRDb25maWc6IGRldkNvbmZpZyxcbiAgfSk7XG5cbiAgY29uc3QgdGVtcGxhdGUgPSBUZW1wbGF0ZS5mcm9tU3RhY2soc3RhY2spO1xuXG4gIC8vIFRlc3QgdGhhdCBhIEJlZHJvY2sgQWdlbnQgaXMgY3JlYXRlZFxuICB0ZW1wbGF0ZS5oYXNSZXNvdXJjZVByb3BlcnRpZXMoJ0FXUzo6QmVkcm9jazo6QWdlbnQnLCB7XG4gICAgQWdlbnROYW1lOiBkZXZDb25maWcuYWdlbnROYW1lLFxuICAgIEZvdW5kYXRpb25Nb2RlbDogJ2FtYXpvbi5ub3ZhLXByby12MTowJyxcbiAgfSk7XG5cbiAgLy8gVGVzdCB0aGF0IExhbWJkYSBmdW5jdGlvbiBpcyBjcmVhdGVkXG4gIHRlbXBsYXRlLmhhc1Jlc291cmNlUHJvcGVydGllcygnQVdTOjpMYW1iZGE6OkZ1bmN0aW9uJywge1xuICAgIFJ1bnRpbWU6ICdweXRob24zLjExJyxcbiAgICBIYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gIH0pO1xuXG4gIC8vIFRlc3QgdGhhdCBTMyBidWNrZXQgaXMgY3JlYXRlZFxuICB0ZW1wbGF0ZS5oYXNSZXNvdXJjZVByb3BlcnRpZXMoJ0FXUzo6UzM6OkJ1Y2tldCcsIHtcbiAgICBWZXJzaW9uaW5nQ29uZmlndXJhdGlvbjoge1xuICAgICAgU3RhdHVzOiAnRW5hYmxlZCcsXG4gICAgfSxcbiAgfSk7XG5cbiAgLy8gVGVzdCB0aGF0IElBTSByb2xlIGlzIGNyZWF0ZWQgZm9yIHRoZSBhZ2VudFxuICB0ZW1wbGF0ZS5oYXNSZXNvdXJjZVByb3BlcnRpZXMoJ0FXUzo6SUFNOjpSb2xlJywge1xuICAgIEFzc3VtZVJvbGVQb2xpY3lEb2N1bWVudDoge1xuICAgICAgU3RhdGVtZW50OiBbXG4gICAgICAgIHtcbiAgICAgICAgICBBY3Rpb246ICdzdHM6QXNzdW1lUm9sZScsXG4gICAgICAgICAgRWZmZWN0OiAnQWxsb3cnLFxuICAgICAgICAgIFByaW5jaXBhbDoge1xuICAgICAgICAgICAgU2VydmljZTogJ2JlZHJvY2suYW1hem9uYXdzLmNvbScsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBWZXJzaW9uOiAnMjAxMi0xMC0xNycsXG4gICAgfSxcbiAgfSk7XG59KTtcbiJdfQ==