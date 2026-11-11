import { type Get } from 'type-fest';

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type PreviousDepth = [never, 0, 1, 2, 3, 4, 5];

export type SettingPath<T extends object, Depth extends number = 5> = Depth extends 0
  ? never
  : {
      [K in Extract<keyof T, string>]: T[K] extends Primitive | readonly Primitive[]
        ? K
        : T[K] extends object
          ? `${K}.${SettingPath<T[K], PreviousDepth[Depth]>}`
          : K;
    }[Extract<keyof T, string>];

export type SettingSectionPath<T extends object, Depth extends number = 5> = Depth extends 0
  ? never
  : {
      [K in Exclude<Extract<keyof T, string>, '__appSettingsSchema'>]: T[K] extends Primitive | readonly Primitive[]
        ? never
        : T[K] extends object
          ? K | `${K}.${SettingSectionPath<T[K], PreviousDepth[Depth]>}`
          : never;
    }[Exclude<Extract<keyof T, string>, '__appSettingsSchema'>];

export type SettingValue<T extends object, P extends SettingPath<T>> = Get<T, P>;
