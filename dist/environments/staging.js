"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stagingConfig = void 0;
exports.stagingConfig = {
    accountId: process.env.CDK_DEFAULT_ACCOUNT || '',
    region: 'ap-southeast-1',
    stackName: 'BedrockAgentStack-Staging',
    agentName: 'nova-pro-agent-staging',
    bucketPrefix: 'bedrock-agent-staging',
    tags: {
        Environment: 'Staging',
        Project: 'BedrockAgent',
        CostCenter: 'QA',
        Owner: 'QATeam'
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2Vudmlyb25tZW50cy9zdGFnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVhLFFBQUEsYUFBYSxHQUFzQjtJQUM5QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsSUFBSSxFQUFFO0lBQ2hELE1BQU0sRUFBRSxnQkFBZ0I7SUFDeEIsU0FBUyxFQUFFLDJCQUEyQjtJQUN0QyxTQUFTLEVBQUUsd0JBQXdCO0lBQ25DLFlBQVksRUFBRSx1QkFBdUI7SUFDckMsSUFBSSxFQUFFO1FBQ0osV0FBVyxFQUFFLFNBQVM7UUFDdEIsT0FBTyxFQUFFLGNBQWM7UUFDdkIsVUFBVSxFQUFFLElBQUk7UUFDaEIsS0FBSyxFQUFFLFFBQVE7S0FDaEI7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRW52aXJvbm1lbnRDb25maWcgfSBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGNvbnN0IHN0YWdpbmdDb25maWc6IEVudmlyb25tZW50Q29uZmlnID0ge1xuICBhY2NvdW50SWQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQgfHwgJycsXG4gIHJlZ2lvbjogJ2FwLXNvdXRoZWFzdC0xJyxcbiAgc3RhY2tOYW1lOiAnQmVkcm9ja0FnZW50U3RhY2stU3RhZ2luZycsXG4gIGFnZW50TmFtZTogJ25vdmEtcHJvLWFnZW50LXN0YWdpbmcnLFxuICBidWNrZXRQcmVmaXg6ICdiZWRyb2NrLWFnZW50LXN0YWdpbmcnLFxuICB0YWdzOiB7XG4gICAgRW52aXJvbm1lbnQ6ICdTdGFnaW5nJyxcbiAgICBQcm9qZWN0OiAnQmVkcm9ja0FnZW50JyxcbiAgICBDb3N0Q2VudGVyOiAnUUEnLFxuICAgIE93bmVyOiAnUUFUZWFtJ1xuICB9XG59O1xuIl19