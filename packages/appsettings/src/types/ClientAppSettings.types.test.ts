import { describe, expect, it } from '@jest/globals';
import { assertType } from '../__testUtils__/types.ts';
import { type AppSettingsProviderProps } from '../components/AppSettingsProvider.tsx';
import { type SettingProps } from '../components/Setting.tsx';
import { type createUseAppSettings, type createUseAppSettingsOrThrow } from '../hooks/createUseAppSettings.ts';
import { type createUseSetting, type createUseSettingOrThrow } from '../hooks/createUseSetting.ts';
import { type useAppSettingsContext } from '../hooks/useAppSettingsContext.ts';
import { type ClientAppSettings, type ClientAppSettingsSnapshot } from './ClientAppSettings.types.ts';
import { type SettingPath, type SettingSectionPath } from './Config.types.ts';

type ExampleSettings = { Bff: { BaseUrl: string }; Server: { ApiKey: string } };

type ClientSettings = ClientAppSettings<ExampleSettings>;

describe('ClientAppSettings types', () => {
  it('When client paths are derived, then public paths are accepted and Server paths are rejected', () => {
    // Arrange
    const leafPath: SettingPath<ClientSettings> = 'Bff.BaseUrl';
    const sectionPath: SettingSectionPath<ClientSettings> = 'Bff';
    const settings: ClientSettings = { Bff: { BaseUrl: '/api' } };

    // Act
    const snapshot: ClientAppSettingsSnapshot<ExampleSettings> = settings;

    // Assert
    assertType<{ Bff: { BaseUrl: string } }>(snapshot);
    assertType<SettingPath<ClientSettings>>(leafPath);
    assertType<SettingSectionPath<ClientSettings>>(sectionPath);
    // @ts-expect-error Server values are not client paths.
    assertType<SettingPath<ClientSettings>>('Server.ApiKey');
    // @ts-expect-error Server sections are not client paths.
    assertType<SettingSectionPath<ClientSettings>>('Server');
    // @ts-expect-error The full client schema has no root Server key.
    assertType<keyof ClientSettings>('Server');
    expect(snapshot).toEqual({ Bff: { BaseUrl: '/api' } });
    expect(leafPath).toBe('Bff.BaseUrl');
    expect(sectionPath).toBe('Bff');
  });

  it('When a full server snapshot is supplied, then it is rejected as a client snapshot', () => {
    // Arrange
    const settings: ExampleSettings = { Bff: { BaseUrl: '/api' }, Server: { ApiKey: 'private' } };

    // Act
    const snapshot = settings;

    // Assert
    // @ts-expect-error Structural assignment of a full server snapshot is rejected.
    assertType<ClientAppSettingsSnapshot<ExampleSettings>>(snapshot);
    expect(snapshot.Server.ApiKey).toBe('private');
  });
});

describe('client settings hook types', () => {
  it('When hooks are created from the full schema, then they accept public paths and reject Server paths', () => {
    // Arrange
    const leafPath = 'Bff.BaseUrl';
    const sectionPath = 'Bff';

    // Act
    type UseSetting = ReturnType<typeof createUseSetting<ExampleSettings>>;

    type UseSettingOrThrow = ReturnType<typeof createUseSettingOrThrow<ExampleSettings>>;

    type UseSettings = ReturnType<typeof createUseAppSettings<ExampleSettings>>;

    type UseSettingsOrThrow = ReturnType<typeof createUseAppSettingsOrThrow<ExampleSettings>>;

    // Assert
    assertType<Parameters<UseSetting>[0]>(leafPath);
    assertType<Parameters<UseSettingOrThrow>[0]>(leafPath);
    assertType<Parameters<UseSettings>[0]>(sectionPath);
    assertType<Parameters<UseSettingsOrThrow>[0]>(sectionPath);
    // @ts-expect-error Optional value hooks exclude Server values.
    assertType<Parameters<UseSetting>[0]>('Server.ApiKey');
    // @ts-expect-error Throwing value hooks exclude Server values.
    assertType<Parameters<UseSettingOrThrow>[0]>('Server.ApiKey');
    // @ts-expect-error Optional section hooks exclude Server sections.
    assertType<Parameters<UseSettings>[0]>('Server');
    // @ts-expect-error Throwing section hooks exclude Server sections.
    assertType<Parameters<UseSettingsOrThrow>[0]>('Server');
    expect(leafPath).toBe('Bff.BaseUrl');
    expect(sectionPath).toBe('Bff');
  });

  it('When a context reader uses the full schema, then its paths and snapshot exclude Server', () => {
    // Arrange
    const leafPath = 'Bff.BaseUrl';
    const sectionPath = 'Bff';

    // Act
    type ContextSettings = ReturnType<typeof useAppSettingsContext<ExampleSettings>>;

    type Snapshot = ReturnType<ContextSettings['getAll']>;

    // Assert
    assertType<Parameters<ContextSettings['get']>[0]>(leafPath);
    assertType<Parameters<ContextSettings['scope']>[0]>(sectionPath);
    // @ts-expect-error Context readers exclude Server values.
    assertType<Parameters<ContextSettings['get']>[0]>('Server.ApiKey');
    // @ts-expect-error Context readers exclude Server sections.
    assertType<Parameters<ContextSettings['scope']>[0]>('Server');
    // @ts-expect-error Context snapshots exclude Server.
    assertType<keyof Snapshot>('Server');
    expect(leafPath).toBe('Bff.BaseUrl');
    expect(sectionPath).toBe('Bff');
  });
});

describe('client settings component types', () => {
  it('When provider props are declared, then public snapshots are accepted and full server snapshots are rejected', () => {
    // Arrange
    const publicSettings = { Bff: { BaseUrl: '/api' } };
    const serverSettings: ExampleSettings = { ...publicSettings, Server: { ApiKey: 'private' } };

    // Act
    const publicProps = { children: 'Child', settings: publicSettings };
    const serverProps = { children: 'Child', settings: serverSettings };

    // Assert
    assertType<AppSettingsProviderProps<ExampleSettings>>(publicProps);
    // @ts-expect-error Provider props cannot contain the root Server section.
    assertType<AppSettingsProviderProps<ExampleSettings>>(serverProps);
    expect(publicProps.settings).toEqual({ Bff: { BaseUrl: '/api' } });
  });

  it('When Setting props are declared, then public paths are accepted and Server paths are rejected', () => {
    // Arrange
    const path = 'Bff.BaseUrl' as const;
    const serverPath = 'Server.ApiKey' as const;

    // Act
    const publicProps = { children: 'Child', path, value: '/api' };
    const serverProps = { children: 'Child', path: serverPath, value: 'private' };

    // Assert
    assertType<SettingProps<ExampleSettings, 'Bff.BaseUrl'>>(publicProps);
    // @ts-expect-error Setting props cannot request Server values.
    assertType<SettingProps<ExampleSettings, 'Bff.BaseUrl'>>(serverProps);
    // @ts-expect-error Server paths cannot be used as a Setting path type parameter.
    assertType<SettingProps<ExampleSettings, 'Server.ApiKey'>>(serverProps);
    expect(publicProps.path).toBe('Bff.BaseUrl');
  });
});
