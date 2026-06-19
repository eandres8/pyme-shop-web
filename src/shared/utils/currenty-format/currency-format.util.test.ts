import { currencyFormat } from "./currency-format.util";

describe("currencyFormat", () => {
  it("formats a whole number as USD", () => {
    expect(currencyFormat(1234)).toBe("$1,234.00");
  });

  it("formats a decimal number with two fraction digits", () => {
    expect(currencyFormat(1234.5)).toBe("$1,234.50");
  });

  it("formats a number with more than two decimal places", () => {
    expect(currencyFormat(1234.567)).toBe("$1,234.57");
  });

  it("formats zero", () => {
    expect(currencyFormat(0)).toBe("$0.00");
  });

  it("formats a large number", () => {
    expect(currencyFormat(1_000_000)).toBe("$1,000,000.00");
  });

  it("formats a negative number", () => {
    expect(currencyFormat(-500)).toBe("-$500.00");
  });
});
