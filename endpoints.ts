import Cookies from 'cookies';

import {
  User,
  Group,
  Session,
  Link,
  Log,
  Permission,
  Email,
  Configuration,
  KeyResponse,
  ErrorResponse,
  RedirectResponse,
  SignInResponse,
  LoadResponse
} from './types';

const getUserAndOwnedGroups = (cookies: Cookies): [SignInResponse, Group[]] => {
  // Each authenticated endpoint first finds a non-expired session, if not found return not signed in error
  // Find thisUser related to the session, if not found return not signed in error
  // Find all permissions thisUser has by collecting all permissions from users groups and their children
  // Find all groups that have an owner permission that is part of thisUser permissions and their children (ownedGroups)
  return null as any;
};

export const missingFields = (): ErrorResponse => ({
  type: 'error',
  status: 400,
  message: 'missing-fields'
});

// GET /public-key
export const publicKey = (): KeyResponse => {
  // Return public key used to decrypt JWT tokens
  return null as any;
};

// GET /google-redirect
export const googleRedirect = (redirect: string): RedirectResponse => {
  // Redirect to a Google Signin page
  return null as any;
};

// GET /sign-in-link?id=<id>
export const signInLink = (id: string): RedirectResponse => {
  // Find the non-expired link, if not found redirect to link expired page
  // Find thisUser, if not found create it
  // Create session and set cookie
  // Update the link to expired: now()
  // Redirect to link redirect property
  return null as any;
};

// GET /google-sign-in
export const googleSignIn = (code: string, redirect: string): RedirectResponse => {
  // Request an access and id tokens from Google using the code
  // Request thisUser information from Google using the tokens
  // If either of these requests failed redirect with error in parameter
  // If thisUser does not exist, create thisUser
  // Update thisUser account with Google id, email, name and picture
  // Create a session and set a cookie
  // Redirect
  return null as any;
};

// POST /auto-sign-in
export const autoSignIn = (cookies: Cookies): null | SignInResponse => {
  // If cookie is empty return null
  // Find a non-expired session, if not found return null
  // Find thisUser, all its groups and their children
  // Create JWT token
  // Return response
  return null as any;
};

// POST /sign-in
export const manualSignIn = (email: string, password: string): ErrorResponse | SignInResponse => {
  // Find thisUser, if not found return wrong credentials error
  // Validate password against hashed password, if invalid return wrong credentials error
  // Create a session object
  // Find all thisUser groups and their children
  // Create JWT token
  // Return response
  return null as any;
};

// POST /sign-up
export const manualSignUp = (
  email: string,
  password: string,
  redirect: string,
  name?: string
): ErrorResponse | null => {
  // Find user, if found send forgot password email and return null
  // If password too short return password insecure error
  // Hash the password and create a link
  // Send an email with the link and return null
  return null as any;
};

// POST /forgot-password
export const forgotPassword = (email: string, redirect: string): null => {
  // Find thisUser, if found create a link and send an email
  // Return null
  return null as any;
};

// POST /sign-out
export const signOut = (cookies: Cookies): null => {
  // If session exists, update it to expired: now()
  // If cookie is not empty, remove it
  // Return null
  return null as any;
};

// POST /load
export const load = (cookies: Cookies): LoadResponse => {
  // Find all users part of ownedGroups or their children
  // If thisUser permissions don't include root-admin, return response
  // Find all non-expired objects that are not users or groups
  // return response
  return null as any;
};

// POST /set-user
export const setUser = (
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
  return null as any;
};

// POST /set-config
export const setConfig = (
  cookies: Cookies,
  permissions: Permission[],
  sessions: Session[],
  links: Link[],
  logs: Log[],
  emails: Email[],
  configurations: Configuration[]
): LoadResponse => {
  // For each object type remove all non-expired objects not in the list and add or update all others
  // Return load(cookie)
  return null as any;
};
