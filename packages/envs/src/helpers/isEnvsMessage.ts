import { type EnvWorkerMessageData } from '#types.ts';

export const isEnvsMessage = (data: unknown): data is EnvWorkerMessageData =>
  !!data && typeof data === 'object' && 'type' in data && data.type === 'envs';
