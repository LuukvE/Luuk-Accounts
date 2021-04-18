import './App.scss';
import '@fortawesome/fontawesome-free/js/all';
import 'react-app-polyfill/ie11';
import React, { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { useSelector } from '../store';
import useAuth from '../hooks/useAuth';

import AuthButton from './AuthButton';

const App: FC = () => {
  const user = useSelector((state) => state.user);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { request, loading } = useAuth();

  const saveAccountSettings = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      request('/set-me', {
        name,
        password: password || undefined
      }).then(({ response, error }) => {
        setPassword('');
      });
    },
    [request, name, password]
  );

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  return (
    <div className="App">
      <header>
        <h1>RemoteAuth</h1>
        <AuthButton />
      </header>
      <main>
        {user && (
          <form className="account-settings" onSubmit={saveAccountSettings}>
            <h2>Account Settings</h2>
            <Form.Control
              placeholder="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <Form.Control
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <Button variant="success" type="submit" disabled={!password && user?.name === name}>
              {loading ? <Spinner animation="border" /> : 'Save'}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
};

export default App;
