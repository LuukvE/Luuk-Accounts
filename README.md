# Auth
A complete authentication and user management solution.

## Functionality
- [x] Users can sign up and sign in manually or with Google
- [x] Users can manage other users, through groups and permissions
- [x] The system can send email verification and forgot password emails

## APIs
- **Google OAuth 2.0:** Enables Google Sign-in
- **Google Cloud Functions:** Hosts the TypeScript API
- **Google Cloud FireStore:** Hosts the database
- **Google Mail:** Enables automated e-mails

## Database
```typescript
type User = {
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

type Group = {
  slug: string;
  permissions: string[];
  owner: string; // permission slug
  parent?: string; // group slug
  name: string;
  description: string;
  created: Date;
};

// All objects below are exclusively managed and visible to users with permission: root-admin

type Session = {
  id: string;
  user: string;
  expired?: Date;
  created: Date;
};

// Links are used to directly sign up and sign in a user
type Link = {
  id: string;
  name: string;
  email: string;
  password?: string;
  redirect: string;
  expired?: Date;
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

## Considerations
- Passwords are hashed before saved
- All redirects use status 302 Found
- Email addresses are case-insensitive
- All POST requests and responses are Content-Type JSON
- Cookies are protected against forgery using a signature cookie
- Requests from an allowed origin return CORS headers with that origin
- Function arguments can come from a cookie, the request body or the request parameters

## Response Types
```typescript
type Error = {
  type: string;
  message: string;
};

type SignInResponse = {
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

type LoadResponse = {
  users: {
    id: string;
    name: string;
    email: string;
    password: boolean;
    google: boolean;
    picture: string;
    groups: string[];
  }[],
  groups: {
    slug: string;
    permissions: string[];
    parent?: string; // group slug
    name: string;
    description: string;
    created: Date;
  }[],
  permissions?: {
    slug: string;
    description: string;
  }[];
};
```

## Public Endpoints
No cookie required to send requests
```typescript
// GET /public-key
const publicKey = () => Configuration {
  // Return public key used to decrypt JWT tokens
};

// POST /auto-sign-in
const autoSignIn = (cookie: string) => null | SignInResponse {
  // If cookie is empty return null
  // Find a non-expired session, if not found return null
  // Find thisUser, all its groups and their children
  // Return response
};

// POST /sign-in
const manualSignIn = (email: string, password: string) => Error | SignInResponse {
  // Find thisUser, if not found return wrong credentials error
  // Validate password against hashed password, if invalid return wrong credentials error
  // Create a session object
  // Find all thisUser groups and their children
  // Return response
};

// POST /sign-up
const manualSignUp = (email: string, password: string, redirect: string, name?: string) => Error | null {
  // Find user, if found send forgot password email and return null
  // If password too short return password insecure error
  // Hash the password and create a link
  // Send an email with the link and return null
};

// POST /forgot-password
const forgotPassword = (email: string, redirect: string) => null {
  // Find thisUser, if not found return null
  // Create a link and send an email
  // Return null
};

// GET /email-sign-in?id=<id>
const emailSignIn = (id: string) => void {
  // Find the non-expired link, if not found redirect to link expired page
  // Find thisUser, if not found create it
  // Create session and set cookie
  // Update the link to expired: now()
  // Redirect to link redirect property
};

// POST /google-sign-in
const googleSignIn = (code: string) => Error | SignInResponse {
  // Request an access and id tokens from Google using the code
  // Request thisUser information from Google using the tokens
  // If either of these requests failed return authentication failed error
  // If thisUser does not exist, create thisUser
  // Update thisUser account with Google id, email, name and picture
  // Create a session
  // Find all thisUser groups and their children
  // Return response
};

// GET /google-redirect
const googleRedirect = () => void {
  // Redirect to a Google Signin page
};

// POST /sign-out
const signOut = (cookie: string) => null {
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

// POST /load
const load = (cookie: string) => LoadResponse {
  // Find all users part of ownedGroups or their children
  // If thisUser permissions include root-admin, find all permissions
  // return response
};

// POST /set-user
const setUser = (cookie: string, id?: string, email?: string, sendEmail?: string, groups?: string[], name?: string, password?: string) => Error | LoadResponse {
  // If no ownedGroups were found or any payloadGroups are not part of ownedGroups, return not authorized error
  // If sendEmail is not undefined, forgot-password or welcome, return not authorized error
  // If no payloadId or payloadEmail provided, return invalid request error
  // Find the targetUser using payloadId or payloadEmail, if not found create it with email, name and password
  // Remove all ownedGroups that are not found in payloadGroups from targetUser
  // Add all payloadGroups to targetUser groups
  // If sendEmail is defined, create a link and send email to targetUser
  // Return load(cookie)
};
```
