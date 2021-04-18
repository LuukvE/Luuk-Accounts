import './App.scss';
import '@fortawesome/fontawesome-free/js/all';
import 'react-app-polyfill/ie11';
import React, { FC } from 'react';

import { useSelector } from '../store';

import AuthButton from './AuthButton';

const App: FC = () => {
  const user = useSelector((state) => state.user);

  return (
    <div className="App">
      <header>
        <h1>RemoteAuth</h1>
        <AuthButton />
      </header>
      <main>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </main>
    </div>
  );
};

export default App;
