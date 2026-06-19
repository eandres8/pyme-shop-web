import { getCategoryListAction } from "./get-category-list";
import { MockCategoryRepository } from "@/tests/mocks/repositories";
import { Category } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

describe("getCategoryListAction", () => {
  it("returns mapped categories when repository succeeds", async () => {
    const cat1 = Category.fromJson({ id: "cat-1", name: "Electronics" });
    const cat2 = Category.fromJson({ id: "cat-2", name: "Clothing" });
    const mockRepo = MockCategoryRepository({
      listCategories: async () => Result.success([cat1, cat2]),
    });

    const action = getCategoryListAction(mockRepo);
    const result = await action();

    expect(result).toEqual([
      { id: "cat-1", name: "Electronics" },
      { id: "cat-2", name: "Clothing" },
    ]);
  });

  it("returns empty array when repository fails", async () => {
    const mockRepo = MockCategoryRepository({
      listCategories: async () => Result.failure(new Error("DB error")),
    });

    const action = getCategoryListAction(mockRepo);
    const result = await action();

    expect(result).toEqual([]);
  });
});
