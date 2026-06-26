export function textFormat(text: string = '') {
  const toTitle = () => {
    const upChar = text?.at(0)?.toUpperCase();
    const rest = text?.slice(1);

    return upChar+rest;
  };

  return {
    toTitle,
  };
}