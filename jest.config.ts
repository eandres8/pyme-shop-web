import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/tests/jest.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup-after-env.ts"],
  moduleNameMapper: {
    "^@/prisma/generated/prisma/client$": "<rootDir>/tests/mocks/prisma-client-stub.ts",
    "^@/src/config/database/prisma-client$": "<rootDir>/tests/mocks/prisma-client-stub.ts",
    "^next/font/google$": "<rootDir>/tests/mocks/next-font-google.mock.ts",
    "^@/(.+)$": "<rootDir>/$1",
  },
  // pnpm stores packages under node_modules/.pnpm/<pkg>@<version>/node_modules/<pkg>,
  // so a plain "node_modules/(?!next-auth)" pattern never matches the ESM-only
  // next-auth/@auth/core packages that need transforming (the ignored ".pnpm"
  // segment always comes first). Match on the pnpm store segment instead.
  transformIgnorePatterns: [
    "/node_modules/\\.pnpm/(?!(next-auth|@auth\\+core|@panva\\+hkdf)@)",
  ],
  // next-auth/@auth-core ship plain ESM .js; the ts-jest preset only registers
  // a transform for .ts(x), so unignoring them above isn't enough on its own.
  transform: {
    "^.+\\.[jt]sx?$": ["ts-jest", {}],
  },
  testMatch: ["**/*.test.{ts,tsx}"],
  passWithNoTests: true,
  collectCoverageFrom: [
    "src/shared/utils/**/*.ts",
    "src/server/**/*.ts",
    "src/client/**/*.{ts,tsx}",
    "!src/**/*.type.ts",
    "!src/**/*.interface.ts",
    "!src/**/*.entity.ts",
    "src/shared/components/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
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
