/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { AppSettingsProvider } from './AppSettingsProvider.tsx';
import { Setting } from './Setting.tsx';

describe('Setting', () => {
  it('When the current value matches one of the expected values, then it renders the children', () => {
    // Arrange
    const settings = { Features: { DarkMode: true } };

    // Act
    render(
      <AppSettingsProvider settings={settings}>
        <Setting path="Features.DarkMode" value={[false, true]}>
          Enabled
        </Setting>
      </AppSettingsProvider>,
    );

    // Assert
    expect(screen.getByText('Enabled')).toBeTruthy();
  });

  it('When the value does not match, then it renders the fallback', () => {
    // Arrange
    const settings = { Features: { DarkMode: false } };

    // Act
    render(
      <AppSettingsProvider settings={settings}>
        <Setting fallback="Disabled" path="Features.DarkMode" value={true}>
          Enabled
        </Setting>
      </AppSettingsProvider>,
    );

    // Assert
    expect(screen.getByText('Disabled')).toBeTruthy();
  });

  it('When negate is enabled, then it renders children for a non-matching value', () => {
    // Arrange
    const settings = { Features: { DarkMode: false } };

    // Act
    render(
      <AppSettingsProvider settings={settings}>
        <Setting negate path="Features.DarkMode" value={true}>
          Not enabled
        </Setting>
      </AppSettingsProvider>,
    );

    // Assert
    expect(screen.getByText('Not enabled')).toBeTruthy();
  });
});
