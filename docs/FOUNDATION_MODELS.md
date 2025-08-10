# Foundation Model Configuration Examples

This file shows examples of different foundation models you can configure per environment.

## Available Models:

### Amazon Nova Models (Inference Profiles):
```typescript
foundationModel: 'apac.amazon.nova-micro-v1:0'   // Fastest, lowest cost
foundationModel: 'apac.amazon.nova-lite-v1:0'    // Balanced performance
foundationModel: 'apac.amazon.nova-pro-v1:0'     // Best performance
```

### Anthropic Claude Models (Inference Profiles):
```typescript
foundationModel: 'apac.anthropic.claude-3-haiku-20240307-v1:0'      // Fast, cost-effective
foundationModel: 'apac.anthropic.claude-3-sonnet-20240229-v1:0'     // Balanced
foundationModel: 'apac.anthropic.claude-3-5-sonnet-20240620-v1:0'   // High performance
foundationModel: 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0'   // Latest version
```

## Environment Strategy Examples:

### Cost-Optimized Strategy:
```typescript
// dev.ts
foundationModel: 'apac.amazon.nova-lite-v1:0'    // Cheaper for development

// staging.ts  
foundationModel: 'apac.amazon.nova-pro-v1:0'     // Same as production

// prod.ts
foundationModel: 'apac.amazon.nova-pro-v1:0'     // Best performance
```

### Performance-Focused Strategy:
```typescript
// dev.ts
foundationModel: 'apac.amazon.nova-pro-v1:0'     // Same as production

// staging.ts
foundationModel: 'apac.amazon.nova-pro-v1:0'     // Same as production  

// prod.ts
foundationModel: 'apac.amazon.nova-pro-v1:0'     // Best performance
```

### Multi-Model Testing Strategy:
```typescript
// dev.ts
foundationModel: 'apac.amazon.nova-lite-v1:0'    // Test with different model

// staging.ts
foundationModel: 'apac.anthropic.claude-3-5-sonnet-20240620-v1:0' // Test Claude

// prod.ts
foundationModel: 'apac.amazon.nova-pro-v1:0'     // Production model
```

## Benefits of Environment-Based Configuration:

1. **Cost Control**: Use cheaper models in dev/test environments
2. **Performance Testing**: Test different models per environment
3. **Model Comparison**: A/B test different models easily
4. **Future Flexibility**: Easy to switch models without code changes
5. **Regional Availability**: Configure different models per region

## Usage:

Simply update the `foundationModel` field in your environment config files:
- `environments/dev.ts`
- `environments/staging.ts` 
- `environments/prod.ts`
