import { describe, expect, it } from '@jest/globals';
import { type BreadcrumbRouteRule } from '#types.ts';
import { buildBreadcrumb } from './buildBreadcrumb.ts';

describe('buildBreadcrumb', () => {
  it('When no history entries match a route rule, then it returns an empty array', async () => {
    // Arrange
    const rule: BreadcrumbRouteRule<{ id: string }> = {
      regex: String.raw`^/users/(?<id>\d+)$`,
      resolve: (_captured, existing) => ({ ...existing, label: 'User' }),
    };

    const routeRules = [rule];
    const history = ['/about', '/users/new'];

    // Act
    const result = await buildBreadcrumb(routeRules, history);

    // Assert
    expect(result).toEqual([]);
  });

  it('When a history entry matches a route rule, then it builds a breadcrumb item from its named capture groups', async () => {
    // Arrange
    const rule: BreadcrumbRouteRule<{ id: string }> = {
      regex: String.raw`^/users/(?<id>\d+)$`,
      resolve: (captured, existing) => ({
        ...existing,
        label: `User ${captured.id}`,
      }),
    };

    const routeRules = [rule];
    const history = ['/users/42'];

    // Act
    const result = await buildBreadcrumb(routeRules, history);

    // Assert
    expect(result).toEqual([{ href: '/users/42', index: 0, label: 'User 42' }]);
  });

  it('When unmatched history entries are skipped, then it preserves the original history index', async () => {
    // Arrange
    const rule: BreadcrumbRouteRule<{ id: string }> = {
      regex: String.raw`^/users/(?<id>\d+)$`,
      resolve: (captured, existing) => ({
        ...existing,
        label: `User ${captured.id}`,
      }),
    };

    const routeRules = [rule];
    const history = ['/about', '/users/42'];

    // Act
    const result = await buildBreadcrumb(routeRules, history);

    // Assert
    expect(result).toEqual([{ href: '/users/42', index: 1, label: 'User 42' }]);
  });

  it('When multiple route rules match a history entry, then it applies them in order and passes each result to the next resolver', async () => {
    // Arrange
    const labelRule: BreadcrumbRouteRule<{ id: string }> = {
      regex: String.raw`^/users/(?<id>\d+)$`,
      resolve: (captured, existing) => ({
        ...existing,
        label: `User ${captured.id}`,
      }),
    };

    const hrefRule: BreadcrumbRouteRule<{ id: string }> = {
      regex: String.raw`^/users/(?<id>\d+)$`,
      resolve: (_captured, existing) => ({ ...existing, href: `${existing.href}/profile` }),
    };

    const routeRules = [labelRule, hrefRule];
    const history = ['/users/42'];

    // Act
    const result = await buildBreadcrumb(routeRules, history);

    // Assert
    expect(result).toEqual([{ href: '/users/42/profile', index: 0, label: 'User 42' }]);
  });

  it('When a route rule has an asynchronous resolver, then it waits for the resolved breadcrumb item', async () => {
    // Arrange
    const rule: BreadcrumbRouteRule<{ id: string }> = {
      regex: String.raw`^/users/(?<id>\d+)$`,
      resolve: (captured, existing) =>
        new Promise(resolve => {
          resolve({
            ...existing,
            label: `User ${captured.id}`,
          });
        }),
    };

    const routeRules = [rule];
    const history = ['/users/42'];

    // Act
    const result = await buildBreadcrumb(routeRules, history);

    // Assert
    expect(result).toEqual([{ href: '/users/42', index: 0, label: 'User 42' }]);
  });
});
