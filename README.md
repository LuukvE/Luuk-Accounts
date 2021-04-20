# Auth

A complete authentication and user management solution.

## Functionality

- [x] Sign in with Google or with an email and password
- [x] Authorize your users by giving permissions to nested groups
- [x] Authenticate your users on your other APIs using JWT tokens
- [x] Allow specific groups to manage other users through a user interface

## Services

- **Sendgrid:** sends create account and forgot password e-mails
- **Google Cloud Firestore:** stores accounts and software configuration

## Considerations

- Passwords are hashed before saved
- Email addresses are case-insensitive
- Cookies are protected against forgery using a signature cookie
- Requests from an allowed origin return CORS headers with that origin
- Groups can _(optionally)_ be nested in other groups, forming a hiarchy
- Users get the permissions attached to the groups they are in and the groups nested inside of them
- The group owner property refers to a permission required to add or remove users from that group
- Links are used to sign up and sign in a user when they follow the link from their e-mail client

## Types

```typescript
// Database Objects

export type User = {
  email: string;
  name: string;
  groups: string[];
  password: string | null;
  google: string | null;
  picture: string | null;
  created: Date;
};

export type Group = {
  slug: string;
  permissions: string[];
  owner: string;
  parent: string | null;
  name: string;
  description: string;
  created: Date;
};

export type Session = {
  id: string;
  user: string;
  expired: Date | null;
  created: Date;
};

export type Link = {
  id: string;
  name: string;
  email: string;
  password: string | null;
  redirect: string;
  expired: Date | null;
  created: Date;
};

export type Log = {
  id: string;
  user: string | null;
  group: string | null;
  session: string | null;
  link: string | null;
  type: string;
  action: string;
  detail: string;
  created: Date;
};

export type Permission = {
  slug: string;
  description: string;
};

export type Email = {
  slug: string;
  subject: string;
  html: string;
  text: string;
};

export type Configuration = {
  slug: string;
  value: string;
};

// Response Objects

export type KeyResponse = {
  type: 'key';
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
  type: 'sign-in';
  token?: string;
  permissions: string[];
  email: string;
  name: string;
  picture: string;
  password: boolean;
  google: boolean;
};

export type LoadResponse = {
  type: 'load';
  ownedGroups: {
    slug: string;
    parent: string | null;
    name: string;
    description: string;
    created: Date;
  }[];
  users: {
    email: string;
    name: string;
    password: boolean;
    google: boolean;
    picture: string;
    groups: string[];
  }[];
};

// Request Body
export type RequestBody = null | {
  name?: string;
  email?: string;
  groups?: string[];
  redirect?: string;
  password?: string;
  sendEmail?: string;
};
```
