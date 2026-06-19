import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/tests/jest.setup.ts"],
  moduleNameMapper: {
    "^@/prisma/generated/prisma/client$": "<rootDir>/tests/mocks/prisma-client-stub.ts",
    "^@/src/config/database/prisma-client$": "<rootDir>/tests/mocks/prisma-client-stub.ts",
    "^@/(.+)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(next-auth|@auth/core)/)",
  ],
  testMatch: ["**/*.test.{ts,tsx}"],
  passWithNoTests: true,
  collectCoverageFrom: [
    "src/shared/utils/**/*.ts",
    "src/server/**/*.ts",
    "src/client/**/*.ts",
    "!src/**/*.type.ts",
    "!src/**/*.interface.ts",
    "!src/**/*.entity.ts",
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
