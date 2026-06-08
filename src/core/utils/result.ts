export class Result<T, E = Error> {
  private constructor(
    readonly isOk: boolean,
    private readonly value?: T,
    private readonly error?: E,
  ) {}

  static success<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static failure<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  data<T>(): T {
    return this.value as T;
  }

  getError<E>(): E {
    return this.error as E;
  }
}
