import { useState, useCallback, useRef } from 'react';

import { useDispatch, actions } from '../store';

const apiURL = process.env.REACT_APP_API_URL;

const useAuth = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const request = useCallback(
    async (url: string, body?: any) => {
      setLoading(true);

      dispatch(
        actions.set({
          error: null
        })
      );

      if (abort.current) abort.current?.abort();

      const { signal } = (abort.current = new AbortController());

      try {
        const res = await fetch(`${apiURL}${url}`, {
          method: 'POST',
          mode: 'cors',
          signal,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: body ? JSON.stringify(body) : undefined
        });

        const response = await res.json();

        setLoading(false);

        if (res.status >= 300) {
          dispatch(
            actions.set({
              error: response
            })
          );

          return { error: response };
        }

        dispatch(
          actions.set({
            user: response
          })
        );

        return { response: response };
      } catch (error) {
        if (signal.aborted) return { aborted: true };

        setLoading(false);

        return { error };
      }
    },
    [dispatch]
  );

  return {
    loading,
    request
  };
};

export default useAuth;
