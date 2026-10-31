import { type CreateAppSettingsOptions } from '#types/AppSettings.types.ts';
import { ConfigMerger } from './ConfigMerger.ts';
import { ConfigValidator } from './ConfigValidator.ts';

export const createAppSettings = async <T extends object>({
  defaults,
  schema,
  sources = [],
}: CreateAppSettingsOptions<T>): Promise<Readonly<T>> => {
  const loadedSources: Record<string, unknown>[] = [];

  for (const source of sources) {
    loadedSources.push(await source.load());
  }

  const merged = new ConfigMerger().merge(defaults, ...loadedSources);
  return new ConfigValidator(schema).validate(merged);
};
