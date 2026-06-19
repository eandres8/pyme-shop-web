import { generatePaginationNumbers } from "./generate-pagination-numbers.util";

describe("generatePaginationNumbers", () => {
  it("returns all pages when totalPages <= maxItems (default 7)", () => {
    const result = generatePaginationNumbers(1, 5);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns all pages when totalPages equals maxItems", () => {
    const result = generatePaginationNumbers(1, 7);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("returns truncated start with ellipsis when currentPage <= 3 and totalPages > 7", () => {
    const result = generatePaginationNumbers(1, 10);
    expect(result).toEqual([1, 2, 3, "...", 9, 10]);
  });

  it("returns truncated start when currentPage is 2 and totalPages > 7", () => {
    const result = generatePaginationNumbers(2, 10);
    expect(result).toEqual([1, 2, 3, "...", 9, 10]);
  });

  it("returns truncated start when currentPage is 3 and totalPages > 7", () => {
    const result = generatePaginationNumbers(3, 10);
    expect(result).toEqual([1, 2, 3, "...", 9, 10]);
  });

  it("returns truncated end when currentPage >= totalPages - 2 and totalPages > 7", () => {
    const result = generatePaginationNumbers(9, 10);
    expect(result).toEqual([1, 2, "...", 8, 9, 10]);
  });

  it("returns truncated end when currentPage is totalPages and totalPages > 7", () => {
    const result = generatePaginationNumbers(10, 10);
    expect(result).toEqual([1, 2, "...", 8, 9, 10]);
  });

  it("returns truncated end when currentPage is totalPages - 2 and totalPages > 7", () => {
    const result = generatePaginationNumbers(8, 10);
    expect(result).toEqual([1, 2, "...", 8, 9, 10]);
  });

  it("returns middle window with ellipsis on both sides", () => {
    const result = generatePaginationNumbers(5, 10);
    expect(result).toEqual([1, "...", 4, 5, 6, "...", 10]);
  });

  it("returns middle window when currentPage is 4 and totalPages > 7", () => {
    const result = generatePaginationNumbers(4, 10);
    expect(result).toEqual([1, "...", 3, 4, 5, "...", 10]);
  });

  it("returns middle window when currentPage is 7 and totalPages > 7", () => {
    const result = generatePaginationNumbers(7, 10);
    expect(result).toEqual([1, "...", 6, 7, 8, "...", 10]);
  });
});
