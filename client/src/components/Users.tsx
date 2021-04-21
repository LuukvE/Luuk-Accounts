import './Users.scss';
import React, { FC, useCallback, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Select from 'react-select/creatable';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import { useSelector } from '../store';
import useAuth from '../hooks/useAuth';
import useQuery from '../hooks/useQuery';
import { Hiarchy, OwnedGroup } from '../types';

const GroupBlock: FC<{ index: number; hiarchy: Hiarchy }> = ({ index, hiarchy }) => {
  const history = useHistory();
  const { group, children, users } = hiarchy[index];

  return (
    <div className="owned-group">
      <h3>
        {group.name}
        <Button
          onClick={() => {
            history.push(`/users/user/new?group=${group.slug}`);
          }}
          size="sm"
        >
          <i className="fas fa-plus" /> Add User
        </Button>
      </h3>
      {users.map((user, index) => (
        <div className="user" key={index}>
          <Button
            onClick={() => {
              history.push(`/users/user/${user.email}`);
            }}
            size="sm"
            variant="link"
          >
            <i className="fas fa-wrench" />
          </Button>
          {user.name && <span>{user.name}</span>} <Badge variant="secondary">{user.email}</Badge>
        </div>
      ))}
      <div className="children">
        {children.map((child, index) => (
          <GroupBlock index={index} key={index} hiarchy={children} />
        ))}
      </div>
    </div>
  );
};

const Users: FC = () => {
  const history = useHistory();
  const { request, loading } = useAuth();
  const { query, setQuery } = useQuery();
  const { ownedGroups, users, requests } = useSelector((state) => state);
  const { user } = useParams<{ user?: string; group?: string }>();

  const addUser = useCallback(() => {
    const { email, name, group, sendEmail } = query;

    if (!email || !group) return;

    const update = users.find((u) => u.email === email);

    const groups = update?.groups.slice() || [];

    groups.push(group);

    request('/set-user', {
      email: update?.email || email,
      name: update?.name || name,
      groups: groups,
      sendEmail: sendEmail || '',
      redirect: window.location.href.split('/').slice(0, 3).join('/')
    }).then(({ error }) => {
      if (!error) history.push('/users');
    });
  }, [history, query, users, request]);

  const removeGroup = useCallback(
    (group: string) => {
      const update = users.find((u) => u.email === user);

      if (!update) return;

      const groups = update.groups.filter((g) => g !== group);

      request('/set-user', {
        email: update.email,
        name: update.name,
        groups,
        sendEmail: '',
        redirect: window.location.href.split('/').slice(0, 3).join('/')
      }).then(() => {
        if (!groups.length) history.push('/users');
      });
    },
    [history, users, user, request]
  );

  const hiarchy: Hiarchy = useMemo(() => {
    const groups = ownedGroups.reduce((obj: { [slug: string]: OwnedGroup }, ownedGroup) => {
      obj[ownedGroup.slug] = ownedGroup;

      return obj;
    }, {});

    const root = ownedGroups.filter((ownedGroup) => {
      return !ownedGroup.parent || !groups[ownedGroup.parent];
    });

    const getHiarchy = (hiarchy: Hiarchy, parents: OwnedGroup[]) => {
      return parents.reduce((hiarchy: Hiarchy, group) => {
        const children = ownedGroups.filter((child) => {
          return child.parent === group.slug;
        });

        hiarchy.push({
          group,
          users: users.filter((user) => user.groups.includes(group.slug)),
          children: getHiarchy([], children)
        });

        return hiarchy;
      }, hiarchy);
    };

    const hiarchy = getHiarchy([], root);

    return hiarchy;
  }, [users, ownedGroups]);

  return (
    <div className={`Users${hiarchy.length ? ' has-content' : ''}`}>
      {hiarchy.length === 0 && requests === 0 && (
        <h3>Your account has no access to any user groups</h3>
      )}
      {hiarchy.map((child, index) => (
        <GroupBlock index={index} key={index} hiarchy={hiarchy} />
      ))}
      <Modal
        className="modal edit-user-modal"
        show={!!user}
        onHide={() => {
          history.push('/users');
        }}
      >
        <Modal.Header closeButton>{user === 'new' ? 'Add User' : `Edit ${user}`}</Modal.Header>
        <Modal.Body>
          {user !== 'new' &&
            users
              .find((u) => u.email === user)
              ?.groups.map((slug, index) => {
                const group = ownedGroups.find((ownedGroup) => ownedGroup.slug === slug);

                if (!group) return null;

                return (
                  <div key={index}>
                    {group.name}{' '}
                    <Button
                      onClick={() => {
                        removeGroup(group.slug);
                      }}
                      variant="danger"
                      size="sm"
                    >
                      {loading ? <Spinner animation="border" /> : 'Remove'}
                    </Button>
                  </div>
                );
              })}
          {user === 'new' && (
            <form method="post" action="about:blank" target="auth-frame" onSubmit={addUser}>
              <Select
                value={
                  query.email
                    ? {
                        value: {
                          email: query.email,
                          name: query.setName || ''
                        },
                        label: `${query.setName ? `${query.setName}: ` : ''}${query.email}`
                      }
                    : null
                }
                onCreateOption={(email) => {
                  setQuery({ email, setName: '' });
                }}
                formatCreateLabel={(input) => `Add E-mail: ${input}`}
                onChange={(option) => {
                  setQuery({
                    setName: option?.value.name || '',
                    email: option?.value.email
                  });
                }}
                placeholder={<span className="email-placeholder">E-mail</span>}
                options={users
                  .filter((user) => !user.groups.includes(query.group))
                  .map((user) => ({
                    label: `${user.name ? `${user.name}: ` : ''}${user.email}`,
                    value: { email: user.email, name: user.name || '' }
                  }))}
              />
              {!query.setName && (
                <Form.Control
                  placeholder="Name (optional)"
                  type="text"
                  value={query.name || ''}
                  onChange={(e) => setQuery({ name: e.target.value })}
                />
              )}
              <Form.Group controlId="sendWelcome">
                <Form.Check
                  checked={query.sendEmail === 'welcome'}
                  onChange={(e) => {
                    setQuery({ sendEmail: e.target.checked ? 'welcome' : '' });
                  }}
                  type="checkbox"
                  label="Send welcome mail"
                />
              </Form.Group>
              <Button block type="submit" variant="success">
                {loading ? <Spinner animation="border" /> : 'Add user'}
              </Button>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Users;
