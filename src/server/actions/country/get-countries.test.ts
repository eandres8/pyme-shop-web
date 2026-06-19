import { getCountriesAction } from "./get-countries";
import { MockCountryRepository } from "@/tests/mocks/repositories";
import { Result } from "@/src/core/utils";
import type { TCountry } from "@/src/core/types";

describe("getCountriesAction", () => {
  it("returns country list when repository succeeds", async () => {
    const countries: TCountry[] = [{ id: "US", name: "United States" }];
    const mockRepo = MockCountryRepository({
      list: async () => Result.success(countries),
    });

    const action = getCountriesAction(mockRepo);
    const result = await action();

    expect(result).toEqual(countries);
  });

  it("returns empty array when repository fails", async () => {
    const mockRepo = MockCountryRepository({
      list: async () => Result.failure(new Error("DB error")),
    });

    const action = getCountriesAction(mockRepo);
    const result = await action();

    expect(result).toEqual([]);
  });
});
