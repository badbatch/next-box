import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server.js';
import { type OperationResult, ResultType } from '#operations/types.ts';

const statusCodes: Record<ResultType, number> = {
  [ResultType.Conflict]: StatusCodes.CONFLICT,
  [ResultType.Created]: StatusCodes.CREATED,
  [ResultType.Failure]: StatusCodes.INTERNAL_SERVER_ERROR,
  [ResultType.Forbidden]: StatusCodes.FORBIDDEN,
  [ResultType.NoContent]: StatusCodes.NO_CONTENT,
  [ResultType.NotFound]: StatusCodes.NOT_FOUND,
  [ResultType.Success]: StatusCodes.OK,
  [ResultType.Unauthorized]: StatusCodes.UNAUTHORIZED,
  [ResultType.Unavailable]: StatusCodes.SERVICE_UNAVAILABLE,
  [ResultType.ValidationError]: StatusCodes.BAD_REQUEST,
};

export const mapOperationResultToResponse = (result: OperationResult): Response =>
  result.type === ResultType.NoContent
    ? new Response(undefined, { status: statusCodes[result.type] })
    : NextResponse.json(result, { status: statusCodes[result.type] });
