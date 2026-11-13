/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { createUseSetting } from '../hooks/createUseSetting.ts';
import { AppSettingsProvider } from './AppSettingsProvider.tsx';

type Settings = { Api: { Timeout: number } };

const useAppSetting = createUseSetting<Settings>();
const SettingsOutput = () => <span>{String(useAppSetting('Api.Timeout'))}</span>;

describe('AppSettingsProvider', () => {
  it('When the provider receives unfiltered server settings, then it rejects the snapshot', () => {
    // Arrange
    const settings = { Server: { Secret: 'private' } };

    // Act
    const createProvider = () =>
      AppSettingsProvider({
        children: undefined,
        // @ts-expect-error Server configuration must be projected before reaching the provider.
        settings,
      });

    // Assert
    expect(createProvider).toThrow('Server settings cannot be passed to AppSettingsProvider');
  });

  it('When the provider renders with public settings, then child components can read the supplied snapshot', () => {
    // Arrange
    const settings = { Api: { Timeout: 5000 } };

    // Act
    render(
      <AppSettingsProvider settings={settings}>
        <SettingsOutput />
      </AppSettingsProvider>,
    );

    // Assert
    expect(screen.getByText('5000')).toBeTruthy();
  });
});
