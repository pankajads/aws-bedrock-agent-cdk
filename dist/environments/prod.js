"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prodConfig = void 0;
exports.prodConfig = {
    accountId: process.env.CDK_DEFAULT_ACCOUNT || '',
    region: 'ap-southeast-1',
    stackName: 'BedrockAgentStack-Prod',
    agentName: 'nova-pro-agent-prod',
    bucketPrefix: 'bedrock-agent-prod',
    tags: {
        Environment: 'Production',
        Project: 'BedrockAgent',
        CostCenter: 'Production',
        Owner: 'ProductionTeam',
        BackupRequired: 'true',
        MonitoringLevel: 'high'
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2Vudmlyb25tZW50cy9wcm9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVhLFFBQUEsVUFBVSxHQUFzQjtJQUMzQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsSUFBSSxFQUFFO0lBQ2hELE1BQU0sRUFBRSxnQkFBZ0I7SUFDeEIsU0FBUyxFQUFFLHdCQUF3QjtJQUNuQyxTQUFTLEVBQUUscUJBQXFCO0lBQ2hDLFlBQVksRUFBRSxvQkFBb0I7SUFDbEMsSUFBSSxFQUFFO1FBQ0osV0FBVyxFQUFFLFlBQVk7UUFDekIsT0FBTyxFQUFFLGNBQWM7UUFDdkIsVUFBVSxFQUFFLFlBQVk7UUFDeEIsS0FBSyxFQUFFLGdCQUFnQjtRQUN2QixjQUFjLEVBQUUsTUFBTTtRQUN0QixlQUFlLEVBQUUsTUFBTTtLQUN4QjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbnZpcm9ubWVudENvbmZpZyB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgY29uc3QgcHJvZENvbmZpZzogRW52aXJvbm1lbnRDb25maWcgPSB7XG4gIGFjY291bnRJZDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCB8fCAnJyxcbiAgcmVnaW9uOiAnYXAtc291dGhlYXN0LTEnLFxuICBzdGFja05hbWU6ICdCZWRyb2NrQWdlbnRTdGFjay1Qcm9kJyxcbiAgYWdlbnROYW1lOiAnbm92YS1wcm8tYWdlbnQtcHJvZCcsXG4gIGJ1Y2tldFByZWZpeDogJ2JlZHJvY2stYWdlbnQtcHJvZCcsXG4gIHRhZ3M6IHtcbiAgICBFbnZpcm9ubWVudDogJ1Byb2R1Y3Rpb24nLFxuICAgIFByb2plY3Q6ICdCZWRyb2NrQWdlbnQnLFxuICAgIENvc3RDZW50ZXI6ICdQcm9kdWN0aW9uJyxcbiAgICBPd25lcjogJ1Byb2R1Y3Rpb25UZWFtJyxcbiAgICBCYWNrdXBSZXF1aXJlZDogJ3RydWUnLFxuICAgIE1vbml0b3JpbmdMZXZlbDogJ2hpZ2gnXG4gIH1cbn07XG4iXX0=