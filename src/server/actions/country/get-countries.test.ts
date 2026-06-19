jest.mock("../../providers", () => ({
  countryRepository: {
    list: jest.fn(),
  },
}));

import { getCountries } from "./get-countries";
import { Result } from "@/src/core/utils";

const mockCountryRepository = jest.requireMock("../../providers").countryRepository;

describe("getCountries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns country list when repository succeeds", async () => {
    const countries = [
      { id: "US", name: "United States" },
      { id: "MX", name: "Mexico" },
    ];
    mockCountryRepository.list.mockResolvedValue(Result.success(countries));

    const result = await getCountries();

    expect(result).toEqual(countries);
  });

  it("returns empty array when repository fails", async () => {
    mockCountryRepository.list.mockResolvedValue(Result.failure(new Error("DB error")));

    const result = await getCountries();

    expect(result).toEqual([]);
  });
});
