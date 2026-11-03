import { describe, expect, it } from '@jest/globals';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppSettingsProvider } from './AppSettingsProvider.tsx';
import { Setting } from './Setting.tsx';

describe('Setting', () => {
  it('When the current value matches one of the expected values, then it renders the children', () => {
    // Arrange
    const settings = { Features: { DarkMode: true } };
    const component = createElement(
      AppSettingsProvider,
      {
        settings,
        children: createElement(Setting, {
          children: 'Enabled',
          path: 'Features.DarkMode',
          value: [false, true],
        }),
      },
    );

    // Act
    const markup = renderToStaticMarkup(component);

    // Assert
    expect(markup).toBe('Enabled');
  });

  it('When the value does not match, then it renders the fallback', () => {
    // Arrange
    const settings = { Features: { DarkMode: false } };
    const component = createElement(
      AppSettingsProvider,
      {
        settings,
        children: createElement(Setting, {
          children: 'Enabled',
          fallback: 'Disabled',
          path: 'Features.DarkMode',
          value: true,
        }),
      },
    );

    // Act
    const markup = renderToStaticMarkup(component);

    // Assert
    expect(markup).toBe('Disabled');
  });

  it('When negate is enabled, then it renders children for a non-matching value', () => {
    // Arrange
    const settings = { Features: { DarkMode: false } };
    const child: ReactNode = createElement(Setting, {
      children: 'Not enabled',
      negate: true,
      path: 'Features.DarkMode',
      value: true,
    });
    const component = createElement(AppSettingsProvider, { settings, children: child });

    // Act
    const markup = renderToStaticMarkup(component);

    // Assert
    expect(markup).toBe('Not enabled');
  });
});
