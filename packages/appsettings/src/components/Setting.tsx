import { type ReactNode } from 'react';
import { type Get } from 'type-fest';
import { useAppSettingsContext } from '#hooks/useAppSettingsContext.ts';
import { type AppSettingsSchema, type SettingPath } from '../types/Config.types.ts';

export interface SettingProps<T extends object, P extends SettingPath<T>> {
  children: ReactNode;
  fallback?: ReactNode;
  negate?: boolean;
  path: P;
  value: Get<T, P> | undefined | readonly (Get<T, P> | undefined)[];
}

type SettingRuntimeProps = {
  children: ReactNode;
  fallback?: ReactNode;
  negate?: boolean;
  path: string;
  value: unknown;
};

export function Setting<P extends SettingPath<AppSettingsSchema>>(props: {
  children: ReactNode;
  fallback?: ReactNode;
  negate?: boolean;
  path: P;
  value: Get<AppSettingsSchema, P> | undefined | readonly (Get<AppSettingsSchema, P> | undefined)[];
}): ReactNode;

export function Setting<T extends object, P extends SettingPath<T>>(props: SettingProps<T, P>): ReactNode;

// Required to support above overloads
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function Setting({ children, fallback, negate = false, path, value }: SettingRuntimeProps): ReactNode {
  const settings = useAppSettingsContext();
  const current = settings.read(path);
  const expected = Array.isArray(value) ? value : [value];
  const isMatches = expected.includes(current);
  return (negate ? !isMatches : isMatches) ? children : fallback;
}
