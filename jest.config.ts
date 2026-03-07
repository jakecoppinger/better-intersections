import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    // Stub out ESM-only packages that aren't relevant to unit test logic
    "^rsuite/esm/(.*)$": "<rootDir>/__mocks__/rsuite-esm.ts",
    "^rsuite$": "<rootDir>/__mocks__/rsuite-esm.ts",
  },
  transformIgnorePatterns: ["/node_modules/"],
};

export default config;
