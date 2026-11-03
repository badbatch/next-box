import { describe, expect, it } from '@jest/globals';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppSettingsProvider } from './AppSettingsProvider.tsx';
import { useAppSetting } from '../hooks/useAppSetting.ts';

const SettingsOutput = (): ReactNode => <span>{String(useAppSetting('Api.Timeout'))}</span>;

describe('AppSettingsProvider', () => {
  it('When settings are provided, then child components can read the supplied snapshot', () => {
    // Arrange
    const settings = { Api: { Timeout: 5000 } };

    // Act
    const markup = renderToStaticMarkup(
      createElement(AppSettingsProvider, { settings, children: createElement(SettingsOutput) }),
    );

    // Assert
    expect(markup).toBe('<span>5000</span>');
  });
});
