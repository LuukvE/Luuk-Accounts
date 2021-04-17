# Auth
Allow users to sign up / sign manually or with Google.

## APIs
- [x] **Google OAuth 2.0:** Enables Google Sign-in
- [x] **Google Cloud Functions:** Hosts the TypeScript API
- [x] **Google Cloud FireStore:** Stores the user accounts and permissions

## Endpoints
```typescript
// GET /public-key
const publicKey = () => Key {
  // Return public key used to decrypt JWT tokens
};

// POST /auto-sign-in
const autoSignIn = (cookie?: string) => null | User {
  // Cookie provided has been protected against forgery using a signature cookie
  // If no cookie return null
  // Find user session object in FireStore based on its id in the cookie
  // Validate the session based on the requests that came in (IP / Timeout)
  // If the session is invalid return null
  // Return user profile, permissions and JWT token
};

// POST /sign-in
const manualSignIn = (email: string, password: string) => Error | User {
  // Find the user object in the FireStore
  // If user is not found return WRONG_CREDENTIALS error
  // Validate password against hashed password, if invalid return WRONG_CREDENTIALS error
  // Create a session object and return user profile, permissions and JWT token
};

// POST /google-sign-in
const googleSignIn = (code: string) => Error | User {
  // Request an access and id tokens from Google using the code
  // Request user information from Google using the tokens
  // If either of these requests failed return AUTH_FAILED error
  // If the user does not exist, create the user account
  // Update the user account with Google id, email, name and picture
  // Create a session and return user profile, permissions and JWT token
};

// POST /sign-out
const signOut = (cookie?: string) => void {
  // Cookie provided has been protected against forgery using a signature cookie
  // If session exists, update it to active: false
  // If cookie exists, remove it
};

// GET /google-redirect
const googleRedirect = () => void {
  // Redirect the user to a Google Signin page with a 302 Found
};
```
