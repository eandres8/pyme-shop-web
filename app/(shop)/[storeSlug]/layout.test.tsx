jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

jest.mock("@/src/server/actions/tenant/get-tenant-by-slug/get-tenant-by-slug", () => ({
  getTenantBySlug: jest.fn(),
}));

jest.mock("@/src/server/providers", () => ({
  tenantRepository: {
    listSlugs: jest.fn(),
  },
}));

import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";

import StoreLayout, { generateStaticParams } from "./layout";
import { getTenantBySlug } from "@/src/server/actions/tenant/get-tenant-by-slug/get-tenant-by-slug";
import { tenantRepository } from "@/src/server/providers";
import { useTenantStore } from "@/src/client/stores";
import { Result } from "@/src/core/utils";

const mockGetTenantBySlug = getTenantBySlug as jest.Mock;
const mockListSlugs = tenantRepository.listSlugs as jest.Mock;

describe("StoreLayout", () => {
  afterEach(() => {
    jest.clearAllMocks();
    useTenantStore.getState().resetTenant();
  });

  it("hydrates the tenant store and renders children when the slug resolves", async () => {
    mockGetTenantBySlug.mockResolvedValue({ id: "1", name: "Acme", slug: "acme" });

    const element = await StoreLayout({
      children: <div>store content</div>,
      params: Promise.resolve({ storeSlug: "acme" }),
    });
    render(element);

    expect(screen.getByText("store content")).toBeInTheDocument();
    expect(useTenantStore.getState().name).toBe("Acme");
  });

  it("calls notFound when the slug does not resolve to a tenant", async () => {
    mockGetTenantBySlug.mockResolvedValue(null);

    await expect(
      StoreLayout({
        children: <div>store content</div>,
        params: Promise.resolve({ storeSlug: "unknown" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });

  it("generateStaticParams pre-renders known store slugs", async () => {
    mockListSlugs.mockResolvedValue(Result.success(["acme", "beta"]));

    const params = await generateStaticParams();

    expect(params).toEqual([{ storeSlug: "acme" }, { storeSlug: "beta" }]);
  });

  it("generateStaticParams returns an empty list when slugs can't be listed", async () => {
    mockListSlugs.mockResolvedValue(Result.failure(new Error("db error")));

    const params = await generateStaticParams();

    expect(params).toEqual([]);
  });
});
