import { describe, expect, it } from '@jest/globals';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppSettingsProvider } from '../components/AppSettingsProvider.tsx';
import { useAppSettingsContext } from './useAppSettingsContext.ts';

const ContextOutput = () => <span>{String(useAppSettingsContext().get('Api.Timeout'))}</span>;

describe('useAppSettingsContext', () => {
  it('When used within a provider, then it returns the settings context instance', () => {
    // Arrange
    const settings = { Api: { Timeout: 5000 } };
    const component = createElement(AppSettingsProvider, { settings, children: createElement(ContextOutput) });

    // Act
    const markup = renderToStaticMarkup(component);

    // Assert
    expect(markup).toBe('<span>5000</span>');
  });

  it('When used outside a provider, then it throws a descriptive error', () => {
    // Arrange
    const renderWithoutProvider = () => renderToStaticMarkup(createElement(ContextOutput));

    // Act
    // Assert
    expect(renderWithoutProvider).toThrow('useAppSettingsContext must be used within an <AppSettingsProvider>.');
  });
});
