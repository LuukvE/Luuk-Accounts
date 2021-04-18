import { useState, useCallback } from 'react';

const apiURL = process.env.REACT_APP_API_URL;

const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (url: string, body?: any) => {
    setLoading(true);

    try {
      const res = await fetch(`${apiURL}${url}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (res.status === 204) return {};

      const response = await res.json();

      setLoading(false);

      if (res.status >= 300) return { error: response };

      return { response: response };
    } catch (error) {
      setLoading(false);

      return { error };
    }
  }, []);

  return {
    loading,
    request
  };
};

export default useAuth;
