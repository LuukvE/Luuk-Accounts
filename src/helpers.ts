import { User, Group } from './types';
import { findGroups } from './database';

export const getAllGroups = async () => {
  const groups = await findGroups();

  return groups.reduce((groups: { [slug: string]: Group }, group: Group) => {
    groups[group.slug] = group;

    return groups;
  }, {});
};

export const getPermissions = async (user: User, groups: { [slug: string]: Group }) => {
  const reducer = (permissions: string[], slug: string): string[] => {
    const group = groups[slug];

    group.permissions.forEach((permission) => {
      if (!permissions.includes(permission)) permissions.push(permission);
    });

    const children = Object.values(groups).reduce((children: string[], child: Group) => {
      if (child.parent === group.slug) children.push(child.slug);

      return children;
    }, []);

    return children.reduce(reducer, permissions);
  };

  return user.groups.reduce(reducer, []);
};

// Find all groups that have an owner permission that is part of thisUser permissions and their children (ownedGroups)
export const getOwnedGroups = async (user: User): Promise<Group[]> => {
  const groups = await getAllGroups();

  const permissions = await getPermissions(user, groups);

  const reducer = (ownedGroups: string[], slug: string): string[] => {
    const group = groups[slug];

    if (!ownedGroups.includes(slug)) ownedGroups.push(slug);

    const children = Object.values(groups).reduce((children: string[], child: Group) => {
      if (child.parent === group.slug) children.push(child.slug);

      return children;
    }, []);

    return children.reduce(reducer, ownedGroups);
  };

  return Object.values(groups)
    .filter((group) => permissions.includes(group.owner))
    .map((group) => group.slug)
    .reduce(reducer, [])
    .map((slug) => groups[slug]);
};
