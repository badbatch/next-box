declare global {
  // false positive. var is required for defining global properties.
  // eslint-disable-next-line no-var
  var env: Record<string, string | undefined>;
}
