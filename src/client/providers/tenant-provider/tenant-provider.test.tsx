import { render } from "@testing-library/react";

import { TenantProvider } from "./tenant-provider";
import { useTenantStore } from "@/src/client/stores";

describe("TenantProvider", () => {
  afterEach(() => {
    useTenantStore.getState().resetTenant();
  });

  it("sets the tenant store on mount", () => {
    render(<TenantProvider name="Acme" slug="acme" />);

    const { name, slug } = useTenantStore.getState();

    expect(name).toBe("Acme");
    expect(slug).toBe("acme");
  });

  it("clears the tenant store on unmount", () => {
    const { unmount } = render(<TenantProvider name="Acme" slug="acme" />);

    unmount();

    const { name, slug } = useTenantStore.getState();

    expect(name).toBe("");
    expect(slug).toBe("");
  });
});
