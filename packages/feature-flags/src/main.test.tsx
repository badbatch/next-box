import { describe, expect, it } from '@jest/globals';
import { renderToStaticMarkup } from 'react-dom/server';
import { Feature } from './Feature.tsx';
import { FeatureFlagProvider } from './Provider.tsx';
import { createHasFeature } from './createHasFeature.ts';
import { type FeatureFlag } from './types.ts';

const renderFeature = (envs: Record<string, string | undefined>, featureFlags: FeatureFlag[]) =>
  renderToStaticMarkup(
    <FeatureFlagProvider envs={envs} featureFlags={featureFlags}>
      <div>
        <Feature name="BETA_DASHBOARD">
          <span>Beta dashboard</span>
        </Feature>
      </div>
    </FeatureFlagProvider>,
  );

describe('feature flags integration', () => {
  it('When a feature is missing or disabled, then the server resolver returns false', () => {
    // Arrange
    const hasFeature = createHasFeature({
      featureFlags: [
        { enabled: false, name: 'DISABLED' },
        { enabled: true, name: 'ENABLED' },
      ],
    });

    // Act
    const results = [hasFeature('MISSING'), hasFeature('DISABLED'), hasFeature('ENABLED')];

    // Assert
    expect(results).toEqual([false, false, true]);
  });

  it('When an enabled feature uses Any requirements, then one matching client filter enables it', () => {
    // Arrange
    const featureFlags: FeatureFlag[] = [
      {
        conditions: {
          clientFilters: [
            { name: 'IsAdmin', parameters: {} },
            { name: 'IsBetaUser', parameters: {} },
          ],
        },
        enabled: true,
        name: 'REPORTS',
      },
    ];

    const hasFeature = createHasFeature({
      clientFilters: [
        { name: 'IsAdmin', resolve: () => false },
        { name: 'IsBetaUser', resolve: () => true },
      ],
      featureFlags,
    });

    // Act
    const isEnabled = hasFeature('REPORTS');

    // Assert
    expect(isEnabled).toBe(true);
  });

  it('When an enabled feature uses All requirements, then every matching client filter must pass', () => {
    // Arrange
    const featureFlags: FeatureFlag[] = [
      {
        conditions: {
          clientFilters: [
            { name: 'HasAccount', parameters: {} },
            { name: 'IsAdmin', parameters: {} },
          ],
          requirementType: 'All',
        },
        enabled: true,
        name: 'BILLING',
      },
    ];

    const hasFeature = createHasFeature({
      clientFilters: [
        { name: 'HasAccount', resolve: () => true },
        { name: 'IsAdmin', resolve: () => false },
      ],
      featureFlags,
    });

    // Act
    const isEnabled = hasFeature('BILLING');

    // Assert
    expect(isEnabled).toBe(false);
  });

  it('When public environment values override a flag, then Feature renders according to the override', () => {
    // Arrange
    const featureFlags: FeatureFlag[] = [{ enabled: false, name: 'BETA_DASHBOARD' }];

    // Act
    const enabledMarkup = renderFeature({ NEXT_PUBLIC_FF_BETA_DASHBOARD: 'true' }, featureFlags);

    const disabledMarkup = renderFeature({ NEXT_PUBLIC_FF_BETA_DASHBOARD: 'false' }, [
      { enabled: true, name: 'BETA_DASHBOARD' },
    ]);

    // Assert
    expect(enabledMarkup).toBe('<div><span>Beta dashboard</span></div>');
    expect(disabledMarkup).toBe('<div></div>');
    expect(featureFlags).toEqual([{ enabled: false, name: 'BETA_DASHBOARD' }]);
  });
});
