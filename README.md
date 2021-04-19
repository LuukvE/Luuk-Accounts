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

## Database

```typescript
type User = {
  id: string;
  email: string;
  password: string;
  google?: string;
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

type Group = {
  slug: string;
  permissions: string[];
  owner: string; // permission slug
  parent: string | null; // group slug
  name: string;
  description: string;
  created: Date;
};

// All objects below are exclusively managed and visible to users with permission: root-admin

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

// These are all the permissions that can be assigned to groups
type Permission = {
  slug: string;
  description: string;
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
  id: string;
  token: string;
  permissions: string[];
  email: string;
  name: string;
  picture: string;
  password: boolean;
  google: boolean;
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
```

## Request Body

```typescript
export type RequestBody = null | {
  email?: string;
  password: string | null;
  redirect?: string;
  name?: string;
  id?: string;
  sendEmail?: string;
  groups?: string[];
  collection?: string;
  object?: User | Group | Session | Permission | Link | Log | Email | Configuration;
  remove?: boolean;
};
```

## Considerations

- All redirects use status 302 Found
- Passwords are hashed before saved
- Email addresses are case-insensitive
- All POST requests and responses are Content-Type JSON
- Cookies are protected against forgery using a signature cookie
- Requests from an allowed origin return CORS headers with that origin
- Function arguments can come from a cookie, the request body or the request parameters

## Public Endpoints

No cookie required to send requests

```typescript
// GET /public-key
const publicKey = (): KeyResponse => {
  // Return public key used to decrypt JWT tokens
};

// GET /google-redirect
const googleRedirect = (redirect: string): RedirectResponse => {
  // Redirect to a Google Signin page
};

// GET /sign-in-link?id=<id>
const signInLink = (id: string): RedirectResponse => {
  // Find the non-expired link, if not found redirect to link expired page
  // Find thisUser, if not found create it
  // Create session and set cookie
  // Update the link to expired: now()
  // Redirect to link redirect property
};

// GET /google-sign-in
const googleSignIn = (code: string, redirect: string): RedirectResponse => {
  // Request an access and id tokens from Google using the code
  // Request thisUser information from Google using the tokens
  // If either of these requests failed redirect with error in parameter
  // If thisUser does not exist, create thisUser
  // Update thisUser account with Google id, email, name and picture
  // Create a session and set a cookie
  // Redirect
};

// POST /sign-up
const manualSignUp = (
  email: string,
  password: string,
  redirect: string,
  name?: string
): ErrorResponse | null => {
  // Find user, if found send forgot password email and return null
  // If password too short return password insecure error
  // Hash the password and create a link
  // Send an email with the link and return null
};

// POST /forgot-password
const forgotPassword = (email: string, redirect: string): null => {
  // Find thisUser, if found create a link and send an email
  // Return null
};

// POST /sign-out
const signOut = (cookies: Cookies): null => {
  // If session exists, update it to expired: now()
  // If cookie is not empty, remove it
  // Return null
};
```

## Protected Endpoints

Cookie required to send requests

```typescript
// Each endpoint first finds a non-expired session, if not found return not signed in error
// Find thisUser related to the session, if not found return not signed in error
// Find all permissions thisUser has by collecting all permissions from users groups and their children
// Find all groups that have an owner permission that is part of thisUser permissions and their children (ownedGroups)

// POST /auto-sign-in
const autoSignIn = (cookies: Cookies): null | SignInResponse => {
  // If cookie is empty return null
  // Find a non-expired session, if not found return null
  // Find thisUser, all its groups and their children
  // Create JWT token
  // Return response
};

// POST /sign-in
const manualSignIn = (
  cookies: Cookies,
  email: string,
  password: string
): ErrorResponse | SignInResponse => {
  // Validate password against hashed password of thisUser, if invalid return wrong credentials error
  // Create a session object
  // Find all thisUser groups and their children
  // Create JWT token
  // Return response
};

// POST /load
const load = (cookies: Cookies): ErrorResponse | LoadResponse => {
  // Find all users part of ownedGroups or their children
  // If thisUser permissions don't include root-admin, return response
  // Find all non-expired objects that are not users or groups
  // Return response
};

// POST /set-me
const setMe = (
  cookies: Cookies,
  name?: string,
  password?: string
): ErrorResponse | SignInResponse => {
  // Update thisUser
  // Return response
};

// POST /set-user
const setUser = (
  cookies: Cookies,
  id?: string,
  email?: string,
  sendEmail?: string,
  groups?: string[],
  name?: string,
  password?: string
): ErrorResponse | LoadResponse => {
  // If no ownedGroups were found or any payloadGroups are not part of ownedGroups, return not authorized error
  // If sendEmail is not undefined, forgot-password or welcome, return not authorized error
  // If no payloadId or payloadEmail provided, return invalid request error
  // Find the targetUser using payloadId or payloadEmail, if not found create it with email, name and password
  // Remove all ownedGroups that are not found in payloadGroups from targetUser
  // Add all payloadGroups to targetUser groups
  // If sendEmail is defined, create a link and send email to targetUser
  // Return load(cookie)
};

// POST /set-object
const setObject = (
  cookies: Cookies,
  collection: string,
  object: User | Group | Session | Permission | Link | Log | Email | Configuration,
  remove?: boolean
): LoadResponse => {
  // Update or remove the specified object
  // Return load(cookies)
};
```
