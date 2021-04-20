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

## Database

```typescript
type User = {
  email: string;
  name: string;
  groups: string[];
  password: string | null;
  google: string | null;
  picture: string | null;
  created: Date;
};

// Groups form a hierarchy in two ways:
// - Groups share their permissions with all their parents
// - Users that have the "owner" permission of another group (ownedGroup) can:
//   - View all ownedGroups and their children
//   - Create new users as long as they do not exist
//   - Add or remove ownedGroups or their children from all users
//   - Send welcome emails to users in their ownedGroups or their children

// The most powerful groups are at the top of the hiarchy, the least powerful are at the bottom

type Group = {
  slug: string;
  name: string;
  owner: string; // permission slug
  parent: string | null; // group slug
  permissions: string[];
  description: string;
  created: Date;
};

type Session = {
  id: string;
  user: string;
  expired: Date | null;
  created: Date;
};

// Links are used to directly sign up and sign in a user
type Link = {
  id: string;
  name: string;
  email: string;
  password: string | null;
  redirect: string;
  expired: Date | null;
  created: Date;
};

type Log = {
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

// These are email templates
type Email = {
  slug: string; // sign-up, forgot-password, welcome
  subject: string;
  html: string;
  text: string;
};

type Configuration = {
  slug: string; // private-key, public-key, allowed-origins, cookie-signature-keys
  value: string;
};
```

## Response Types

```typescript
type KeyResponse = {
  type: 'key';
  key: string;
};

type ErrorResponse = {
  type: 'error';
  status: number;
  message: string;
};

type RedirectResponse = {
  type: 'redirect';
  location: string;
};

type SignInResponse = {
  type: 'sign-in';
  name: string;
  token: string;
  email: string;
  picture: string;
  google: boolean;
  password: boolean;
  permissions: string[];
};

type LoadResponse = {
  type: 'load';
  // All ownedGroups and their children
  groups: {
    slug: string;
    parent: string | null; // group slug
    name: string;
    description: string;
    created: Date;
  }[];
  // All users part of ownedGroups and their children
  users: {
    email: string;
    name: string;
    password: boolean;
    google: boolean;
    picture: string;
    groups: string[];
  }[];
};
```

## Request Body

```typescript
type RequestBody = null | {
  name?: string;
  email?: string;
  groups?: string[];
  redirect?: string;
  password?: string;
  sendEmail?: string;
};
```
