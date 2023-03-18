import {useCallback, useEffect, useState } from "react";

import type { Dispatch, SetStateAction } from "react";

const dateReplacer = (key: string, value: any) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
    return { r2Type: 'Date', value: new Date(value).getTime() };
  }
  return value;
}

const dateReviver = (key: string, value: any) => {
  if (value && value.r2Type === 'Date') {
    return new Date(value.value);
  }
  return value;
}


export default <T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    const storedValue = localStorage.getItem(key);
    setState(storedValue ? JSON.parse(storedValue, dateReviver) : defaultValue);
  }, [key, defaultValue]);

  const setValueAndStore = useCallback((action: SetStateAction<T>) => setState(prevState => {
    const newState: T = typeof action === 'function' ? (action as ((prevState: T) => T))(prevState) : action;
    localStorage.setItem(key, JSON.stringify(newState, dateReplacer));
    return newState
  }), [setState])

  return [state, setValueAndStore];
}
