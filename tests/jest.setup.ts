import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

if (typeof File !== 'undefined' && !File.prototype.arrayBuffer) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (File.prototype as any).arrayBuffer = async function () {
    return Buffer.from('mock-content');
  };
}

process.env.PORT = "3000";
process.env.ORIGIN = "http://localhost:3000";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(process.env as any).NODE_ENV = "test";
process.env.API_KEY_SEED = "test-api-key-seed";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5432";
process.env.DB_USER = "test";
process.env.DB_PASS = "test";
process.env.DB_NAME = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.AUTH_SECRET = "test-secret-key-for-jest";
process.env.CLOUDINARY_CLOUD_NAME = "test";
process.env.CLOUDINARY_API_KEY = "test";
process.env.CLOUDINARY_API_SECRET = "test";
process.env.BACKLIST_KEY_WORDS = "admin,api,www";
