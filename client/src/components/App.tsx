import './App.scss';
import '@fortawesome/fontawesome-free/js/all';
import 'react-app-polyfill/ie11';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import { useSelector } from '../store';
import useAuth from '../hooks/useAuth';

import AuthButton from './AuthButton';
import Groups from './Groups';

const App: FC = () => {
  const history = useHistory();
  const { request, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, error } = useSelector((state) => state);
  const [mailSent, setMailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (loading) return;

    setTimeout(() => setInitializing(false), 300);
  }, [loading, setInitializing]);

  const saveAccountSettings = useCallback(() => {
    request('/set-me', {
      name,
      password: password || undefined
    }).then(({ response, error }) => {
      setPassword('');
    });
  }, [request, name, password]);

  const createAccount = useCallback(() => {
    setShowPassword(false);

    request('/sign-up', {
      email: email,
      password: password,
      redirect: window.location.href
    }).then(({ error }) => {
      if (error) return;

      setEmail('');

      setPassword('');

      setMailSent(true);
    });
  }, [request, email, password]);

  useEffect(() => {
    setName(user?.name || '');
  }, [user]);

  return (
    <div className="App">
      <header>
        <h1
          onClick={() => {
            history.push('/');
          }}
        >
          RemoteAuth
        </h1>
        <AuthButton />
      </header>
      <div className="hero">
        {!user && (
          <form
            onSubmit={createAccount}
            target="auth-frame"
            action="about:blank"
            method="post"
            className={`create-account${initializing ? ' initializing' : ''}`}
          >
            <a
              className="btn btn-light"
              href={`${process.env.REACT_APP_API_URL}/google-redirect?redirect=${encodeURIComponent(
                window.location.href.split('/').slice(0, 3).join('/')
              )}`}
              rel="noopener noreferrer"
            >
              <ReactSVG src="/google.svg" className="icon" />
              Sign in with Google
            </a>
            <small>or</small>
            {!initializing && (
              <div className="input-fields">
                <Form.Control
                  required
                  id="username"
                  name="username"
                  value={email}
                  type="text"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  placeholder="E-mail"
                />
                <Form.Control
                  required
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                />
                <OverlayTrigger
                  placement="bottom"
                  overlay={(props: any) => (
                    <Tooltip id="button-tooltip" {...props}>
                      {showPassword ? 'Hide password' : 'Show password'}
                    </Tooltip>
                  )}
                >
                  <div
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    className="show-password"
                  >
                    {showPassword ? (
                      <b>
                        <i className="fas fa-eye-slash" />
                      </b>
                    ) : (
                      <u>
                        <i className="fas fa-eye" />
                      </u>
                    )}
                  </div>
                </OverlayTrigger>
              </div>
            )}
            {!mailSent && (
              <Button block type="submit">
                {loading ? <Spinner animation="border" /> : 'Create your account'}
              </Button>
            )}
            {error && (
              <Badge variant="danger">
                {error.message === 'wrong-credentials'
                  ? 'E-mail or password is wrong'
                  : error.message}
              </Badge>
            )}
            {mailSent && <Badge variant="success">Mail has been sent</Badge>}
          </form>
        )}
        <h2>
          <a
            className="github-link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/LuukvE/Auth"
          >
            Open Source Account System
          </a>
        </h2>
      </div>
      <main>
        {!user && (
          <>
            <div>
              <h3>Introduction</h3>
              <p>
                RemoteAuth is account system software that can be remotely integrated with the other
                services your business provides. Instead of buying an authentication service, you
                can simply{' '}
                <a target="_blank" rel="noopener noreferrer" href="https://github.com/LuukvE/Auth">
                  install and use RemoteAuth for free
                </a>
                . This software is meant for software engineers that just want to keep building
                their other services, without losing control of user authentication and
                authorization.
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
                  Full ownership of your user accounts, all the data{' '}
                  <i>(including hashed passwords)</i> is yours
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
          <>
            <div className="account-settings">
              <h3>Account Settings</h3>
              <Form.Control
                placeholder="Name"
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <form
                method="post"
                action="about:blank"
                target="auth-frame"
                onSubmit={saveAccountSettings}
              >
                <Form.Control
                  placeholder="Email"
                  id="username"
                  name="username"
                  type="text"
                  onChange={() => {}}
                  value={user.email}
                />
                <Form.Control
                  id="password"
                  name="password"
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
            </div>
            <Groups />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
