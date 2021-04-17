# Auth
Allow users to sign up / sign manually or with Google.

## APIs
- [x] **Google OAuth 2.0:** Enables Google Sign-in
- [x] **Google Cloud Functions:** Hosts the TypeScript API
- [x] **Google Cloud FireStore:** Stores the user accounts and permissions

## Considerations
- Email addresses are case-insensitive
- All POST requests and responses are Content-Type JSON
- Cookies are protected against forgery using a signature cookie
- Requests from an allowed origin should return CORS headers with that origin
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
  // Find user session object in FireStore based on its id in the cookie
  // Validate the session based on the requests that came in (IP / Timeout)
  // If the session is invalid return null
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
  // Create sign up trigger and send an email with a link that executes the trigger
};

// GET /trigger?id=<id>
const trigger = (id: string) => void {
  // Find the trigger, if not found redirect to link expired page
  // Execute the trigger, if sign up or forgot password then also set cookie
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
  // If session exists, update it to active: false
  // If cookie exists, remove it
};

// GET /google-redirect
const googleRedirect = () => void {
  // Redirect the user to a Google Signin page with a 302 Found
};
```
