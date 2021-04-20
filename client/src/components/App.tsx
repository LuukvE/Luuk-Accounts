import './App.scss';
import 'react-app-polyfill/ie11';
import '@fortawesome/fontawesome-free/js/all';
import React, { FC } from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';

import { useSelector } from '../store';

import Groups from './Groups';
import Landing from './Landing';
import Settings from './Settings';
import AuthButton from './AuthButton';

const App: FC = () => {
  const history = useHistory();
  const { user } = useSelector((state) => state);

  return (
    <div className="App">
      <header>
        <h1
          onClick={() => {
            history.push('/');
          }}
        >
          SignOn
        </h1>
        <AuthButton />
      </header>
      {user ? (
        <Switch>
          <Route path="/groups">
            <Groups />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
          <Route path="/">
            <Landing />
          </Route>
          <Redirect to="/" />
        </Switch>
      ) : (
        <Switch>
          <Route path="/">
            <Landing />
          </Route>
          <Redirect to="/" />
        </Switch>
      )}
    </div>
  );
};

export default App;
