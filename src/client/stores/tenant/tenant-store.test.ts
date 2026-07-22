import { useTenantStore } from "./tenant-store";

describe("useTenantStore", () => {
  afterEach(() => {
    useTenantStore.getState().resetTenant();
  });

  it("starts with an empty name and slug", () => {
    const { name, slug } = useTenantStore.getState();

    expect(name).toBe("");
    expect(slug).toBe("");
  });

  it("sets the tenant name and slug", () => {
    useTenantStore.getState().setTenant({ name: "Acme", slug: "acme" });

    const { name, slug } = useTenantStore.getState();

    expect(name).toBe("Acme");
    expect(slug).toBe("acme");
  });

  it("resets the tenant back to empty", () => {
    useTenantStore.getState().setTenant({ name: "Acme", slug: "acme" });

    useTenantStore.getState().resetTenant();

    const { name, slug } = useTenantStore.getState();

    expect(name).toBe("");
    expect(slug).toBe("");
  });
});
