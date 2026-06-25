jest.mock("../../providers", () => ({
  productRepository: {
    productExistsBySlug: jest.fn(),
  },
}));

jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

import { validateProductSlug } from "./validate-product-slug";
import { Result } from "@/src/core/utils";
import { auth } from "@/src/auth.config";

const mockProductRepository = jest.requireMock("../../providers").productRepository;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe("validateProductSlug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns available: true when slug does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { tenant: "tenant-1" } } as never);
    mockProductRepository.productExistsBySlug.mockResolvedValue(Result.success(false));

    const result = await validateProductSlug("new-product-slug");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.available).toBe(true);
    }
  });

  it("returns available: false when slug already exists", async () => {
    mockAuth.mockResolvedValue({ user: { tenant: "tenant-1" } } as never);
    mockProductRepository.productExistsBySlug.mockResolvedValue(Result.success(true));

    const result = await validateProductSlug("existing-slug");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.available).toBe(false);
    }
  });

  it("returns error when session has no tenant", async () => {
    mockAuth.mockResolvedValue({ user: {} } as never);

    const result = await validateProductSlug("some-slug");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe("Usuario sin tenant asignado");
    }
  });

  it("returns error when slug is too short", async () => {
    mockAuth.mockResolvedValue({ user: { tenant: "tenant-1" } } as never);

    const result = await validateProductSlug("ab");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe("Slug inválido");
    }
  });

  it("returns error when slug exceeds 255 characters", async () => {
    mockAuth.mockResolvedValue({ user: { tenant: "tenant-1" } } as never);

    const longSlug = "a".repeat(256);
    const result = await validateProductSlug(longSlug);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe("Slug inválido");
    }
  });

  it("returns error when repository fails", async () => {
    mockAuth.mockResolvedValue({ user: { tenant: "tenant-1" } } as never);
    mockProductRepository.productExistsBySlug.mockResolvedValue(
      Result.failure(new Error("DB error")),
    );

    const result = await validateProductSlug("some-slug");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe("Error al validar slug");
    }
  });
});
