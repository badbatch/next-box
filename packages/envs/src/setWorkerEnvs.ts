import { isEnvsMessage } from '#helpers/isEnvsMessage.ts';

export const setWorkerEnvs = (callback?: () => void): void => {
  const onMessage = ({ data }: MessageEvent<unknown>): void => {
    // Condition is necessary
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!isEnvsMessage(data) || globalThis.env) {
      return;
    }

    // This is intentional
    // eslint-disable-next-line unicorn/no-global-object-property-assignment
    globalThis.env = data.payload;
    callback?.();
  };

  addEventListener('message', onMessage);
};
