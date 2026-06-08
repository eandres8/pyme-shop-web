/**
 * @param { Promise } promise
 * @param { Object= } errorExt - Additional Information you can pass to the err object
 * @return { Promise }
 */
export function to<T, U extends object = Error>(
  promise: Promise<T>,
  errorExt: object = {},
): Promise<[undefined, U] | [T, null]> {
  return promise
    .then<[T, null]>((data) => [data, null])
    .catch<[undefined, U]>((err) => {
      const parsedError = { ...err, ...errorExt };
      return [undefined, parsedError];
    });
}
