# Auth
A complete authentication and user management solution.

## Functionality
- Users can sign up and sign in manually or with Google
- Users can manage other users, through groups and permissions
- The system can send email verification and forgot password emails

## APIs
- [x] **Google OAuth 2.0:** Enables Google Sign-in
- [x] **Google Cloud Functions:** Hosts the TypeScript API
- [x] **Google Cloud FireStore:** Hosts the database
- [x] **Google Mail:** Enables automated e-mails

## Database
```typescript
type User = {
  id: string;
  name: string;
  email: string;
  picture: string; // URL
  google: string; // ID
  created: Date;
};

type Session = {
  id: string;
  user: string;
  expired?: Date;
  created: Date;
};

type Permission = {
  id: string;
  created: Date;
};

type Group = {
  id: string;
  created: Date;
};

type Trigger = {
  id: string;
  type: TriggerType; // Sign Up, Sign in
  name: string;
  email: string;
  password?: string;
  redirect: string; // URL
  expired: Date;
  created: Date;
};

type Email = {
  id: string;
  type: EmailType; // Verify Email, Forgot Password
  subject: string;
  htmlBody: string;
  plainBody: string;
};

type Log = {
  id: string;
  type: LogType; // User Error, System Error, Session Created, User Created, Trigger Created, Permission Created, Group Created, Email Sent
  action: string;
  detail: string;
  created: Date;
};

type Configuration = {
  id: string;
  type: ConfigurationType; // Session Max Age, Private Key, Public Key, Minimum Password Length
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

## Endpoints
```typescript
// GET /public-key
const publicKey = () => Key {
  // Return public key used to decrypt JWT tokens
};

// POST /auto-sign-in
const autoSignIn = (cookie?: string) => null | User {
  // If no cookie return null
  // Find a non-expired session, if not found return null
  // Return user profile, permissions and JWT token
};

// POST /sign-in
const manualSignIn = (email: string, password: string) => Error | User {
  // Find the user, if not found return wrong credentials error
  // Validate password against hashed password, if invalid return wrong credentials error
  // Create a session object and return user profile, permissions and JWT token
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
const googleSignIn = (code: string) => Error | User {
  // Request an access and id tokens from Google using the code
  // Request user information from Google using the tokens
  // If either of these requests failed return authentication failed error
  // If the user does not exist, create the user account
  // Update the user account with Google id, email, name and picture
  // Create a session and return user profile, permissions and JWT token
};

// POST /sign-out
const signOut = (cookie?: string) => void {
  // If session exists, update it to expired: now()
  // If cookie exists, remove it
};

// GET /google-redirect
const googleRedirect = () => void {
  // Redirect the user to a Google Signin page with a 302 Found
};
```
