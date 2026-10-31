import { type Get } from 'type-fest';
import { type ZodType } from 'zod';
import { type SettingPath, type SettingSectionPath } from './Config.types.ts';
import { type SettingsSource } from './Source.types.ts';

export interface AppSettings<T extends object> {
  get<P extends SettingPath<T>>(path: P): Get<T, P> | undefined;
  getAll(): Readonly<T>;
  getOrThrow<P extends SettingPath<T>>(path: P): Get<T, P>;
  getSection<P extends SettingSectionPath<T>>(path: P): Get<T, P> | undefined;
  has(path: SettingPath<T> | SettingSectionPath<T>): boolean;
  scope<P extends SettingSectionPath<T>>(path: P): ScopedSettings<Extract<Get<T, P>, object>>;
}

// Internal dynamic lookup used by React bindings.
export interface InternalAppSettings<T extends object> extends AppSettings<T> {
  read(path: string): unknown;
}

export interface ScopedSettings<T extends object = Record<string, unknown>> {
  get<P extends SettingPath<T>>(path: P): Get<T, P> | undefined;
  getAll(): Readonly<T>;
  getOrThrow<P extends SettingPath<T>>(path: P): Get<T, P>;
}

export interface CreateAppSettingsOptions<T extends object> {
  defaults: Partial<T>;
  schema: ZodType<T>;
  sources?: readonly SettingsSource[];
}
