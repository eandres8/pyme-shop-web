jest.mock("@/src/server/actions", () => ({
  getProductBySlug: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

jest.mock("@/src/shared/components/product/add-to-cart/AddToCart", () => ({
  AddToCart: () => <div>add-to-cart</div>,
}));
jest.mock("@/src/shared/components/product/slideshow/ProductMobileSlideShow", () => ({
  ProductMobileSlideShow: () => <div>mobile-slideshow</div>,
}));
jest.mock("@/src/shared/components/product/slideshow/ProductSlideShow", () => ({
  ProductSlideShow: () => <div>desktop-slideshow</div>,
}));
jest.mock("@/src/shared/components/product/stock-label/StockLabel", () => ({
  StockLabel: () => <div>stock-label</div>,
}));

import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";

import GlobalProductDetail, { generateMetadata } from "./page";
import { getProductBySlug } from "@/src/server/actions";
import { Product } from "@/src/core/entities";

const mockGetProductBySlug = getProductBySlug as jest.Mock;

describe("GlobalProductDetail", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the product in place without redirecting", async () => {
    const product = Product.fromJson({
      id: "1",
      title: "Camisa Acme",
      slug: "camisa-acme",
      description: "desc",
      price: 100,
      images: ["a.jpg", "b.jpg"],
      tenant: { id: "t1", name: "Acme", slug: "acme", address: "", phone: "" },
    });
    mockGetProductBySlug.mockResolvedValue(product);

    const element = await GlobalProductDetail({ params: Promise.resolve({ slug: "camisa-acme" }) });
    render(element);

    expect(mockGetProductBySlug).toHaveBeenCalledWith("camisa-acme");
    expect(screen.getByText("Camisa Acme")).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("404s when the product does not exist", async () => {
    mockGetProductBySlug.mockResolvedValue(Product.fromJson({}));

    await expect(
      GlobalProductDetail({ params: Promise.resolve({ slug: "missing" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });

  it("sets canonical metadata to the owning tenant's slugged URL", async () => {
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
      { params: Promise.resolve({ slug: "camisa-acme" }) },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
    );

    expect(metadata.alternates).toEqual({ canonical: "/acme/product/camisa-acme" });
  });

  it("omits canonical metadata when the product has no owning tenant slug", async () => {
    const product = Product.fromJson({
      id: "1",
      title: "Sin tienda",
      slug: "sin-tienda",
      description: "desc",
      images: ["a.jpg"],
    });
    mockGetProductBySlug.mockResolvedValue(product);

    const metadata = await generateMetadata(
      { params: Promise.resolve({ slug: "sin-tienda" }) },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
    );

    expect(metadata.alternates).toBeUndefined();
  });
});
