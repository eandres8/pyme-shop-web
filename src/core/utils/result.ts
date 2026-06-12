/**
 * Represents a successful outcome of an operation.
 * It contains a `value` of type `T`.
 * The `isOk` property is a discriminator and is always `true`.
 */
export type Success<T> = {
  readonly isOk: true;
  readonly data: T;
};

/**
 * Represents a failed outcome of an operation.
 * It contains an `error` of type `E`, which defaults to the built-in `Error` type.
 * The `isOk` property is a discriminator and is always `false`.
 */
export type Fail<E = Error> = {
  readonly isOk: false;
  readonly error: E;
};

/**
 * A discriminated union that represents either a successful outcome (`Ok<T>`)
 * or a failed outcome (`Err<E>`). This is a common pattern for error handling
 * without using exceptions.
 */
export type Result<T, E = Error> = Success<T> | Fail<E>;

/**
 * A namespace containing factory functions to create `Ok` and `Err` instances.
 * This mimics the `Result.ok()` and `Result.error()` factories from the Dart code.
 */
export const Result = {
  success: <T>(data: T): Success<T> => ({ isOk: true, data }),
  failure: <E = Error>(error: E): Fail<E> => ({ isOk: false, error }),
};