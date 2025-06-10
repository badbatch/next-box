declare global {
  // false positive. var is required for defining global properties.
  // eslint-disable-next-line no-var
  var envs: Record<string, string | undefined>;
}
