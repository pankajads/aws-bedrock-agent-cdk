import { EnvironmentConfig } from './types';
import { devConfig } from './dev';
import { stagingConfig } from './staging';
import { prodConfig } from './prod';
export declare function getEnvironmentConfig(environment?: string): EnvironmentConfig;
export { devConfig, stagingConfig, prodConfig };
export * from './types';
