import { getProductBySlugAction } from "./get-product-by-slug";
import { MockProductRepository } from "@/tests/mocks/repositories";
import { Product } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

describe("getProductBySlugAction", () => {
  it("returns the product when found", async () => {
    const product = Product.fromJson({ id: "prod-1", title: "Test Product", slug: "test-product" });
    const mockRepo = MockProductRepository({
      productBySlug: async () => Result.success(product),
    });

    const action = getProductBySlugAction(mockRepo);
    const result = await action("test-product");

    expect(result.title).toBe("Test Product");
    expect(result.slug).toBe("test-product");
  });

  it("returns an empty product when repository fails", async () => {
    const mockRepo = MockProductRepository({
      productBySlug: async () => Result.failure(new Error("Not found")),
    });

    const action = getProductBySlugAction(mockRepo);
    const result = await action("non-existent");

    expect(result.id).toBe("");
    expect(result.title).toBe("");
  });
});
