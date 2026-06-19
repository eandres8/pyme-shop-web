const mockSignOut = jest.fn();

jest.mock("@/src/auth.config", () => ({
  signOut: mockSignOut,
}));

import { logout } from "./logout";

describe("logout", () => {
  beforeEach(() => {
    mockSignOut.mockReset();
  });

  it("calls signOut from auth config", async () => {
    mockSignOut.mockResolvedValue(undefined);

    await logout();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
