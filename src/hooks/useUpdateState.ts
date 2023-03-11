import { useState } from "react";

export const useUpdateState = <T extends { [key: string]: any }>(
  initialValue: T
) => {
  const [state, setState] = useState<T>(initialValue);

  const updateState = (newState: T) =>
    setState((oldState) => ({ ...oldState, ...newState }));

  return [state, updateState] as const;
};
