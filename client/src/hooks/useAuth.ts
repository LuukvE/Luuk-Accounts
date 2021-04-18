import { useState, useCallback } from 'react';

import { useDispatch, actions } from '../store';

const apiURL = process.env.REACT_APP_API_URL;

const useAuth = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const request = useCallback(
    async (url: string, body?: any) => {
      try {
        const res = await fetch(`${apiURL}${url}`, {
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: body ? JSON.stringify(body) : undefined
        });

        const response = await res.json();

        setLoading(false);

        dispatch(
          actions.set({
            user: response
          })
        );

        if (res.status >= 300) return { error: response };

        return { response: response };
      } catch (error) {
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
