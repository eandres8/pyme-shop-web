jest.mock("@/src/server/providers", () => ({
  tenantRepository: {
    findBySlug: jest.fn(),
  },
}));

import { getTenantBySlug } from "./get-tenant-by-slug";
import { Tenant } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockTenantRepository = jest.requireMock("@/src/server/providers").tenantRepository;

describe("getTenantBySlug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the tenant when the slug resolves", async () => {
    const tenant = Tenant.fromJson({ id: "tenant-1", name: "My Store", slug: "my-store" });
    mockTenantRepository.findBySlug.mockResolvedValue(Result.success(tenant));

    const result = await getTenantBySlug("my-store");

    expect(result?.id).toBe("tenant-1");
    expect(mockTenantRepository.findBySlug).toHaveBeenCalledWith("my-store");
  });

  it("returns null when the slug does not resolve", async () => {
    mockTenantRepository.findBySlug.mockResolvedValue(Result.failure(new Error("Tenant no encontrado")));

    const result = await getTenantBySlug("unknown-store");

    expect(result).toBeNull();
  });
});
