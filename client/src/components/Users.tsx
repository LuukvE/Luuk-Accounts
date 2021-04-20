import './Users.scss';
import React, { FC, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Modal from 'react-bootstrap/Modal';

import { useSelector } from '../store';
import useQuery from '../hooks/useQuery';
import { Hiarchy, OwnedGroup } from '../types';

const GroupBlock: FC<{ index: number; hiarchy: Hiarchy }> = ({ index, hiarchy }) => {
  const history = useHistory();
  const { group, children, users } = hiarchy[index];

  return (
    <div className="owned-group">
      <h3>
        <Button
          onClick={() => {
            history.push(`/users/group/${group.slug}`);
          }}
          size="sm"
          variant="link"
        >
          <i className="fas fa-cog" />
        </Button>
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
  // const dispatch = useDispatch();
  const history = useHistory();
  const { query, setQuery } = useQuery();
  const { ownedGroups, users } = useSelector((state) => state);
  const { user, group } = useParams<{ user?: string; group?: string }>();

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

    console.log(hiarchy);

    return hiarchy;
  }, [users, ownedGroups]);

  return (
    <div className="Users">
      {hiarchy.map((child, index) => (
        <GroupBlock index={index} key={index} hiarchy={hiarchy} />
      ))}
      <Modal
        className="modal"
        show={!!user}
        onHide={() => {
          history.push('/users');
        }}
      >
        <Modal.Header closeButton>{user === 'new' ? 'Add' : 'Edit'} User</Modal.Header>
        <Modal.Body>A user</Modal.Body>
      </Modal>
      <Modal
        className="modal"
        show={!!group}
        onHide={() => {
          history.push('/users');
        }}
      >
        <Modal.Header closeButton>{group === 'new' ? 'Add' : 'Edit'} Group</Modal.Header>
        <Modal.Body>A group</Modal.Body>
      </Modal>
    </div>
  );
};

export default Users;
