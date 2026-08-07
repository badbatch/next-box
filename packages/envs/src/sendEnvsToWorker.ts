export const sendEnvsToWorker = (worker: Worker): void => {
  worker.postMessage({ payload: globalThis.env, type: 'envs' });
};
