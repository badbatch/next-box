import { describe, expect, it } from '@jest/globals';
import { z } from 'zod';
import { defineOperation } from './operations/defineOperation.ts';
import { mapOperationResultToResponse } from './operations/mapOperationResultToResponse.ts';
import { type OperationResult, ResultType } from './operations/types.ts';

type Session = { id: string };

describe('server operations', () => {
  it('When valid input and runtime context are supplied, then the handler receives parsed input and merged context', async () => {
    // Arrange
    const validation = z.object({ id: z.string().transform(id => id.toUpperCase()) });

    const operation = defineOperation({
      context: { region: 'default', session: undefined as Session | undefined, source: 'definition' },
      handler: ({ context, input }) => ({
        data: { id: input.id, region: context.region, sessionId: context.session?.id, source: context.source },
        type: ResultType.Success,
      }),
      validation,
    });

    // Act
    const result = await operation({
      context: { session: { id: 'session-1' }, source: 'invocation' },
      input: { id: 'user-1' },
    });

    // Assert
    expect(result).toEqual({
      data: { id: 'USER-1', region: 'default', sessionId: 'session-1', source: 'invocation' },
      type: ResultType.Success,
    });
  });

  it('When input fails validation, then it returns a validation result without calling the handler', async () => {
    // Arrange
    let wasHandlerCalled = false;

    const operation = defineOperation({
      context: {},
      handler: () => {
        wasHandlerCalled = true;

        return { data: undefined, type: ResultType.Success };
      },
      validation: z.object({ id: z.string() }),
    });

    // Act
    const result = await operation({ input: { id: 42 } });

    // Assert
    expect(result).toMatchObject({
      errors: [{ issues: [{ message: expect.any(String), path: ['id'] }] }],
      type: ResultType.ValidationError,
    });

    expect(wasHandlerCalled).toBe(false);
  });

  it.each([
    [{ data: { id: 'user-1' }, type: ResultType.Success }, 200],
    [{ data: { id: 'user-1' }, type: ResultType.Created }, 201],
    [{ type: ResultType.NoContent }, 204],
    [{ errors: [], type: ResultType.ValidationError }, 400],
    [{ type: ResultType.Unauthorized }, 401],
    [{ type: ResultType.Forbidden }, 403],
    [{ type: ResultType.NotFound }, 404],
    [{ type: ResultType.Conflict }, 409],
    [{ type: ResultType.Unavailable }, 503],
    [{ type: ResultType.Failure }, 500],
  ] as [OperationResult, number][])('When result %s is mapped, then it uses HTTP status %i', async (result, status) => {
    // Arrange

    // Act
    const response = mapOperationResultToResponse(result);

    // Assert
    expect(response.status).toBe(status);

    if (result.type === ResultType.NoContent) {
      await expect(response.text()).resolves.toBe('');
    } else {
      await expect(response.json()).resolves.toEqual(result);
    }
  });
});
