/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it, jest } from '@jest/globals';
import { setWorkerEnvs } from './setWorkerEnvs.ts';

describe('setWorkerEnvs', () => {
  it('When a valid envs message arrives, then it stores the payload and calls the callback', () => {
    // Arrange
    const originalEnvDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'env');
    Reflect.deleteProperty(globalThis, 'env');
    const envs = { NEXT_PUBLIC_LANGUAGE_CODE: 'en' };
    const callback = jest.fn();
    const addEventListenerSpy = jest.spyOn(globalThis, 'addEventListener');
    setWorkerEnvs(callback);
    const listener = addEventListenerSpy.mock.calls.at(-1)?.[1];

    // Act
    globalThis.dispatchEvent(new MessageEvent('message', { data: { payload: envs, type: 'envs' } }));

    // Assert
    expect(globalThis.env).toEqual(envs);
    expect(callback).toHaveBeenCalledTimes(1);

    if (listener) {
      window.removeEventListener('message', listener);
    }

    addEventListenerSpy.mockRestore();

    if (originalEnvDescriptor) {
      Object.defineProperty(globalThis, 'env', originalEnvDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, 'env');
    }
  });

  it('When an invalid message arrives, then it leaves globalThis.env unchanged and does not call the callback', () => {
    // Arrange
    const originalEnvDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'env');
    Reflect.deleteProperty(globalThis, 'env');
    const callback = jest.fn();
    const addEventListenerSpy = jest.spyOn(globalThis, 'addEventListener');
    setWorkerEnvs(callback);
    const listener = addEventListenerSpy.mock.calls.at(-1)?.[1];

    // Act
    globalThis.dispatchEvent(new MessageEvent('message', { data: { payload: {}, type: 'other' } }));

    // Assert
    expect(globalThis.env).toBeUndefined();
    expect(callback).not.toHaveBeenCalled();

    if (listener) {
      window.removeEventListener('message', listener);
    }

    addEventListenerSpy.mockRestore();

    if (originalEnvDescriptor) {
      Object.defineProperty(globalThis, 'env', originalEnvDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, 'env');
    }
  });

  it('When globalThis.env is already populated, then it ignores the message', () => {
    // Arrange
    const originalEnvDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'env');
    const currentEnvs = { NEXT_PUBLIC_LANGUAGE_CODE: 'en' };
    Object.defineProperty(globalThis, 'env', { configurable: true, value: currentEnvs, writable: true });
    const callback = jest.fn();
    const addEventListenerSpy = jest.spyOn(globalThis, 'addEventListener');
    setWorkerEnvs(callback);
    const listener = addEventListenerSpy.mock.calls.at(-1)?.[1];

    // Act
    globalThis.dispatchEvent(
      new MessageEvent('message', { data: { payload: { NEXT_PUBLIC_LANGUAGE_CODE: 'fr' }, type: 'envs' } }),
    );

    // Assert
    expect(globalThis.env).toBe(currentEnvs);
    expect(callback).not.toHaveBeenCalled();

    if (listener) {
      window.removeEventListener('message', listener);
    }

    addEventListenerSpy.mockRestore();

    if (originalEnvDescriptor) {
      Object.defineProperty(globalThis, 'env', originalEnvDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, 'env');
    }
  });
});
