jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import { updateProductInfoAction } from "./update-product-info";
import { MockProductRepository } from "@/tests/mocks/repositories";
import { Product } from "@/src/core/entities";
import { Result } from "@/src/core/utils";
import { revalidatePath } from "next/cache";

describe("updateProductInfoAction", () => {
  beforeEach(() => {
    (revalidatePath as jest.Mock).mockClear();
  });

  it("returns validation error when form data is invalid", async () => {
    const mockRepo = MockProductRepository();
    const action = updateProductInfoAction(mockRepo);

    const formData = new FormData();
    formData.set("title", "ab");

    const result = await action(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBeTruthy();
    }
  });

  it("returns success when product is created", async () => {
    const product = Product.fromJson({ id: "prod-1", title: "Test Product", slug: "test_product" });

    const mockRepo = MockProductRepository({
      updateProductInfo: async () => Result.success(product),
    });

    const action = updateProductInfoAction(mockRepo);

    const formData = new FormData();
    formData.set("title", "Test Product");
    formData.set("slug", "test product");
    formData.set("description", "A great product");
    formData.set("price", "29.99");
    formData.set("inStock", "10");
    formData.set("sizes", "M,L");
    formData.set("tags", "tag1,tag2");
    formData.set("categoryId", "550e8400-e29b-41d4-a716-446655440000");
    formData.set("gender", "men");

    const result = await action(formData);

    expect(result.success).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/admin/products");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/product/test_product");
    expect(revalidatePath).toHaveBeenCalledWith("/products/test_product");
  });

  it("returns failure when repository returns an error", async () => {
    const mockRepo = MockProductRepository({
      updateProductInfo: async () => Result.failure(new Error("Update failed")),
    });

    const action = updateProductInfoAction(mockRepo);

    const formData = new FormData();
    formData.set("title", "Test Product");
    formData.set("slug", "test_product");
    formData.set("description", "A great product");
    formData.set("price", "29.99");
    formData.set("inStock", "10");
    formData.set("sizes", "M,L");
    formData.set("tags", "tag1,tag2");
    formData.set("categoryId", "550e8400-e29b-41d4-a716-446655440000");
    formData.set("gender", "men");

    const result = await action(formData);

    expect(result).toEqual({ success: false, message: "Update failed" });
  });
});
