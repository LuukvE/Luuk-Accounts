import './AuthButton.scss';
import React, { FC, useEffect, useState, useLayoutEffect, useRef } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { ReactSVG } from 'react-svg';

import useAuth from '../hooks/useAuth';
import { useSelector } from '../store';

const AuthButton: FC = () => {
  const { request, loading } = useAuth();
  const preventAutoHide = useRef(false);
  const user = useSelector((state) => state.user);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showSignInMenu, setShowSignInMenu] = useState(false);
  const [showSignOutMenu, setShowSignOutMenu] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useLayoutEffect(() => {
    const listener = () => {
      setTimeout(() => {
        if (!preventAutoHide.current) {
          setShowSignInMenu(false);
          setShowSignOutMenu(false);
        }

        preventAutoHide.current = false;
      }, 0);
    };

    document.documentElement.addEventListener('click', listener);

    return () => {
      document.documentElement.removeEventListener('click', listener);
    };
  }, []);

  useEffect(() => {
    request('/auto-sign-in').then(({ response, error }) => {
      console.log(response, error);
    });
  }, [request]);

  return (
    <div className="AuthButton">
      {!loading && !user && (
        <Button
          onClick={() => {
            preventAutoHide.current = true;

            setShowSignInMenu(!showSignInMenu);
          }}
          variant="light"
        >
          Sign in
        </Button>
      )}

      {user && (
        <Button
          className="account-btn"
          onClick={() => {
            preventAutoHide.current = true;

            setShowSignOutMenu(!showSignOutMenu);
          }}
        >
          <span>
            {loading && <Spinner animation="border" />}
            {!loading && user.picture && <img src={user.picture} alt="" />}
            {!loading && (user.name || user.email).trim().substring(0, 1).toUpperCase()}
          </span>
        </Button>
      )}
      {user && (
        <div
          onClick={() => {
            preventAutoHide.current = true;
          }}
          className={`auth-menu${showSignOutMenu ? ' active' : ''}`}
        >
          {user.picture && <img src={user.picture} alt="" />}
          <h4>{user.name || user.email}</h4>
          {user.name && <span>{user.email}</span>}
          <Button
            onClick={() => {
              request('/sign-out');
            }}
            variant="light"
          >
            Sign out
          </Button>
        </div>
      )}
      {!user && (
        <div
          onClick={() => {
            preventAutoHide.current = true;
          }}
          className={`auth-menu${showSignInMenu ? ' active' : ''}`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
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
            <Form.Control
              required
              className={forgotPassword ? 'forgotten-email' : ''}
              value={email}
              type="email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="E-mail"
            />
            {!forgotPassword && (
              <Form.Control
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type="password"
                placeholder="Password"
              />
            )}
            <Button block type="submit">
              {forgotPassword ? (
                <span>
                  Mail sign-in link <i className="fas fa-paper-plane" />
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
            <small
              className="btn-forgot-password"
              onClick={() => {
                setForgotPassword(!forgotPassword);
              }}
            >
              {forgotPassword ? 'Remember password?' : 'Forgot password?'}
            </small>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuthButton;
