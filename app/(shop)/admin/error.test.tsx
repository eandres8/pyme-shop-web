import { render, screen, fireEvent } from "@testing-library/react";

import AdminError from "./error";

describe("AdminError", () => {
  it("renders an error message and retries on click", () => {
    const unstable_retry = jest.fn();
    const error = new Error("No se pudo resolver el tenant de la sesión del administrador");

    render(<AdminError error={error} unstable_retry={unstable_retry} />);

    expect(screen.getByText(/Ocurrió un error en el panel de administración/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

    expect(unstable_retry).toHaveBeenCalledTimes(1);
  });
});
