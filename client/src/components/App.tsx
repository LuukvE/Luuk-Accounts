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
      <div className="hero">
        <h2>Open Source Authentication Service</h2>
      </div>
      <main>
        {!user && (
          <>
            <div>
              <h3>Introduction</h3>
              <p>
                RemoteAuth is an out-of-the-box software solution for authentication and user
                management. Instead of buying an authentication service, you can simply{' '}
                <a target="_blank" rel="noopener noreferrer" href="https://github.com/LuukvE/Auth">
                  install and use RemoteAuth for free
                </a>
                .<br />
                This software is meant for software engineers that just want to keep building their
                other services, without losing control of user authentication and management.
              </p>
            </div>
            <div>
              <h3>Features</h3>
              <ul>
                <li>Sign in with Google or with an email and password</li>
                <li>Authenticate your users on your other APIs using JWT tokens</li>
                <li>Custom permissions and nested groups for user authorization</li>
                <li>Full source code written in TypeScript, with React in the user interface</li>
              </ul>
            </div>
            <div>
              <h3>Benefits</h3>
              <ul>
                <li>
                  Complete freedom in designing the interface you want your users to experience
                </li>
                <li>
                  Absolute flexibility in delivering features and solving bugs, you have all the{' '}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/LuukvE/Auth"
                  >
                    source code
                  </a>
                </li>
                <li>
                  Full ownership of your user accounts, everything including the hashed passwords
                  are yours
                </li>
              </ul>
            </div>
            <div>
              <h3>APIs</h3>
              <ul>
                <li>
                  <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer">
                    <b>Sendgrid</b>
                  </a>{' '}
                  sends create account and forgot password e-mails
                </li>
                <li>
                  <a
                    href="https://cloud.google.com/functions"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <b>Google Cloud Functions</b>
                  </a>{' '}
                  hosts the RemoteAuth TypeScript API
                </li>
                <li>
                  <a
                    href="https://cloud.google.com/firestore"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <b>Google Cloud Firestore</b>
                  </a>{' '}
                  stores user accounts and software configuration
                </li>
              </ul>
            </div>
          </>
        )}
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
