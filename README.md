# Auth

A complete authentication and user management solution.

## Functionality

- [x] Users can sign up and sign in manually or with Google
- [x] Users can manage other users, through groups and permissions
- [x] The system can send email verification and forgot password emails

## APIs

- **Google Cloud Functions:** Hosts the TypeScript API
- **Google Cloud FireStore:** Hosts the database
- **Sendgrid:** Enables automated e-mails

## Considerations

- Passwords are hashed before saved
- Email addresses are case-insensitive
- Cookies are protected against forgery using a signature cookie
- Requests from an allowed origin return CORS headers with that origin

## Database

```typescript
type User = {
  email: string;
  google?: string;
  password: string;
  groups: string[];
  name: string;
  picture: string;
  created: Date;
};

// Groups form a hierarchy in two ways:
// - Groups share their permissions with all their parents
// - Users that have the "owner" permission of another group (ownedGroup) can:
//   - View all ownedGroups and their children
//   - Create new users as long as they do not exist
//   - Add or remove ownedGroups or their children from all users
//   - Send welcome or forgot-password emails to users in their ownedGroups or their children
// This means the most powerful group is at the top of the tree, least powerful is at the bottom

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
  slug: string; // verify-email, forgot-password, welcome
  subject: string;
  html: string;
  text: string;
};

type Configuration = {
  slug: string; // private-key, public-key, session-max-age, minimum-password-length, allowed-origin
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
    permissions: string[];
    parent: string | null; // group slug
    name: string;
    description: string;
    created: Date;
  }[];
  // All users part of ownedGroups and their children
  users: {
    name: string;
    email: string;
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
  sendEmail?: string;
  password?: string | null;
};
```
