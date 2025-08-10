"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prodConfig = exports.stagingConfig = exports.devConfig = exports.getEnvironmentConfig = void 0;
const dev_1 = require("./dev");
Object.defineProperty(exports, "devConfig", { enumerable: true, get: function () { return dev_1.devConfig; } });
const staging_1 = require("./staging");
Object.defineProperty(exports, "stagingConfig", { enumerable: true, get: function () { return staging_1.stagingConfig; } });
const prod_1 = require("./prod");
Object.defineProperty(exports, "prodConfig", { enumerable: true, get: function () { return prod_1.prodConfig; } });
function getEnvironmentConfig(environment) {
    const env = environment || process.env.CDK_ENVIRONMENT || 'dev';
    switch (env.toLowerCase()) {
        case 'dev':
        case 'development':
            return dev_1.devConfig;
        case 'staging':
        case 'stage':
            return staging_1.stagingConfig;
        case 'prod':
        case 'production':
            return prod_1.prodConfig;
        default:
            console.warn(`Unknown environment: ${env}, defaulting to dev`);
            return dev_1.devConfig;
    }
}
exports.getEnvironmentConfig = getEnvironmentConfig;
__exportStar(require("./types"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9lbnZpcm9ubWVudHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSwrQkFBa0M7QUF1QnpCLDBGQXZCQSxlQUFTLE9BdUJBO0FBdEJsQix1Q0FBMEM7QUFzQnRCLDhGQXRCWCx1QkFBYSxPQXNCVztBQXJCakMsaUNBQW9DO0FBcUJELDJGQXJCMUIsaUJBQVUsT0FxQjBCO0FBbkI3QyxTQUFnQixvQkFBb0IsQ0FBQyxXQUFvQjtJQUN2RCxNQUFNLEdBQUcsR0FBRyxXQUFXLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLElBQUksS0FBSyxDQUFDO0lBRWhFLFFBQVEsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFO1FBQ3pCLEtBQUssS0FBSyxDQUFDO1FBQ1gsS0FBSyxhQUFhO1lBQ2hCLE9BQU8sZUFBUyxDQUFDO1FBQ25CLEtBQUssU0FBUyxDQUFDO1FBQ2YsS0FBSyxPQUFPO1lBQ1YsT0FBTyx1QkFBYSxDQUFDO1FBQ3ZCLEtBQUssTUFBTSxDQUFDO1FBQ1osS0FBSyxZQUFZO1lBQ2YsT0FBTyxpQkFBVSxDQUFDO1FBQ3BCO1lBQ0UsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxxQkFBcUIsQ0FBQyxDQUFDO1lBQy9ELE9BQU8sZUFBUyxDQUFDO0tBQ3BCO0FBQ0gsQ0FBQztBQWpCRCxvREFpQkM7QUFHRCwwQ0FBd0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbnZpcm9ubWVudENvbmZpZyB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgZGV2Q29uZmlnIH0gZnJvbSAnLi9kZXYnO1xuaW1wb3J0IHsgc3RhZ2luZ0NvbmZpZyB9IGZyb20gJy4vc3RhZ2luZyc7XG5pbXBvcnQgeyBwcm9kQ29uZmlnIH0gZnJvbSAnLi9wcm9kJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVudmlyb25tZW50Q29uZmlnKGVudmlyb25tZW50Pzogc3RyaW5nKTogRW52aXJvbm1lbnRDb25maWcge1xuICBjb25zdCBlbnYgPSBlbnZpcm9ubWVudCB8fCBwcm9jZXNzLmVudi5DREtfRU5WSVJPTk1FTlQgfHwgJ2Rldic7XG4gIFxuICBzd2l0Y2ggKGVudi50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnZGV2JzpcbiAgICBjYXNlICdkZXZlbG9wbWVudCc6XG4gICAgICByZXR1cm4gZGV2Q29uZmlnO1xuICAgIGNhc2UgJ3N0YWdpbmcnOlxuICAgIGNhc2UgJ3N0YWdlJzpcbiAgICAgIHJldHVybiBzdGFnaW5nQ29uZmlnO1xuICAgIGNhc2UgJ3Byb2QnOlxuICAgIGNhc2UgJ3Byb2R1Y3Rpb24nOlxuICAgICAgcmV0dXJuIHByb2RDb25maWc7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUud2FybihgVW5rbm93biBlbnZpcm9ubWVudDogJHtlbnZ9LCBkZWZhdWx0aW5nIHRvIGRldmApO1xuICAgICAgcmV0dXJuIGRldkNvbmZpZztcbiAgfVxufVxuXG5leHBvcnQgeyBkZXZDb25maWcsIHN0YWdpbmdDb25maWcsIHByb2RDb25maWcgfTtcbmV4cG9ydCAqIGZyb20gJy4vdHlwZXMnO1xuIl19