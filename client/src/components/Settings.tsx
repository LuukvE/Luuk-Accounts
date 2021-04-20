import './Settings.scss';
import React, { FC, useCallback, useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import useAuth from '../hooks/useAuth';
import { useSelector } from '../store';

const Settings: FC = () => {
  const [name, setName] = useState('');
  const { request, loading } = useAuth();
  const [password, setPassword] = useState('');
  const { user } = useSelector((state) => state);

  const saveAccountSettings = useCallback(() => {
    request('/set-me', {
      name,
      password: password || undefined
    }).then(({ response, error }) => {
      setPassword('');
    });
  }, [request, name, password]);

  useEffect(() => {
    setName(!user ? '' : user?.name || '');
  }, [user]);

  if (!user) return null;

  return (
    <main className="Settings">
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
      <form method="post" action="about:blank" target="auth-frame" onSubmit={saveAccountSettings}>
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
    </main>
  );
};

export default Settings;
