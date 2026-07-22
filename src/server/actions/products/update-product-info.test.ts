jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("../../providers", () => ({
  productRepository: {
    updateProductInfo: jest.fn(),
  },
}));

jest.mock("@/src/auth.config", () => ({
  auth: jest.fn(),
}));

import { auth } from "@/src/auth.config";
import { updateProductInfo } from "./update-product-info";
import { Product } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockProductRepository = jest.requireMock("../../providers").productRepository;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedAuth = auth as jest.MockedFunction<any>;

const withSessionTenant = (tenant = "tenant-1") => {
  mockedAuth.mockResolvedValue({ user: { tenant } });
};

describe("updateProductInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws when the session has no tenant", async () => {
    mockedAuth.mockResolvedValue({ user: {} });

    const formData = new FormData();
    formData.set("title", "Test Product");

    await expect(updateProductInfo(formData)).rejects.toThrow();
    expect(mockProductRepository.updateProductInfo).not.toHaveBeenCalled();
  });

  it("returns validation error when form data is invalid", async () => {
    withSessionTenant();

    const formData = new FormData();
    formData.set("title", "ab");

    const result = await updateProductInfo(formData);

    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
  });

  it("returns success when product is created", async () => {
    withSessionTenant();
    const product = Product.fromJson({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Test Product",
      slug: "test-product",
      price: 100,
    });
    mockProductRepository.updateProductInfo.mockResolvedValue(Result.success(product));

    const formData = new FormData();
    formData.set("title", "Test Product");
    formData.set("slug", "test-product");
    formData.set("description", "A test product");
    formData.set("price", "100");
    formData.set("inStock", "10");
    formData.set("sizes", "M,L");
    formData.set("tags", "test");
    formData.set("categoryId", "550e8400-e29b-41d4-a716-446655440001");
    formData.set("gender", "unisex");

    const result = await updateProductInfo(formData);

    expect(result.success).toBe(true);
  });

  it("stamps the product with the session tenant, ignoring any client-supplied tenant", async () => {
    withSessionTenant("tenant-1");
    const product = Product.fromJson({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Test Product",
      slug: "test-product",
      price: 100,
    });
    mockProductRepository.updateProductInfo.mockResolvedValue(Result.success(product));

    const formData = new FormData();
    formData.set("title", "Test Product");
    formData.set("slug", "test-product");
    formData.set("description", "A test product");
    formData.set("price", "100");
    formData.set("inStock", "10");
    formData.set("sizes", "M,L");
    formData.set("tags", "test");
    formData.set("categoryId", "550e8400-e29b-41d4-a716-446655440001");
    formData.set("gender", "unisex");
    formData.set("tenantId", "attacker-tenant");

    await updateProductInfo(formData);

    expect(mockProductRepository.updateProductInfo).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "tenant-1" }),
      expect.anything(),
    );
  });

  it("returns failure when repository returns an error", async () => {
    withSessionTenant();
    mockProductRepository.updateProductInfo.mockResolvedValue(
      Result.failure(new Error("DB error")),
    );

    const formData = new FormData();
    formData.set("title", "Test Product");
    formData.set("slug", "test-product");
    formData.set("description", "A test product");
    formData.set("price", "100");
    formData.set("inStock", "10");
    formData.set("sizes", "M,L");
    formData.set("tags", "test");
    formData.set("categoryId", "550e8400-e29b-41d4-a716-446655440001");
    formData.set("gender", "unisex");

    const result = await updateProductInfo(formData);

    expect(result).toEqual({ success: false, message: "DB error" });
  });

  it("uses ACTIVE as default status when not provided", async () => {
    withSessionTenant();
    const product = Product.fromJson({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Test Product",
      slug: "test-product",
      price: 100,
    });
    mockProductRepository.updateProductInfo.mockResolvedValue(Result.success(product));

    const formData = new FormData();
    formData.set("title", "Test Product");
    formData.set("slug", "test-product");
    formData.set("description", "A test product");
    formData.set("price", "100");
    formData.set("inStock", "10");
    formData.set("sizes", "M,L");
    formData.set("tags", "test");
    formData.set("categoryId", "550e8400-e29b-41d4-a716-446655440001");
    formData.set("gender", "unisex");

    const result = await updateProductInfo(formData);

    expect(result.success).toBe(true);
    expect(mockProductRepository.updateProductInfo).toHaveBeenCalled();
  });

  it("accepts INACTIVE as valid status", async () => {
    withSessionTenant();
    const product = Product.fromJson({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Test Product",
      slug: "test-product",
      price: 100,
    });
    mockProductRepository.updateProductInfo.mockResolvedValue(Result.success(product));

    const formData = new FormData();
    formData.set("title", "Test Product");
    formData.set("slug", "test-product");
    formData.set("description", "A test product");
    formData.set("price", "100");
    formData.set("inStock", "10");
    formData.set("sizes", "M,L");
    formData.set("tags", "test");
    formData.set("categoryId", "550e8400-e29b-41d4-a716-446655440001");
    formData.set("gender", "unisex");
    formData.set("status", "INACTIVE");

    const result = await updateProductInfo(formData);

    expect(result.success).toBe(true);
  });

  it("rejects invalid status value", async () => {
    withSessionTenant();

    const formData = new FormData();
    formData.set("title", "Test Product");
    formData.set("slug", "test-product");
    formData.set("description", "A test product");
    formData.set("price", "100");
    formData.set("inStock", "10");
    formData.set("sizes", "M,L");
    formData.set("tags", "test");
    formData.set("categoryId", "550e8400-e29b-41d4-a716-446655440001");
    formData.set("gender", "unisex");
    formData.set("status", "INVALID_STATUS");

    const result = await updateProductInfo(formData);

    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
  });
});
