/** @jest-environment node */

import { describe, expect, it } from '@jest/globals';
import { RemoteSource } from './RemoteSource.ts';

describe('RemoteSource', () => {
  it('When the response is successful, then it returns its JSON object', async () => {
    // Arrange
    const response = new Response(undefined, { status: 200 });
    response.json = () => Promise.resolve({ Api: { Timeout: 5000 } });
    const fetch = () => Promise.resolve(response);
    const source = new RemoteSource({ fetch, url: 'https://config.example.com/settings.json' });

    // Act
    const result = await source.load();

    // Assert
    expect(result).toEqual({ Api: { Timeout: 5000 } });
    expect(source.name).toBe('remote:https://config.example.com/settings.json');
  });

  it('When a response path is provided, then it returns the selected nested object', async () => {
    // Arrange
    const response = new Response();
    response.json = () => Promise.resolve({ data: { settings: { Api: { Timeout: 5000 } } } });
    const fetch = () => Promise.resolve(response);
    const source = new RemoteSource({ fetch, responsePath: 'data.settings', url: 'https://config.example.com' });

    // Act
    const result = await source.load();

    // Assert
    expect(result).toEqual({ Api: { Timeout: 5000 } });
  });

  it('When the response is not successful, then it throws an error containing the response status', async () => {
    // Arrange
    const fetch = () => Promise.resolve(new Response('Unavailable', { status: 503, statusText: 'Unavailable' }));
    const source = new RemoteSource({ fetch, url: 'https://config.example.com' });

    // Act
    const result = source.load();

    // Assert
    await expect(result).rejects.toThrow('503 Unavailable');
  });

  it('When the JSON root or selected response path is not an object, then it rejects', async () => {
    // Arrange
    const fetchArray = (): Promise<Response> => Promise.resolve(new Response('[]'));
    const fetchMissingPath = (): Promise<Response> => Promise.resolve(new Response('{"data": {"settings": []}}'));
    const rootSource = new RemoteSource({ fetch: fetchArray, url: 'https://config.example.com' });

    const nestedSource = new RemoteSource({
      fetch: fetchMissingPath,
      responsePath: 'data.settings',
      url: 'https://config.example.com',
    });

    // Act
    const root = rootSource.load();
    const nested = nestedSource.load();

    // Assert
    await expect(root).rejects.toThrow('must contain an object at the root');
    await expect(nested).rejects.toThrow('must contain an object at the root');
  });

  it('When a response path is used on a primitive JSON value, then it rejects before selecting the path', async () => {
    // Arrange
    const fetch = () => Promise.resolve(new Response('42'));
    const source = new RemoteSource({ fetch, responsePath: 'data', url: 'https://config.example.com' });

    // Act
    const result = source.load();

    // Assert
    await expect(result).rejects.toThrow('must be an object type if response path is provided');
  });
});
