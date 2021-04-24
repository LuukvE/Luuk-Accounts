import './Landing.scss';
import React, { FC, useState, useCallback } from 'react';
import { ReactSVG } from 'react-svg';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import { useSelector } from '../store';
import useAuth from '../hooks/useAuth';

const Landing: FC = () => {
  const { request, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, error } = useSelector((state) => state);
  const [mailSent, setMailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <>
      <div className="hero">
        {user === false && (
          <form
            onSubmit={createAccount}
            target="auth-frame"
            action="about:blank"
            method="post"
            className="create-account"
          >
            <a
              className="btn btn-light"
              href={`${
                process.env.REACT_APP_API_URL
              }/api/google-redirect?redirect=${encodeURIComponent(
                `${window.location.href.split('/').slice(0, 3).join('/')}/users`
              )}`}
              rel="noopener noreferrer"
            >
              <ReactSVG src="/google.svg" className="icon" />
              Sign in with Google
            </a>
            <small>or</small>
            {
              <div className="input-fields">
                <Form.Control
                  required
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
            }
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
            href="https://github.com/LuukvE/Luuk-Accounts"
          >
            Open Source Account System
          </a>
        </h2>
      </div>
      <main className="Landing">
        <div className="introduction">
          <h3>Introduction</h3>
          <p>
            Luuk Accounts is an open source account system written in TypeScript. It is meant for
            developers that want to focus on building their other services, without losing control
            of user authentication and authorization. You can download this software directly from{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/LuukvE/Luuk-Accounts"
            >
              Github
            </a>
            . It can be easily integrated with the APIs that power your business.
          </p>
          <h3>Functionality</h3>
          <ul>
            <li>Sign in with Google or with an email and password</li>
            <li>Authorize your users by giving permissions to nested groups</li>
            <li>Authenticate your users on your other APIs using JWT tokens</li>
            <li>Allow specific groups to manage other users through a user interface</li>
          </ul>
        </div>
        <div className="youtube">
          <iframe
            src="https://www.youtube.com/embed/-va7Lpnu4EM"
            title="Youtube"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div>
          <h3>Benefits</h3>
          <ul>
            <li>Complete freedom in designing the interface you want your users to experience</li>
            <li>
              Absolute flexibility in delivering features and solving bugs, you have all the{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/LuukvE/Luuk-Accounts"
              >
                source code
              </a>
            </li>
            <li>
              Full ownership of your user accounts, all the data <i>(including hashed passwords)</i>{' '}
              is yours
            </li>
          </ul>
        </div>
        <div>
          <h3>Services</h3>
          <ul>
            <li>
              <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer">
                <b>Sendgrid</b>
              </a>{' '}
              sends create account and forgot password e-mails
            </li>
            <li>
              <a
                href="https://cloud.google.com/firestore"
                target="_blank"
                rel="noopener noreferrer"
              >
                <b>Google Cloud Firestore</b>
              </a>{' '}
              stores accounts and software configuration
            </li>
          </ul>
        </div>
      </main>
    </>
  );
};

export default Landing;
