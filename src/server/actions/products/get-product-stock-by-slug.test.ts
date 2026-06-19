import { getProductStockBySlugAction } from "./get-product-stock-by-slug";
import { MockProductRepository } from "@/tests/mocks/repositories";
import { Product } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

describe("getProductStockBySlugAction", () => {
  it("returns the stock count when product is found", async () => {
    const product = Product.fromJson({ id: "prod-1", in_stock: 42 });
    const mockRepo = MockProductRepository({
      productBySlug: async () => Result.success(product),
    });

    const action = getProductStockBySlugAction(mockRepo);
    const result = await action("test-product");

    expect(result).toBe(42);
  });

  it("returns 0 when repository fails", async () => {
    const mockRepo = MockProductRepository({
      productBySlug: async () => Result.failure(new Error("Not found")),
    });

    const action = getProductStockBySlugAction(mockRepo);
    const result = await action("non-existent");

    expect(result).toBe(0);
  });
});
