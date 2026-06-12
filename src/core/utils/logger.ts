/* eslint-disable @typescript-eslint/no-explicit-any */
export function Logger(label: string) {
  const log = (...msg: any) => {
    console.log(`<${label}> `, ...msg);
  };
  
  const error = (...msg: any) => {
    console.error(`<${label}> `, ...msg);
  };

  return {
    log,
    error,
  };
}