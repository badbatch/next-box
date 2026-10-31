/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { EnvsProvider } from './EnvsProvider.tsx';

describe('EnvsProvider', () => {
  it('When children are rendered, then it provides the environment variables and getter through context', () => {
    // Arrange
    const envs = { NEXT_PUBLIC_LANGUAGE_CODE: 'en', SECRET: 'private' };

    // Act
    render(
      <EnvsProvider envs={envs}>
        {({ envs: providedEnvs, getEnv }) => (
          <div>
            {providedEnvs.NEXT_PUBLIC_LANGUAGE_CODE}:{getEnv('SECRET')}:{String(getEnv('MISSING'))}
          </div>
        )}
      </EnvsProvider>,
    );

    // Assert
    expect(screen.getByText('en:private:undefined')).toBeTruthy();
  });

  it('When the environment variables are updated, then it creates a copy for the context', () => {
    // Arrange
    const envs = { NEXT_PUBLIC_LANGUAGE_CODE: 'en' };
    let providedEnvs: Record<string, string | undefined> = {};

    // Act
    render(
      <EnvsProvider envs={envs}>
        {context => {
          providedEnvs = context.envs;

          return null;
        }}
      </EnvsProvider>,
    );

    // Assert
    expect(providedEnvs).toEqual(envs);
    expect(providedEnvs).not.toBe(envs);
  });
});
