"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devConfig = void 0;
exports.devConfig = {
    accountId: process.env.CDK_DEFAULT_ACCOUNT || '',
    region: 'ap-southeast-1',
    stackName: 'BedrockAgentStack-Dev',
    agentName: 'nova-pro-agent-dev',
    bucketPrefix: 'bedrock-agent-dev',
    createRole: true,
    // existingRoleArn: 'arn:aws:iam::ACCOUNT:role/MyPreExistingRole', // Uncomment if using existing
    tags: {
        Environment: 'Development',
        Project: 'BedrockAgent',
        CostCenter: 'Development',
        Owner: 'DevTeam'
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vZW52aXJvbm1lbnRzL2Rldi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFYSxRQUFBLFNBQVMsR0FBc0I7SUFDMUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLElBQUksRUFBRTtJQUNoRCxNQUFNLEVBQUUsZ0JBQWdCO0lBQ3hCLFNBQVMsRUFBRSx1QkFBdUI7SUFDbEMsU0FBUyxFQUFFLG9CQUFvQjtJQUMvQixZQUFZLEVBQUUsbUJBQW1CO0lBQ2pDLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLGlHQUFpRztJQUNqRyxJQUFJLEVBQUU7UUFDSixXQUFXLEVBQUUsYUFBYTtRQUMxQixPQUFPLEVBQUUsY0FBYztRQUN2QixVQUFVLEVBQUUsYUFBYTtRQUN6QixLQUFLLEVBQUUsU0FBUztLQUNqQjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbnZpcm9ubWVudENvbmZpZyB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgY29uc3QgZGV2Q29uZmlnOiBFbnZpcm9ubWVudENvbmZpZyA9IHtcbiAgYWNjb3VudElkOiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5UIHx8ICcnLFxuICByZWdpb246ICdhcC1zb3V0aGVhc3QtMScsXG4gIHN0YWNrTmFtZTogJ0JlZHJvY2tBZ2VudFN0YWNrLURldicsXG4gIGFnZW50TmFtZTogJ25vdmEtcHJvLWFnZW50LWRldicsXG4gIGJ1Y2tldFByZWZpeDogJ2JlZHJvY2stYWdlbnQtZGV2JyxcbiAgY3JlYXRlUm9sZTogdHJ1ZSwgLy8gU2V0IHRvIGZhbHNlIHRvIHVzZSBleGlzdGluZyByb2xlXG4gIC8vIGV4aXN0aW5nUm9sZUFybjogJ2Fybjphd3M6aWFtOjpBQ0NPVU5UOnJvbGUvTXlQcmVFeGlzdGluZ1JvbGUnLCAvLyBVbmNvbW1lbnQgaWYgdXNpbmcgZXhpc3RpbmdcbiAgdGFnczoge1xuICAgIEVudmlyb25tZW50OiAnRGV2ZWxvcG1lbnQnLFxuICAgIFByb2plY3Q6ICdCZWRyb2NrQWdlbnQnLFxuICAgIENvc3RDZW50ZXI6ICdEZXZlbG9wbWVudCcsXG4gICAgT3duZXI6ICdEZXZUZWFtJ1xuICB9XG59O1xuIl19