export type User = {
  id: string;
  email: string;
  password: string;
  google?: number;
  groups: string[];
  name: string;
  picture: string;
  created: Date;
};

// Groups form a hierarchy in two ways:
// - Groups share their permissions with all their parents
// - Users that are part of a group with the "owner" permission of another group (ownedGroup) can:
//   - View all ownedGroups and their children
//   - Create new users as long as they do not exist
//   - Add or remove ownedGroups or their children from all users
//   - Send welcome or forgot-password emails to users in their ownedGroups or their children
// This means the most powerful group is at the top of the tree, least powerful is at the bottom

export type Group = {
  slug: string;
  permissions: string[];
  owner: string; // permission slug
  parent?: string; // group slug
  name: string;
  description: string;
  created: Date;
};

// All objects below are exclusively managed and visible to users with permission: root-admin

export type Session = {
  id: string;
  user: string;
  expired?: Date;
  created: Date;
};

// Links are used to directly sign up and sign in a user
export type Link = {
  id: string;
  name: string;
  email: string;
  password?: string;
  redirect: string;
  expired?: Date;
  created: Date;
};

export type Log = {
  id: string;
  user?: string;
  group?: string;
  session?: string;
  link?: string;
  type: string; // system-error, user-error, user-created, user-updated, session-created, user-signed-in, email-sent
  action: string;
  detail: string;
  created: Date;
};

// These are all the permissions that can be assigned to groups
export type Permission = {
  slug: string;
  description: string;
};

// These are email templates
export type Email = {
  slug: string; // verify-email, forgot-password, welcome
  subject: string;
  html: string;
  text: string;
};

export type Configuration = {
  slug: string; // private-key, public-key, session-max-age, minimum-password-length, allowed-origin
  value: string;
};

export type KeyResponse = {
  type: 'key',
  key: string;
};

export type ErrorResponse = {
  type: 'error';
  status: number;
  message: string;
};

export type RedirectResponse = {
  type: 'redirect';
  location: string;
};

export type SignInResponse = {
  type: 'sign-in',
  id: string;
  token: string;
  permissions: string[];
  session: string;
  email: string;
  name: string;
  picture: string;
  password: boolean;
  google: boolean;
};

export type LoadResponse = {
  type: 'load',
  // All ownedGroups and their children
  groups: {
    slug: string;
    permissions: string[];
    parent?: string; // group slug
    name: string;
    description: string;
    created: Date;
  }[];
  // All users part of ownedGroups and their children
  users: {
    id: string;
    name: string;
    email: string;
    password: boolean;
    google: boolean;
    picture: string;
    groups: string[];
  }[];
  // All properties below are only loaded with root-admin permission
  permissions?: Permission[];
  sessions?: Session[];
  links?: Link[];
  logs?: Log[];
  emails?: Email[];
  configurations?: Configuration[];
};
