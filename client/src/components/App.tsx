import './App.scss';
import 'react-app-polyfill/ie11';
import '@fortawesome/fontawesome-free/js/all';
import React, { FC, useEffect } from 'react';
import { Switch, Route, Redirect, NavLink, useHistory } from 'react-router-dom';

import { useSelector } from '../store';
import useAuth from '../hooks/useAuth';

import Users from './Users';
import Landing from './Landing';
import Settings from './Settings';
import AuthButton from './AuthButton';

const App: FC = () => {
  const history = useHistory();
  const { request } = useAuth();
  const { user } = useSelector((state) => state);

  useEffect(() => {
    if (!user) return;

    request('/load');
  }, [request, user]);

  return (
    <div className="App">
      <header>
        <h1
          onClick={() => {
            history.push('/');
          }}
        >
          Luuk Accounts
        </h1>
        {user && (
          <>
            <NavLink exact to="/">
              Introduction
            </NavLink>
            <NavLink to="/users">Users</NavLink>
          </>
        )}
        <AuthButton />
      </header>
      {user && (
        <Switch>
          <Route path={['/users/group/:group', '/users/user/:user', '/users']}>
            <Users />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
          <Route path="/">
            <Landing />
          </Route>
          <Redirect to="/" />
        </Switch>
      )}
      {user === false && (
        <Switch>
          <Route path="/">
            <Landing />
          </Route>
          <Redirect to="/" />
        </Switch>
      )}
      <iframe title="auth-frame" name="auth-frame" id="auth-frame" />
    </div>
  );
};

export default App;
