import { mergeDeep } from 'remeda';

export class ConfigMerger {
  merge<T extends object>(first: T, ...configs: readonly T[]): T {
    // TypeScript cannot guarantee that merging arbitrary objects produces T
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return configs.reduce((merged, config) => mergeDeep(merged, config) as T, first);
  }
}
