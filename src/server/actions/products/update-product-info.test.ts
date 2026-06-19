jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("../../providers", () => ({
  productRepository: {
    updateProductInfo: jest.fn(),
  },
}));

import { updateProductInfo } from "./update-product-info";
import { Product } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockProductRepository = jest.requireMock("../../providers").productRepository;

describe("updateProductInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns validation error when form data is invalid", async () => {
    const formData = new FormData();
    formData.set("title", "ab");

    const result = await updateProductInfo(formData);

    expect(result.success).toBe(false);
    expect(result.message).toBeDefined();
  });

  it("returns success when product is created", async () => {
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

  it("returns failure when repository returns an error", async () => {
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
});
