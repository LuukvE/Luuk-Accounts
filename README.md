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
// - Parent groups share their permissions with all their children
// - Users that are part of a group with the "owner" permission of another group can:
//   - Add or remove the group slug from all other users
//   - Create new users as long as they do not exist
//   - Send welcome or forgot-password emails
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

type Trigger = {
  id: string;
  type: string; // sign-up, sign-in
  name: string;
  email: string;
  password?: string;
  redirect: string;
  expired: Date;
  created: Date;
};

type Log = {
  id: string;
  user?: string;
  group?: string;
  session?: string;
  trigger?: string;
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

## Considerations
- Passwords are hashed before saved
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
  email: string;
  password: boolean;
  google: boolean;
  name: string;
  picture: string;
  permissions: string;
  session: string;
  token: string
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
    parent?: string; // group slug
    name: string;
    description: string;
    created: Date;
  }[]
};
```

## Endpoints
```typescript

// Public Endpoints: No cookie required to send requests

// GET /public-key
const publicKey = () => Configuration {
  // Return public key used to decrypt JWT tokens
};

// POST /auto-sign-in
const autoSignIn = (cookie: string) => null | SignInResponse {
  // If cookie is empty return null
  // Find a non-expired session, if not found return null
  // Return SignInResponse
};

// POST /sign-in
const manualSignIn = (email: string, password: string) => Error | SignInResponse {
  // Find the user, if not found return wrong credentials error
  // Validate password against hashed password, if invalid return wrong credentials error
  // Create a session object and return SignInResponse
};

// POST /sign-up
const manualSignUp = (email: string, password: string, redirect: string, name?: string) => void {
  // Find user, if found send forgot password email and return
  // Hash the password and create the sign up trigger
  // Send an email with a link that executes the trigger
};

// POST /forgot-password
const forgotPassword = (email: string, redirect: string) => void {
  // Find user, if not found return
  // Create a forgot password trigger and send an email with a link that executes the trigger
};

// GET /trigger?id=<id>
const trigger = (id: string) => void {
  // Find the non-expired trigger, if not found redirect to link expired page
  // Execute the trigger and set cookie
  // Update the trigger to expired: now()
  // Redirect to trigger redirect property
};

// POST /google-sign-in
const googleSignIn = (code: string) => Error | SignInResponse {
  // Request an access and id tokens from Google using the code
  // Request user information from Google using the tokens
  // If either of these requests failed return authentication failed error
  // If the user does not exist, create the user account
  // Update the user account with Google id, email, name and picture
  // Create a session and return SignInResponse
};

// GET /google-redirect
const googleRedirect = () => void {
  // Redirect the user to a Google Signin page with a 302 Found
};

// POST /sign-out
const signOut = (cookie: string) => void {
  // If session exists, update it to expired: now()
  // If cookie is not empty, remove it
};

// Protected Endpoints: Cookie required to send requests
// Each endpoint first finds a non-expired session, if not found return not signed in error
// Find thisUser related to the session, if not found return not signed in error
// Find all permissions thisUser has
// Find all ownerGroups that have an owner permission that is part of thisUser permissions

// POST /load
const load = (cookie: string) => LoadResponse {
  // Find all users part of ownerGroups
  // return response
};

// POST /set-user
const setUser = (cookie: string, id?: string, email?: string, sendEmail?: string, groups?: string[], name?: string, password?: string) => Error | null {
  // If no ownerGroups were found or any payloadGroups are not part of ownerGroups, return not authorized error
  // If sendEmail is not undefined, forgot-password or welcome, return not authorized error
  // If no payloadId or payloadEmail provided, return invalid request error
  // Find the setUser using payloadId or payloadEmail, if not found create it with email, name and password
  // Remove all ownerGroups that are not found in payloadGroups from setUser
  // Add all payloadGroups to setUser groups
  // If sendEmail is defined, create sign-in trigger and send email to setUser
  // return null
};
```
