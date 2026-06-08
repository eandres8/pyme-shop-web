import { useEffect, useState } from "react";

export const useHydrateValidate = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(true);
  }, []);

  return loaded;
}