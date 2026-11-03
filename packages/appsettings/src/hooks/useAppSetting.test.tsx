import { describe, expect, it } from '@jest/globals';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppSettingsProvider } from '../components/AppSettingsProvider.tsx';
import { useAppSetting } from './useAppSetting.ts';

const SettingOutput = () => <span>{String(useAppSetting('Api.Timeout'))}</span>;

const MissingSettingOutput = () => <span>{String(useAppSetting('Api.Missing'))}</span>;

describe('useAppSetting', () => {
  it('When used within a provider, then it returns the value at the requested leaf path', () => {
    // Arrange
    const settings = { Api: { Missing: undefined, Timeout: 5000 } };
    const component = createElement(AppSettingsProvider, { children: createElement(SettingOutput), settings });

    // Act
    const markup = renderToStaticMarkup(component);

    // Assert
    expect(markup).toBe('<span>5000</span>');
  });

  it('When the requested path is missing, then it returns undefined', () => {
    // Arrange
    const settings = { Api: { Timeout: 5000 } };
    const component = createElement(AppSettingsProvider, { children: <MissingSettingOutput />, settings });

    // Act
    const markup = renderToStaticMarkup(component);

    // Assert
    expect(markup).toBe('<span>undefined</span>');
  });
});
