declare global {
  var env: Record<string, string | undefined>;
}

export type EnvWorkerMessageData = {
  payload: Record<string, string | undefined>;
  type: 'envs';
};
