jest.mock("../../providers", () => ({
  productRepository: {
    listProducts: jest.fn(),
    countProducts: jest.fn(),
  },
}));

import { getPaginatedProductsWithImages } from "./products-pagination";
import { Product } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockProductRepository = jest.requireMock("../../providers").productRepository;

describe("getPaginatedProductsWithImages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns paginated products with default page and take", async () => {
    const products = [Product.fromJson({ id: "1", title: "Product 1" })];
    mockProductRepository.listProducts.mockResolvedValue(Result.success(products));
    mockProductRepository.countProducts.mockResolvedValue(
      Result.success({ currentPage: 1, totalPages: 1 }),
    );

    const result = await getPaginatedProductsWithImages({});

    expect(result.data).toEqual(products);
    expect(mockProductRepository.listProducts).toHaveBeenCalledWith({ page: 1, take: 10, category: undefined });
  });

  it("passes page, take and category to repository", async () => {
    mockProductRepository.listProducts.mockResolvedValue(Result.success([]));
    mockProductRepository.countProducts.mockResolvedValue(
      Result.success({ currentPage: 2, totalPages: 3 }),
    );

    const result = await getPaginatedProductsWithImages({ page: 2, take: 5, category: "men" });

    expect(result.currentPage).toBe(2);
    expect(mockProductRepository.listProducts).toHaveBeenCalledWith({
      page: 2, take: 5, category: "men",
    });
  });

  it("clamps page and take to minimum of 1", async () => {
    mockProductRepository.listProducts.mockResolvedValue(Result.success([]));
    mockProductRepository.countProducts.mockResolvedValue(
      Result.success({ currentPage: 1, totalPages: 1 }),
    );

    await getPaginatedProductsWithImages({ page: 0, take: -1 });

    expect(mockProductRepository.listProducts).toHaveBeenCalledWith({
      page: 1, take: 1, category: undefined,
    });
  });

  it("throws when listProducts fails", async () => {
    mockProductRepository.listProducts.mockResolvedValue(Result.failure(new Error("List failed")));
    mockProductRepository.countProducts.mockResolvedValue(
      Result.success({ currentPage: 1, totalPages: 1 }),
    );

    await expect(getPaginatedProductsWithImages({})).rejects.toThrow("List failed");
  });

  it("throws when countProducts fails", async () => {
    mockProductRepository.listProducts.mockResolvedValue(Result.success([]));
    mockProductRepository.countProducts.mockResolvedValue(
      Result.failure(new Error("Count failed")),
    );

    await expect(getPaginatedProductsWithImages({})).rejects.toThrow("Count failed");
  });
});
