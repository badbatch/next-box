'use client';

import { type ReactNode } from 'react';
import { type Get } from 'type-fest';
import { useAppSettingsContext } from '#hooks/useAppSettingsContext.ts';
import { type ClientAppSettings } from '#types/ClientAppSettings.types.ts';
import { type AppSettingsSchema } from '../index.ts';
import { type SettingPath } from '../types/Config.types.ts';

export interface SettingProps<T extends object, P extends SettingPath<ClientAppSettings<T>>> {
  children: ReactNode;
  fallback?: ReactNode;
  negate?: boolean;
  path: P;
  value: Get<ClientAppSettings<T>, P> | undefined | readonly (Get<ClientAppSettings<T>, P> | undefined)[];
}

type SettingRuntimeProps = {
  children: ReactNode;
  fallback?: ReactNode;
  negate?: boolean;
  path: string;
  value: unknown;
};

export function Setting<P extends SettingPath<ClientAppSettings<AppSettingsSchema>>>(props: {
  children: ReactNode;
  fallback?: ReactNode;
  negate?: boolean;
  path: P;
  value:
    | Get<ClientAppSettings<AppSettingsSchema>, P>
    | undefined
    | readonly (Get<ClientAppSettings<AppSettingsSchema>, P> | undefined)[];
}): ReactNode;

export function Setting<T extends object, P extends SettingPath<ClientAppSettings<T>>>(
  props: SettingProps<T, P>,
): ReactNode;

// Required to support above overloads
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function Setting({ children, fallback, negate = false, path, value }: SettingRuntimeProps): ReactNode {
  const settings = useAppSettingsContext();
  const current = settings.read(path);
  const expected = Array.isArray(value) ? value : [value];
  const isMatches = expected.includes(current);
  return (negate ? !isMatches : isMatches) ? children : fallback;
}
