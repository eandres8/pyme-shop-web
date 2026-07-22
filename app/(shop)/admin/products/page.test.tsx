jest.mock("@/src/server/actions", () => ({
  getPaginatedProductsWithImages: jest.fn(),
  requireSessionTenant: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/products",
  useSearchParams: () => new URLSearchParams(),
}));

import { render, screen } from "@testing-library/react";

import ProductsAdminPage from "./page";
import { getPaginatedProductsWithImages, requireSessionTenant } from "@/src/server/actions";
import { Product } from "@/src/core/entities";

const mockGetPaginatedProductsWithImages = getPaginatedProductsWithImages as jest.Mock;
const mockRequireSessionTenant = requireSessionTenant as jest.Mock;

describe("ProductsAdminPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("scopes the product listing to the session tenant", async () => {
    mockRequireSessionTenant.mockResolvedValue("tenant-1");
    const products = [
      Product.fromJson({ id: "1", title: "Producto tenant 1", slug: "producto-1" }),
    ];
    mockGetPaginatedProductsWithImages.mockResolvedValue({
      data: products,
      currentPage: 1,
      totalPages: 1,
    });

    const element = await ProductsAdminPage({ searchParams: Promise.resolve({}) });
    render(element);

    expect(mockGetPaginatedProductsWithImages).toHaveBeenCalledWith({
      page: undefined,
      showAll: true,
      tenantId: "tenant-1",
    });
    expect(screen.getByText("Producto tenant 1")).toBeInTheDocument();
  });

  it("propagates the fail-closed error when the session has no tenant", async () => {
    mockRequireSessionTenant.mockRejectedValue(new Error("No tenant"));

    await expect(
      ProductsAdminPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("No tenant");
    expect(mockGetPaginatedProductsWithImages).not.toHaveBeenCalled();
  });
});
