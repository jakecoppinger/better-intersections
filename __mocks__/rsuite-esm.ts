// Stub for rsuite ESM imports in Jest (CommonJS) environment
export default {};
module.exports = new Proxy(
  {},
  { get: (_target, prop) => (prop === "__esModule" ? true : undefined) }
);
