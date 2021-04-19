import './AuthButton.scss';
import React, { FC, useEffect, useState, useLayoutEffect, useRef, useCallback } from 'react';
import { ReactSVG } from 'react-svg';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import useAuth from '../hooks/useAuth';
import { useSelector, useDispatch, actions } from '../store';

const AuthButton: FC = () => {
  const dispatch = useDispatch();
  const userAvatar = useRef<null | HTMLImageElement>(null);
  const userPicture = useRef<null | HTMLImageElement>(null);
  const preventAutoHide = useRef(false);
  const { request, loading } = useAuth();
  const { user, error } = useSelector((state) => state);
  const [mailSent, setMailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [initializing, setInitializing] = useState(false);
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

  useLayoutEffect(() => {
    if (!user?.picture) return;

    [userAvatar, userPicture].forEach((img) => {
      if (!img.current) return;

      img.current.referrerPolicy = 'no-referrer';

      img.current.src = user?.picture || '';
    });
  }, [user, userPicture]);

  useEffect(() => {
    request(`/auto-sign-in`).then(({ response, error }) => {
      setInitializing(false);
    });
  }, [request]);

  useEffect(() => {
    return () => setMailSent(false);
  }, [showSignInMenu]);

  const submit = useCallback(() => {
    setShowPassword(false);

    if (forgotPassword) {
      request('/forgot-password', {
        email,
        redirect: window.location.href
      }).then(({ error }) => {
        if (error) return console.log(error);

        setMailSent(true);
      });
      return;
    }

    request('/sign-in', {
      email,
      password
    }).then(({ response }) => {
      if (!response) return;

      setShowSignInMenu(false);

      setPassword('');

      setEmail('');
    });
  }, [request, forgotPassword, email, password]);

  return (
    <div className="AuthButton">
      {!initializing && !user && (
        <Button
          onClick={() => {
            preventAutoHide.current = true;

            setForgotPassword(false);

            setShowSignInMenu(!showSignInMenu);
          }}
          variant="light"
        >
          Sign in
        </Button>
      )}
      {!initializing && user && (
        <Button
          className="account-btn"
          onClick={() => {
            preventAutoHide.current = true;

            setShowSignOutMenu(!showSignOutMenu);
          }}
        >
          <span>
            {user.picture && <img ref={userAvatar} alt="" />}
            {(user.name || user.email) &&
              (user.name || user.email).trim().substring(0, 1).toUpperCase()}
          </span>
        </Button>
      )}
      {!initializing && user && (
        <div
          onClick={() => {
            preventAutoHide.current = true;
          }}
          className={`auth-menu${showSignOutMenu ? ' active' : ''}`}
        >
          {user.picture && <img ref={userPicture} alt="" />}
          <h4>{user.name || user.email}</h4>
          {user.name && <span>{user.email}</span>}
          <Button
            onClick={() => {
              request('/sign-out').then(() => {
                setShowSignOutMenu(false);
              });
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
            method="post"
            target="auth-frame"
            action="about:blank"
            autoComplete="on"
            onSubmit={submit}
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
            <div className="input-fields">
              <Form.Control
                required
                id="username"
                name="username"
                className={forgotPassword ? 'forgotten-email' : ''}
                value={email}
                type="text"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder="E-mail"
              />
              {!forgotPassword && (
                <>
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
                </>
              )}
            </div>
            {!mailSent && (
              <Button block type="submit">
                {loading ? (
                  <Spinner animation="border" />
                ) : forgotPassword ? (
                  <span>
                    Mail sign-in link <i className="fas fa-paper-plane" />
                  </span>
                ) : (
                  'Sign in'
                )}
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
            <small
              className="btn-forgot-password"
              onClick={() => {
                setMailSent(false);

                dispatch(
                  actions.set({
                    error: null
                  })
                );

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
