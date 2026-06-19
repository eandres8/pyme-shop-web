import { getPaginatedProductsWithImagesAction } from "./products-pagination";
import { MockProductRepository } from "@/tests/mocks/repositories";
import { Product } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const makeProduct = (id: string) => Product.fromJson({ id, title: `Product ${id}`, slug: id });

describe("getPaginatedProductsWithImagesAction", () => {
  it("returns paginated products with default page and take", async () => {
    const products = [makeProduct("p1"), makeProduct("p2")];
    const mockRepo = MockProductRepository({
      listProducts: async () => Result.success(products),
      countProducts: async () => Result.success({ currentPage: 1, totalPages: 1 }),
    });

    const action = getPaginatedProductsWithImagesAction(mockRepo);
    const result = await action({});

    expect(result.data).toEqual(products);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("passes page, take and category to repository", async () => {
    const mockRepo = MockProductRepository({
      listProducts: async (props) => {
        expect(props.page).toBe(2);
        expect(props.take).toBe(5);
        expect(props.category).toBe("men");
        return Result.success([]);
      },
      countProducts: async (props) => {
        expect(props.page).toBe(2);
        expect(props.take).toBe(5);
        expect(props.category).toBe("men");
        return Result.success({ currentPage: 2, totalPages: 3 });
      },
    });

    const action = getPaginatedProductsWithImagesAction(mockRepo);
    const result = await action({ page: 2, take: 5, category: "men" });

    expect(result.currentPage).toBe(2);
    expect(result.totalPages).toBe(3);
  });

  it("clamps page and take to minimum of 1", async () => {
    const mockRepo = MockProductRepository({
      listProducts: async (props) => {
        expect(props.page).toBe(1);
        expect(props.take).toBe(1);
        return Result.success([]);
      },
      countProducts: async (props) => {
        expect(props.page).toBe(1);
        expect(props.take).toBe(1);
        return Result.success({ currentPage: 1, totalPages: 1 });
      },
    });

    const action = getPaginatedProductsWithImagesAction(mockRepo);
    const result = await action({ page: 0, take: -1 });

    expect(result.currentPage).toBe(1);
  });

  it("throws when listProducts fails", async () => {
    const mockRepo = MockProductRepository({
      listProducts: async () => Result.failure(new Error("List failed")),
      countProducts: async () => Result.success({ currentPage: 1, totalPages: 1 }),
    });

    const action = getPaginatedProductsWithImagesAction(mockRepo);

    await expect(action({})).rejects.toThrow("List failed");
  });

  it("throws when countProducts fails", async () => {
    const mockRepo = MockProductRepository({
      listProducts: async () => Result.success([]),
      countProducts: async () => Result.failure(new Error("Count failed")),
    });

    const action = getPaginatedProductsWithImagesAction(mockRepo);

    await expect(action({})).rejects.toThrow("Count failed");
  });
});
