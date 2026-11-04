/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { useAppSetting } from '../hooks/useAppSetting.ts';
import { AppSettingsProvider } from './AppSettingsProvider.tsx';

const SettingsOutput = () => <span>{String(useAppSetting('Api.Timeout'))}</span>;

describe('AppSettingsProvider', () => {
  it('When settings are provided, then child components can read the supplied snapshot', () => {
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
