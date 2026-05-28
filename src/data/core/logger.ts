export function Logger(label: string) {
  const log = (msg: unknown) => {
    console.log(`<${label}> `, msg);
  };
  
  const error = (msg: unknown) => {
    console.error(`<${label}> `, msg);
  };

  return {
    log,
    error,
  };
}