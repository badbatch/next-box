export const sendEnvsToWorker = (worker: Worker) => {
  worker.postMessage({ payload: globalThis.env, type: 'envs' });
};
