import './App.scss';
import '@fortawesome/fontawesome-free/js/all';
import 'react-app-polyfill/ie11';
import React, { FC, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import Button from 'react-bootstrap/Button';

const App: FC = () => {
  const { request } = useAuth();

  useEffect(() => {
    request('/auto-sign-in').then(({ response, error }) => {
      console.log(response, error);
    });
  }, [request]);

  return (
    <div className="App">
      <a
        href={`${process.env.REACT_APP_API_URL}/google-redirect?redirect=${encodeURIComponent(
          window.location.href.split('/').slice(0, 3).join('/')
        )}`}
        rel="noopener noreferrer"
      >
        Google Sign In
      </a>

      <Button
        onClick={() => {
          request('/sign-out').then(({ response, error }) => {
            console.log(response, error);
          });
        }}
      >
        Logout
      </Button>
    </div>
  );
};

export default App;
