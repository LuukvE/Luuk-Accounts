import './AuthButton.scss';
import React, { FC, useEffect, useState, useLayoutEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { ReactSVG } from 'react-svg';

import useAuth from '../hooks/useAuth';
import { useSelector } from '../store';

const AuthButton: FC = () => {
  const { request, loading } = useAuth();
  const preventAutoHide = useRef(false);
  const user = useSelector((state) => state.user);
  const [showMenu, setShowMenu] = useState(false);

  useLayoutEffect(() => {
    const listener = () => {
      setTimeout(() => {
        if (!preventAutoHide.current) setShowMenu(false);

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
        <a
          className="btn btn-light"
          href={`${process.env.REACT_APP_API_URL}/google-redirect?redirect=${encodeURIComponent(
            window.location.href.split('/').slice(0, 3).join('/')
          )}`}
          rel="noopener noreferrer"
        >
          <ReactSVG src="/google.svg" className="icon" />
          Sign In
        </a>
      )}

      {user && (
        <Button
          className="account-btn"
          onClick={() => {
            preventAutoHide.current = true;

            setShowMenu(!showMenu);
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
        <div className={`auth-menu${showMenu ? ' active' : ''}`}>
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
    </div>
  );
};

export default AuthButton;
