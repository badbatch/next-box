import { describe, expect, it, jest } from '@jest/globals';
import { sendEnvsToWorker } from './sendEnvsToWorker.ts';

describe('sendEnvsToWorker', () => {
  it('When called with a worker, then it posts the global environment variables', () => {
    // Arrange
    const originalEnvDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'env');
    const env = { NEXT_PUBLIC_LANGUAGE_CODE: 'en' };
    Object.defineProperty(globalThis, 'env', { configurable: true, value: env, writable: true });
    const worker = { postMessage: jest.fn() } as unknown as Worker;

    // Act
    sendEnvsToWorker(worker);

    // Assert
    expect(worker.postMessage).toHaveBeenCalledWith({ payload: env, type: 'envs' });

    if (originalEnvDescriptor) {
      Object.defineProperty(globalThis, 'env', originalEnvDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, 'env');
    }
  });
});
