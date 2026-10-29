import { useEffect, useState } from "react";

type LocalStorageValidator<T> = (value: unknown) => value is T;

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  validate?: LocalStorageValidator<T>,
) {
  const [state, setState] = useState<T>(() => {
    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
      return initialValue;
    }

    try {
      const parsedValue: unknown = JSON.parse(storedValue);

      if (validate && !validate(parsedValue)) {
        return initialValue;
      }

      return parsedValue as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}
