import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.+)$": "<rootDir>/$1",
  },
  testMatch: ["**/*.test.{ts,tsx}"],
  passWithNoTests: true,
  collectCoverageFrom: [
    "src/shared/utils/**/*.ts",
    "src/shared/components/**/*.{ts,tsx}",
    "!**/*.test.*",
    "!**/index.ts",
  ],
  coverageDirectory: "reports/coverage",
  coverageReporters: ["lcov", "text", "html"],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "reports/junit",
        outputName: "jest-junit.xml",
        suiteName: "pyme-shop-web tests",
      },
    ],
  ],
};

export default config;
