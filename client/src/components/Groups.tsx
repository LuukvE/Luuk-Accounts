import './Groups.scss';
import React, { FC, KeyboardEvent, useCallback } from 'react';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import useAuth from '../hooks/useAuth';
import { useSelector, useDispatch, actions } from '../store';

const Groups: FC = () => {
  const dispatch = useDispatch();
  const { request, loading } = useAuth();
  const { user, groups } = useSelector((state) => state);

  const save = useCallback(() => {
    request('/set-groups', {
      setGroups: groups
    });
  }, [groups, request]);

  if (!user || !user.groups.includes('admins')) return null;

  return (
    <main className="Groups">
      <div className="table-wrapper">
        <Table size="sm">
          <thead>
            <tr>
              <th>Slug</th>
              <th>Name</th>
              <th>Parent</th>
              <th>Owner</th>
              <th>Permissions</th>
              <th>
                <Button
                  onClick={() => {
                    dispatch(
                      actions.updateGroup({
                        index: groups.length,
                        slug: '',
                        name: '',
                        parent: '',
                        owner: '',
                        status: 'new',
                        permissions: []
                      })
                    );
                  }}
                  variant="success"
                  size="sm"
                >
                  <i className="fas fa-plus" />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, index) => {
              if (group.status === 'deleted') return null;

              return (
                <tr key={index}>
                  <td className="slug">
                    <Form.Control
                      as="textarea"
                      value={group.slug}
                      readOnly={group.status !== 'new'}
                      onChange={(e) => {
                        dispatch(
                          actions.updateGroup({
                            index,
                            slug: e.target.value.replace(/[\n\s]/g, '')
                          })
                        );
                      }}
                    />
                  </td>
                  <td className="name">
                    <Form.Control
                      as="textarea"
                      value={group.name}
                      onChange={(e) => {
                        dispatch(
                          actions.updateGroup({
                            index,
                            name: e.target.value.replace(/\n/g, '')
                          })
                        );
                      }}
                    />
                  </td>
                  <td className="parent">
                    <Form.Control
                      as="textarea"
                      value={group.parent || ''}
                      onChange={(e) => {
                        dispatch(
                          actions.updateGroup({
                            index,
                            parent: e.target.value.replace(/[\n\s]/g, '')
                          })
                        );
                      }}
                    />
                  </td>
                  <td className="owner">
                    <Form.Control
                      as="textarea"
                      value={group.owner || ''}
                      onChange={(e) => {
                        dispatch(
                          actions.updateGroup({
                            index,
                            owner: e.target.value.replace(/[\n\s]/g, '')
                          })
                        );
                      }}
                    />
                  </td>
                  <td className="permissions">
                    <Form.Control
                      as="textarea"
                      rows={group.permissions.length || 1}
                      value={group.permissions.join(',\n')}
                      onKeyDown={(e: KeyboardEvent) => {
                        if (e.which !== 13) return e;

                        dispatch(
                          actions.updateGroup({
                            index,
                            permissions: [...group.permissions, '']
                          })
                        );
                      }}
                      onChange={(e) => {
                        dispatch(
                          actions.updateGroup({
                            index,
                            permissions: e.target.value.replace(/[\n\s]/g, '').split(',')
                          })
                        );
                      }}
                    />
                  </td>
                  <td className="action">
                    <Button
                      onClick={() => {
                        dispatch(
                          actions.updateGroup({
                            index,
                            status: 'deleted'
                          })
                        );
                      }}
                      variant="danger"
                      size="sm"
                    >
                      <i className="fas fa-trash" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <Button
        block
        onClick={save}
        disabled={!groups.find((group) => ['deleted', 'changed', 'new'].includes(group.status))}
      >
        {loading ? <Spinner animation="border" /> : 'Save groups'}
      </Button>
    </main>
  );
};

export default Groups;
