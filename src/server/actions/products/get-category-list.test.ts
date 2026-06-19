jest.mock("../../providers", () => ({
  categoryRepository: {
    listCategories: jest.fn(),
  },
}));

import { getCategoryList } from "./get-category-list";
import { Category } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

const mockCategoryRepository = jest.requireMock("../../providers").categoryRepository;

describe("getCategoryList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns mapped categories when repository succeeds", async () => {
    const cat1 = Category.fromJson({ id: "1", name: "Men" });
    const cat2 = Category.fromJson({ id: "2", name: "Women" });
    mockCategoryRepository.listCategories.mockResolvedValue(Result.success([cat1, cat2]));

    const result = await getCategoryList();

    expect(result).toEqual([
      { id: "1", name: "Men" },
      { id: "2", name: "Women" },
    ]);
  });

  it("returns empty array when repository fails", async () => {
    mockCategoryRepository.listCategories.mockResolvedValue(Result.failure(new Error("DB error")));

    const result = await getCategoryList();

    expect(result).toEqual([]);
  });
});
