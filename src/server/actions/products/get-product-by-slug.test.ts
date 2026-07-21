jest.mock("../../providers", () => ({
  productRepository: {
    productBySlug: jest.fn(),
  },
}));

import { getProductBySlug } from "./get-product-by-slug";
import { Product } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockProductRepository = jest.requireMock("../../providers").productRepository;

describe("getProductBySlug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the product when found", async () => {
    const product = Product.fromJson({ id: "1", title: "Test Product", slug: "test-product" });
    mockProductRepository.productBySlug.mockResolvedValue(Result.success(product));

    const result = await getProductBySlug("test-product");

    expect(result.title).toBe("Test Product");
  });

  it("scopes the lookup to a tenant when tenantId is provided", async () => {
    const product = Product.fromJson({ id: "1", title: "Test Product", slug: "test-product" });
    mockProductRepository.productBySlug.mockResolvedValue(Result.success(product));

    await getProductBySlug("test-product", "tenant-1");

    expect(mockProductRepository.productBySlug).toHaveBeenCalledWith("test-product", "tenant-1");
  });

  it("returns an empty product when repository fails", async () => {
    mockProductRepository.productBySlug.mockResolvedValue(Result.failure(new Error("Not found")));

    const result = await getProductBySlug("non-existent");

    expect(result.id).toBe("");
  });
});
