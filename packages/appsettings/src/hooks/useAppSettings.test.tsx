import { describe, expect, it } from '@jest/globals';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppSettingsProvider } from '../components/AppSettingsProvider.tsx';
import { useAppSettings } from './useAppSettings.ts';

const SectionOutput = () => {
  const api = useAppSettings('Api');
  return <span>{String(api?.Timeout)}</span>;
};

const MissingSectionOutput = () => {
  const missing = useAppSettings('Missing');
  return <span>{String(missing)}</span>;
};

describe('useAppSettings', () => {
  it('When used within a provider, then it returns the requested object section', () => {
    // Arrange
    const settings = { Api: { Timeout: 5000 } };
    const component = createElement(AppSettingsProvider, { children: createElement(SectionOutput), settings });

    // Act
    const markup = renderToStaticMarkup(component);

    // Assert
    expect(markup).toBe('<span>5000</span>');
  });

  it('When the requested section is missing, then it returns undefined', () => {
    // Arrange
    const component = createElement(AppSettingsProvider, {
      children: <MissingSectionOutput />,
      settings: { Api: { Timeout: 5000 } },
    });

    // Act
    const markup = renderToStaticMarkup(component);

    // Assert
    expect(markup).toBe('<span>undefined</span>');
  });
});
