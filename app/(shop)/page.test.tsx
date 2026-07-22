jest.mock("@/src/server/actions", () => ({
  getPaginatedProductsWithImages: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

import { render, screen } from "@testing-library/react";

import GlobalHomePage from "./page";
import { getPaginatedProductsWithImages } from "@/src/server/actions";
import { Product } from "@/src/core/entities";

const mockGetPaginatedProductsWithImages = getPaginatedProductsWithImages as jest.Mock;

describe("GlobalHomePage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("lists products across all tenants", async () => {
    const products = [
      Product.fromJson({ id: "1", title: "Producto Acme", slug: "producto-acme" }),
      Product.fromJson({ id: "2", title: "Producto Beta", slug: "producto-beta" }),
    ];
    mockGetPaginatedProductsWithImages.mockResolvedValue({
      data: products,
      currentPage: 1,
      totalPages: 1,
    });

    const element = await GlobalHomePage({ searchParams: Promise.resolve({}) });
    render(element);

    expect(mockGetPaginatedProductsWithImages).toHaveBeenCalledWith({ page: undefined });
    expect(screen.getByText("Producto Acme")).toBeInTheDocument();
    expect(screen.getByText("Producto Beta")).toBeInTheDocument();
  });

  it("paginates via the page search param", async () => {
    mockGetPaginatedProductsWithImages.mockResolvedValue({
      data: [],
      currentPage: 2,
      totalPages: 5,
    });

    await GlobalHomePage({ searchParams: Promise.resolve({ page: "2" }) });

    expect(mockGetPaginatedProductsWithImages).toHaveBeenCalledWith({ page: 2 });
  });
});
