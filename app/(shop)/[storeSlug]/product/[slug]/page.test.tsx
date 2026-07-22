jest.mock("@/src/server/actions", () => ({
  getProductBySlug: jest.fn(),
}));

jest.mock("@/src/server/actions/tenant/get-tenant-by-slug/get-tenant-by-slug", () => ({
  getTenantBySlug: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

jest.mock("@/src/shared/components/product", () => ({
  AddToCart: () => <div>add-to-cart</div>,
  ProductMobileSlideShow: () => <div>mobile-slideshow</div>,
  ProductSlideShow: () => <div>desktop-slideshow</div>,
  StockLabel: () => <div>stock-label</div>,
}));

import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";

import ProductDetail, { generateMetadata } from "./page";
import { getProductBySlug } from "@/src/server/actions";
import { getTenantBySlug } from "@/src/server/actions/tenant/get-tenant-by-slug/get-tenant-by-slug";
import { Product } from "@/src/core/entities";

const mockGetProductBySlug = getProductBySlug as jest.Mock;
const mockGetTenantBySlug = getTenantBySlug as jest.Mock;

describe("ProductDetail (store-scoped)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("resolves the product within the store's tenant", async () => {
    mockGetTenantBySlug.mockResolvedValue({ id: "t1", name: "Acme", slug: "acme" });
    const product = Product.fromJson({
      id: "1",
      title: "Camisa Acme",
      slug: "camisa-acme",
      description: "desc",
      images: ["a.jpg", "b.jpg"],
      tenant: { id: "t1", name: "Acme", slug: "acme", address: "", phone: "" },
    });
    mockGetProductBySlug.mockResolvedValue(product);

    const element = await ProductDetail({
      params: Promise.resolve({ storeSlug: "acme", slug: "camisa-acme" }),
    });
    render(element);

    expect(mockGetProductBySlug).toHaveBeenCalledWith("camisa-acme", "t1");
    expect(screen.getByText("Camisa Acme")).toBeInTheDocument();
  });

  it("404s when the store slug does not resolve to a tenant", async () => {
    mockGetTenantBySlug.mockResolvedValue(null);

    await expect(
      ProductDetail({ params: Promise.resolve({ storeSlug: "unknown", slug: "camisa-acme" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
    expect(mockGetProductBySlug).not.toHaveBeenCalled();
  });

  it("404s when the product doesn't exist within the resolved tenant", async () => {
    mockGetTenantBySlug.mockResolvedValue({ id: "t1", name: "Acme", slug: "acme" });
    mockGetProductBySlug.mockResolvedValue(Product.fromJson({}));

    await expect(
      ProductDetail({ params: Promise.resolve({ storeSlug: "acme", slug: "missing" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });

  it("builds metadata scoped to the store's tenant", async () => {
    mockGetTenantBySlug.mockResolvedValue({ id: "t1", name: "Acme", slug: "acme" });
    const product = Product.fromJson({
      id: "1",
      title: "Camisa Acme",
      slug: "camisa-acme",
      description: "desc",
      images: ["a.jpg", "b.jpg"],
      tenant: { id: "t1", name: "Acme", slug: "acme", address: "", phone: "" },
    });
    mockGetProductBySlug.mockResolvedValue(product);

    const metadata = await generateMetadata(
      { params: Promise.resolve({ storeSlug: "acme", slug: "camisa-acme" }) },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
    );

    expect(mockGetProductBySlug).toHaveBeenCalledWith("camisa-acme", "t1");
    expect(metadata.title).toBe("Camisa Acme");
  });
});
