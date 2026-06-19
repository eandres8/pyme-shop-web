class MockAuthError extends Error {
  type: string;

  constructor(type: string) {
    super(type);
    this.name = "AuthError";
    this.type = type;
  }
}

jest.mock("next-auth", () => ({
  AuthError: MockAuthError,
}));

const mockSignIn = jest.fn();

jest.mock("@/src/auth.config", () => ({
  signIn: mockSignIn,
}));

import { authenticate } from "./login";

describe("authenticate", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
  });

  it("returns undefined when signIn succeeds", async () => {
    mockSignIn.mockResolvedValue(undefined);

    const result = await authenticate(undefined, new FormData());

    expect(result).toBeUndefined();
  });

  it("returns 'Invalid credentials.' on CredentialsSignin error", async () => {
    const error = new MockAuthError("CredentialsSignin");
    mockSignIn.mockRejectedValue(error);

    const result = await authenticate(undefined, new FormData());

    expect(result).toBe("Invalid credentials.");
  });

  it("returns 'Something went wrong.' on other AuthError types", async () => {
    const error = new MockAuthError("SomeOtherError");
    mockSignIn.mockRejectedValue(error);

    const result = await authenticate(undefined, new FormData());

    expect(result).toBe("Something went wrong.");
  });

  it("re-throws non-AuthError exceptions", async () => {
    const error = new Error("Network error");
    mockSignIn.mockRejectedValue(error);

    await expect(authenticate(undefined, new FormData())).rejects.toThrow("Network error");
  });
});
