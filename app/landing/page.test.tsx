import { render, screen } from "@testing-library/react";

import LandingPage from "./page";

describe("LandingPage", () => {
  it("renders the marketing content with pricing tiers", async () => {
    const element = await LandingPage();
    render(element);

    expect(screen.getByText("Catálogo en linea")).toBeInTheDocument();
    expect(screen.getByText("Precios")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("$25.000 / mes")).toBeInTheDocument();
  });
});
