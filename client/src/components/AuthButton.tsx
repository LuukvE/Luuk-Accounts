import './AuthButton.scss';
import React, {
  FC,
  useEffect,
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
  FormEvent
} from 'react';
import { ReactSVG } from 'react-svg';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import useAuth from '../hooks/useAuth';
import { useSelector, useDispatch, actions } from '../store';

const AuthButton: FC = () => {
  const dispatch = useDispatch();
  const preventAutoHide = useRef(false);
  const { request, loading } = useAuth();
  const { user, error } = useSelector((state) => state);
  const [mailSent, setMailSent] = useState(false);
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

  useEffect(() => {
    request('/auto-sign-in').then(({ response, error }) => {
      setInitializing(false);
    });
  }, [request]);

  useEffect(() => {
    return () => setMailSent(false);
  }, [showSignInMenu]);

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

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
    },
    [request, forgotPassword, email, password]
  );

  return (
    <div className="AuthButton">
      {!initializing && !user && (
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
            {initializing && <Spinner animation="border" />}
            {!initializing && user.picture && <img src={user.picture} alt="" />}
            {!initializing &&
              (user.name || user.email) &&
              (user.name || user.email).trim().substring(0, 1).toUpperCase()}
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
          <form onSubmit={submit}>
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
