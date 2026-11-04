import { describe, expect, it } from '@jest/globals';
import { renderToStaticMarkup } from 'react-dom/server';
import { PublicEnvVarsScript } from './PublicEnvVarsScript.tsx';

describe('PublicEnvVarsScript', () => {
  it('When rendered, then it assigns public environment variables to globalThis.env', () => {
    // Arrange
    const publicKey = 'NEXT_PUBLIC_ENVS_TEST_VALUE';
    const privateKey = 'ENVS_TEST_PRIVATE_VALUE';
    const whitelistedKey = 'ENVS_TEST_WHITELISTED_VALUE';
    const originalPublicValue = process.env[publicKey];
    const originalPrivateValue = process.env[privateKey];
    const originalWhitelistedValue = process.env[whitelistedKey];

    process.env[publicKey] = 'public-value';
    process.env[privateKey] = 'private-value';
    process.env[whitelistedKey] = 'whitelisted-value';

    // Act
    const markup = renderToStaticMarkup(<PublicEnvVarsScript id="public-envs" whitelist={[whitelistedKey]} />);

    // Assert
    expect(markup).toContain('id="public-envs"');
    expect(markup).toContain(`"${publicKey}":"public-value"`);
    expect(markup).toContain(`"${whitelistedKey}":"whitelisted-value"`);
    expect(markup).not.toContain(privateKey);

    /* eslint-disable @typescript-eslint/no-dynamic-delete */

    if (originalPublicValue === undefined) {
      delete process.env[publicKey];
    } else {
      process.env[publicKey] = originalPublicValue;
    }

    if (originalPrivateValue === undefined) {
      delete process.env[privateKey];
    } else {
      process.env[privateKey] = originalPrivateValue;
    }

    if (originalWhitelistedValue === undefined) {
      delete process.env[whitelistedKey];
    } else {
      process.env[whitelistedKey] = originalWhitelistedValue;
    }
  });
});
