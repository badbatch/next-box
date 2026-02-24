import { isEnvsMessage } from '#helpers/isEnvsMessage.ts';

export const setWorkerEnvs = (callback?: () => void): void => {
  const onMessage = ({ data }: MessageEvent<unknown>): void => {
    // Condition is necessary
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (isEnvsMessage(data) && !globalThis.env) {
      globalThis.env = data.payload;
      callback?.();
    }
  };

  globalThis.addEventListener('message', onMessage);
};
