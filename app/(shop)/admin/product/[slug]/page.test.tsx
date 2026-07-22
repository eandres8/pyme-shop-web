jest.mock("@/src/server/actions", () => ({
  getCategoryList: jest.fn(),
  getProductBySlug: jest.fn(),
  requireSessionTenant: jest.fn(),
}));

const mockRedirect = jest.fn((_path: string) => {
  throw new Error("NEXT_REDIRECT");
});
jest.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

jest.mock("./ui/product-form/ProductForm", () => ({
  ProductForm: ({ product }: { product: { title: string } }) => (
    <div>product-form:{product.title}</div>
  ),
}));

import { render, screen } from "@testing-library/react";

import AdminProductPage from "./page";
import { getCategoryList, getProductBySlug, requireSessionTenant } from "@/src/server/actions";
import { Product } from "@/src/core/entities";

const mockGetProductBySlug = getProductBySlug as jest.Mock;
const mockGetCategoryList = getCategoryList as jest.Mock;
const mockRequireSessionTenant = requireSessionTenant as jest.Mock;

describe("AdminProductPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("resolves the product within the session tenant", async () => {
    mockRequireSessionTenant.mockResolvedValue("tenant-1");
    mockGetCategoryList.mockResolvedValue([]);
    const product = Product.fromJson({ id: "1", title: "Camisa tenant 1", slug: "camisa" });
    mockGetProductBySlug.mockResolvedValue(product);

    const element = await AdminProductPage({ params: Promise.resolve({ slug: "camisa" }) });
    render(element);

    expect(mockGetProductBySlug).toHaveBeenCalledWith("camisa", "tenant-1");
    expect(screen.getByText("product-form:Camisa tenant 1")).toBeInTheDocument();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects when the slug does not resolve within the session tenant", async () => {
    mockRequireSessionTenant.mockResolvedValue("tenant-1");
    mockGetCategoryList.mockResolvedValue([]);
    mockGetProductBySlug.mockResolvedValue(Product.fromJson({}));

    await expect(
      AdminProductPage({ params: Promise.resolve({ slug: "foreign-tenant-slug" }) }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockRedirect).toHaveBeenCalledWith("/admin/products");
  });

  it("does not redirect for the new-product slug even without a resolved product", async () => {
    mockRequireSessionTenant.mockResolvedValue("tenant-1");
    mockGetCategoryList.mockResolvedValue([]);
    mockGetProductBySlug.mockResolvedValue(Product.fromJson({}));

    const element = await AdminProductPage({ params: Promise.resolve({ slug: "new" }) });
    render(element);

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("propagates the fail-closed error when the session has no tenant", async () => {
    mockRequireSessionTenant.mockRejectedValue(new Error("No tenant"));

    await expect(
      AdminProductPage({ params: Promise.resolve({ slug: "camisa" }) }),
    ).rejects.toThrow("No tenant");
    expect(mockGetProductBySlug).not.toHaveBeenCalled();
  });
});
