import { EnvironmentConfig } from './types';
import { devConfig } from './dev';
import { stagingConfig } from './staging';
import { prodConfig } from './prod';

export function getEnvironmentConfig(environment?: string): EnvironmentConfig {
  const env = environment || process.env.CDK_ENVIRONMENT || 'dev';
  
  switch (env.toLowerCase()) {
    case 'dev':
    case 'development':
      return devConfig;
    case 'staging':
    case 'stage':
      return stagingConfig;
    case 'prod':
    case 'production':
      return prodConfig;
    default:
      console.warn(`Unknown environment: ${env}, defaulting to dev`);
      return devConfig;
  }
}

export { devConfig, stagingConfig, prodConfig };
export * from './types';
