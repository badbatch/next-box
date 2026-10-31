import { isPlainObject } from 'remeda';
import { type Get } from 'type-fest';
import { ScopedSettingsImplementation } from '#config/ScopedSettingsImplementation.ts';
import { type InternalAppSettings, type ScopedSettings } from '#types/AppSettings.types.ts';
import { type SettingPath, type SettingSectionPath } from '#types/Config.types.ts';
import { ConfigReader } from './ConfigReader.ts';
import { ConfigStore } from './ConfigStore.ts';

export class AppSettingsImplementation<T extends object> implements InternalAppSettings<T> {
  private readonly store: ConfigStore<T>;

  constructor(settings: T) {
    this.store = new ConfigStore(settings);
  }

  get<P extends SettingPath<T>>(path: P): Get<T, P> | undefined;
  get(path: string): unknown {
    return this.read(path);
  }

  read(path: string): unknown {
    return new ConfigReader(this.store.getSnapshot()).read(path);
  }

  getAll(): Readonly<T> {
    return this.store.getSnapshot();
  }

  getOrThrow<P extends SettingPath<T>>(path: P): Get<T, P>;
  getOrThrow(path: string): unknown {
    const value = new ConfigReader(this.store.getSnapshot()).read(path);

    if (value === undefined) {
      throw new Error(`Required app setting "${path}" is missing.`);
    }

    return value;
  }

  getSection<P extends SettingSectionPath<T>>(path: P): Get<T, P> | undefined;
  getSection(path: string): unknown {
    return new ConfigReader(this.store.getSnapshot()).read(path);
  }

  has(path: SettingPath<T> | SettingSectionPath<T>): boolean;
  has(path: string): boolean {
    return new ConfigReader(this.store.getSnapshot()).has(path);
  }

  scope<P extends SettingSectionPath<T>>(path: P): ScopedSettings<Extract<Get<T, P>, object>>;
  scope(path: string): ScopedSettings<object> {
    const reader = new ConfigReader(this.store.getSnapshot());
    const section = reader.read(path);

    if (!isPlainObject(section)) {
      throw new Error(`App setting section "${path}" is missing.`);
    }

    return new ScopedSettingsImplementation(section, path);
  }
}
