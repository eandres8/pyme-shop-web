jest.mock("../../providers", () => ({
  productRepository: {
    productBySlug: jest.fn(),
  },
}));

import { getProductStockBySlug } from "./get-product-stock-by-slug";
import { Product } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockProductRepository = jest.requireMock("../../providers").productRepository;

describe("getProductStockBySlug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the stock count when product is found", async () => {
    const product = Product.fromJson({ id: "1", in_stock: 42 });
    mockProductRepository.productBySlug.mockResolvedValue(Result.success(product));

    const result = await getProductStockBySlug("test-product");

    expect(result).toBe(42);
  });

  it("scopes the lookup to a tenant when tenantId is provided", async () => {
    const product = Product.fromJson({ id: "1", in_stock: 42 });
    mockProductRepository.productBySlug.mockResolvedValue(Result.success(product));

    await getProductStockBySlug("test-product", "tenant-1");

    expect(mockProductRepository.productBySlug).toHaveBeenCalledWith("test-product", "tenant-1");
  });

  it("returns 0 when repository fails", async () => {
    mockProductRepository.productBySlug.mockResolvedValue(Result.failure(new Error("Not found")));

    const result = await getProductStockBySlug("non-existent");

    expect(result).toBe(0);
  });
});
