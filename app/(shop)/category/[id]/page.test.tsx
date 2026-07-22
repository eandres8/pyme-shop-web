jest.mock("@/src/server/actions", () => ({
  getPaginatedProductsWithImages: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/category/men",
  useSearchParams: () => new URLSearchParams(),
}));

import { render, screen } from "@testing-library/react";

import GlobalCategory from "./page";
import { getPaginatedProductsWithImages } from "@/src/server/actions";
import { Product } from "@/src/core/entities";

const mockGetPaginatedProductsWithImages = getPaginatedProductsWithImages as jest.Mock;

describe("GlobalCategory", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("lists products across all tenants for the category without redirecting", async () => {
    const products = [
      Product.fromJson({ id: "1", title: "Camisa Acme", slug: "camisa-acme", gender: "men" }),
      Product.fromJson({ id: "2", title: "Camisa Beta", slug: "camisa-beta", gender: "men" }),
    ];
    mockGetPaginatedProductsWithImages.mockResolvedValue({
      data: products,
      currentPage: 1,
      totalPages: 1,
    });

    const element = await GlobalCategory({
      params: Promise.resolve({ id: "men" }),
      searchParams: Promise.resolve({}),
    });
    render(element);

    expect(mockGetPaginatedProductsWithImages).toHaveBeenCalledWith({
      page: undefined,
      category: "men",
    });
    expect(screen.getByText("Camisa Acme")).toBeInTheDocument();
    expect(screen.getByText("Camisa Beta")).toBeInTheDocument();
  });

  it("paginates the global category listing", async () => {
    mockGetPaginatedProductsWithImages.mockResolvedValue({
      data: [],
      currentPage: 2,
      totalPages: 3,
    });

    await GlobalCategory({
      params: Promise.resolve({ id: "women" }),
      searchParams: Promise.resolve({ page: "2" }),
    });

    expect(mockGetPaginatedProductsWithImages).toHaveBeenCalledWith({
      page: 2,
      category: "women",
    });
  });
});
