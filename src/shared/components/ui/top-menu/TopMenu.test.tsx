let mockPathname = "/";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

import { render, screen } from "@testing-library/react";

import { NON_STORE_SEGMENTS, TopMenu } from "./TopMenu";
import { useTenantStore } from "@/src/client/stores";

// Mirrors the real top-level route segments under app/ (excluding route
// groups, which don't add a path segment, and [storeSlug] itself). If a new
// top-level route is added without updating NON_STORE_SEGMENTS, its first
// path segment would be misread as a store slug by the header/link logic.
const REAL_TOP_LEVEL_ROUTE_SEGMENTS = [
  "admin", "cart", "checkout", "orders", "profile", "products",
  "empty", "auth", "api", "product", "category", "landing",
];

describe("TopMenu", () => {
  beforeEach(() => {
    mockPathname = "/";
    useTenantStore.getState().resetTenant();
  });

  it("renders the default brand in global mode", () => {
    mockPathname = "/";

    render(<TopMenu />);

    expect(screen.getByText("Pyme")).toBeInTheDocument();
    expect(screen.getByText(/\|\s*Shop/)).toBeInTheDocument();
  });

  it("renders the default brand on a store route before the tenant store hydrates", () => {
    mockPathname = "/acme";

    render(<TopMenu />);

    expect(screen.getByText(/\|\s*Shop/)).toBeInTheDocument();
  });

  it("renders the tenant name once the tenant store is hydrated", () => {
    mockPathname = "/acme";
    useTenantStore.getState().setTenant({ name: "Acme", slug: "acme" });

    render(<TopMenu />);

    expect(screen.getByText(/\|\s*Acme/)).toBeInTheDocument();
  });

  it("keeps links slug-less in global mode", () => {
    mockPathname = "/";

    render(<TopMenu />);

    expect(screen.getByText("Hombres").closest("a")).toHaveAttribute("href", "/category/men");
  });

  it("keeps links slug-relative on a store route", () => {
    mockPathname = "/acme";

    render(<TopMenu />);

    expect(screen.getByText("Hombres").closest("a")).toHaveAttribute("href", "/acme/category/men");
  });

  it("treats reserved top-level segments as global, not as a store slug", () => {
    mockPathname = "/cart";

    render(<TopMenu />);

    expect(screen.getByText(/\|\s*Shop/)).toBeInTheDocument();
    expect(screen.getByText("Hombres").closest("a")).toHaveAttribute("href", "/category/men");
  });

  it("keeps NON_STORE_SEGMENTS in sync with every real top-level app route", () => {
    for (const segment of REAL_TOP_LEVEL_ROUTE_SEGMENTS) {
      expect(NON_STORE_SEGMENTS.has(segment)).toBe(true);
    }
  });
});
