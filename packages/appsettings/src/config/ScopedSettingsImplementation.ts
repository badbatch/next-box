import { type Get } from 'type-fest';
import { ConfigReader } from '#config/ConfigReader.ts';
import { type ScopedSettings } from '#types/AppSettings.types.ts';
import { type SettingPath } from '#types/Config.types.ts';

export class ScopedSettingsImplementation<T extends object> implements ScopedSettings<T> {
  private readonly reader: ConfigReader<T>;
  private readonly section: T;
  private readonly parentPath: string;

  constructor(section: T, parentPath: string) {
    this.section = section;
    this.parentPath = parentPath;
    this.reader = new ConfigReader(section);
  }

  get<P extends SettingPath<T>>(path: P): Get<T, P> | undefined;
  get(path: string): unknown {
    return this.reader.read(path);
  }

  getAll(): Readonly<T> {
    return this.section;
  }

  getOrThrow<P extends SettingPath<T>>(path: P): Get<T, P>;
  getOrThrow(path: string): unknown {
    const value = this.reader.read(path);

    if (value === undefined) {
      throw new Error(`Required app setting "${this.parentPath}.${path}" is missing.`);
    }

    return value;
  }
}
