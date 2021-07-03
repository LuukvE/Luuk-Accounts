import querystring from 'querystring';
import { nanoid } from 'nanoid';
import fetch from 'node-fetch';
import Cookies from 'cookies';
import crypto from 'crypto';

import {
  getUser,
  getLink,
  getSession,
  saveUser,
  saveLink,
  saveSession,
  findGroups,
  findSessions,
  getUsersInGroups,
  getConfiguration,
  saveGroup
} from './database';

import {
  KeyResponse,
  LoadResponse,
  ErrorResponse,
  SignInResponse,
  RedirectResponse
} from './types';

import {
  cookieName,
  ServerError,
  notSignedIn,
  cookieOptions,
  notAuthorized,
  missingFields,
  wrongCredentials,
  passwordInsecure
} from './constants';

import {
  mail,
  hashPassword,
  passwordMatches,
  generateJWT,
  getAllGroups,
  getPermissions,
  getOwnedGroups
} from './helpers';
import { parseJSON } from 'date-fns';

// GET /public-key
export const publicKey = async (): Promise<KeyResponse> => {
  const configuration = await getConfiguration('public-key');

  return {
    type: 'key',
    key: configuration.value
  };
};

// GET /google-redirect?redirect=<URL>
export const googleRedirect = async (redirect: string): Promise<RedirectResponse> => {
  // Create redirect query to a Google Signin page
  const query = new URLSearchParams({
    prompt: 'consent',
    response_type: 'code',
    access_type: 'offline',
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    state: Buffer.from(redirect).toString('base64'),
    redirect_uri: `${process.env.API_URL}/api/google-sign-in`,
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ')
  }).toString();

  return {
    type: 'redirect',
    location: `https://accounts.google.com/o/oauth2/v2/auth?${query}`
  };
};

// GET /google-sign-in
export const googleSignIn = async (
  cookies: Cookies,
  code: string,
  state: string
): Promise<RedirectResponse> => {
  const redirect = Buffer.from(state, 'base64').toString();

  // Request an access and id tokens from Google using the code
  const tokenRequest = await fetch(`https://oauth2.googleapis.com/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: querystring.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.API_URL}/api/google-sign-in`,
      grant_type: 'authorization_code'
    })
  }).catch((error) => console.log(error));

  // If the request was not successful
  if (!tokenRequest) {
    return {
      type: 'redirect',
      location: `${redirect}?error=google-token-auth-failed`
    };
  }

  const tokens = await tokenRequest.json();

  // Request thisUser information from Google using the tokens
  const googleRequest = await fetch(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
    {
      headers: {
        Authorization: `Bearer ${tokens.id_token}`
      }
    }
  );

  if (googleRequest.status >= 300) {
    return {
      type: 'redirect',
      location: `${redirect}?error=google-user-info-failed`
    };
  }

  const googleUser = await googleRequest.json();

  const foundUser = await getUser(googleUser.email);

  const user = await saveUser({
    created: new Date(),
    email: googleUser.email,
    name: googleUser.name,
    groups: [],
    google: googleUser.id,
    ...foundUser,
    picture: googleUser.picture || ''
  });

  const sessions = await findSessions({ user: user.email, expired: null });

  const session =
    sessions[0] ||
    (await saveSession({
      id: nanoid(),
      user: user.email,
      expired: null,
      created: new Date()
    }));

  cookies.set(cookieName, session.id, {
    ...cookieOptions,
    expires: new Date(2070, 1, 1)
  });

  return {
    type: 'redirect',
    location: redirect
  };
};

// GET /sign-in-link?id=<id>
export const signInLink = async (
  cookies: Cookies,
  id: string
): Promise<RedirectResponse | ErrorResponse | null> => {
  const link = await getLink(id);

  if (!link || link.expired) {
    return {
      type: 'error',
      status: 410,
      message: 'This link has expired'
    };
  }

  const foundUser = await getUser(link.email);

  const user =
    foundUser ||
    (await saveUser({
      email: link.email,
      created: new Date(),
      name: link.name,
      groups: [],
      google: null,
      picture: null,
      password: link.password || null
    }));

  const sessions = await findSessions({ user: user.email, expired: null });

  const session =
    sessions[0] ||
    (await saveSession({
      id: nanoid(),
      user: user.email,
      expired: null,
      created: new Date()
    }));

  cookies.set(cookieName, session.id, {
    ...cookieOptions,
    expires: new Date(2050, 1, 1)
  });

  await saveLink({
    ...link,
    expired: new Date()
  });

  return {
    type: 'redirect',
    location: link.redirect
  };
};

// POST /auto-sign-in
export const autoSignIn = async (cookies: Cookies): Promise<null | SignInResponse> => {
  const sessionID = cookies.get(cookieName, { signed: true });

  if (!sessionID) return null;

  const session = await getSession(sessionID);

  if (!session || session.expired) return null;

  const user = await getUser(session.user);

  const groups = await getAllGroups();

  const permissions = await getPermissions(user, groups);

  const response = {
    type: 'sign-in',
    email: user.email,
    name: user.name,
    picture: user.picture,
    password: !!user.password,
    google: !!user.google,
    permissions,
    groups: user.groups
  } as SignInResponse;

  response.token = await generateJWT(response);

  return response;
};

// POST /sign-in
export const manualSignIn = async (
  cookies: Cookies,
  email: string,
  password: string
): Promise<ErrorResponse | SignInResponse> => {
  const user = await getUser(email.toLowerCase());

  if (!user || !user.password) return wrongCredentials;

  const matches = await passwordMatches(password, user.password);

  if (!matches) return wrongCredentials;

  const sessions = await findSessions({ user: user.email, expired: null });

  const session =
    sessions[0] ||
    (await saveSession({
      id: nanoid(),
      user: user.email,
      expired: null,
      created: new Date()
    }));

  cookies.set(cookieName, session.id, {
    ...cookieOptions,
    expires: new Date(2050, 1, 1)
  });

  const groups = await getAllGroups();

  const permissions = await getPermissions(user, groups);

  const response = {
    type: 'sign-in',
    email: user.email,
    name: user.name,
    picture: user.picture,
    password: !!user.password,
    google: !!user.google,
    permissions,
    groups: user.groups
  } as SignInResponse;

  response.token = await generateJWT(response);

  return response;
};

// POST /sign-up
export const manualSignUp = async (
  email: string,
  password: string,
  redirect: string,
  name?: string
): Promise<ErrorResponse | null> => {
  const user = await getUser(email.toLowerCase());

  if (user) return forgotPassword(user.email, redirect);

  // If password too short return password insecure error
  if (!password) return passwordInsecure;

  const hash = await hashPassword(password);

  // Create a link
  const link = await saveLink({
    id: nanoid(),
    name: name || '',
    email: email.toLowerCase(),
    password: hash,
    redirect,
    expired: null,
    created: new Date()
  });

  const linkURL = `${process.env.API_URL}/api/sign-in-link?id=${link.id}`;

  const { success } = await mail('sign-up', email, linkURL);

  if (!success) return ServerError;

  return null;
};

// POST /forgot-password
export const forgotPassword = async (
  email: string,
  redirect: string
): Promise<ErrorResponse | null> => {
  const user = await getUser(email.toLowerCase());

  if (!user) return null;

  const link = await saveLink({
    id: nanoid(),
    name: user.name,
    email: user.email,
    password: null,
    redirect,
    expired: null,
    created: new Date()
  });

  const linkURL = `${process.env.API_URL}/api/sign-in-link?id=${link.id}`;

  const { success } = await mail('forgot-password', user.email, linkURL);

  if (!success) return ServerError;

  return null;
};

// POST /sign-out
export const signOut = async (cookies: Cookies): Promise<null> => {
  const sessionID = cookies.get(cookieName, { signed: true });

  if (!sessionID) return null;

  const session = await getSession(sessionID);

  if (!session) return null;

  const sessions = await findSessions({ user: session.user, expired: null });

  await Promise.all(sessions.map((session) => saveSession({ ...session, expired: new Date() })));

  cookies.set(cookieName, undefined, cookieOptions);

  return null;
};

// POST /load
export const load = async (cookies: Cookies): Promise<ErrorResponse | LoadResponse> => {
  const sessionID = cookies.get(cookieName, { signed: true });

  if (!sessionID) return null;

  const session = await getSession(sessionID);

  if (!session || session.expired) return null;

  const user = await getUser(session.user);

  if (!user) return notSignedIn;

  const ownedGroups = await getOwnedGroups(user);

  const users = await getUsersInGroups(ownedGroups);

  const groupSlugs = ownedGroups.map((group) => group.slug);

  const response: LoadResponse = {
    type: 'load',
    ownedGroups: ownedGroups.map((group) => {
      const { permissions, ...ownedGroup } = group;

      return ownedGroup;
    }),
    users: users.map((user) => ({
      name: user.name,
      email: user.email,
      password: !!user.password,
      google: !!user.google,
      picture: user.picture,
      groups: user.groups.filter((group) => groupSlugs.includes(group))
    }))
  };

  if (user.groups.includes('admins')) response.groups = await findGroups();

  return response;
};

// POST /set-me
export const setMe = async (
  cookies: Cookies,
  name?: string,
  password?: string
): Promise<ErrorResponse | SignInResponse> => {
  const signin = await autoSignIn(cookies);

  if (!signin) return notSignedIn;

  const hash = password ? await hashPassword(password) : null;

  const user = await getUser(signin.email);

  const update = await saveUser({
    ...user,
    name: typeof name === 'string' ? name : user.name,
    password: hash ? hash : user.password
  });

  return {
    ...signin,
    name: update.name,
    password: !!update.password
  };
};

// POST /set-user
export const setUser = async (
  cookies: Cookies,
  email: string,
  groups: string[],
  name: string,
  sendEmail: string,
  redirect: string
): Promise<ErrorResponse | LoadResponse> => {
  const sessionID = cookies.get(cookieName, { signed: true });

  if (!sessionID) return notSignedIn;

  const session = await getSession(sessionID);

  if (!session || session.expired) return notSignedIn;

  const user = await getUser(session.user);

  if (!user) return notSignedIn;

  const ownedGroups = await getOwnedGroups(user);

  const ownedGroupSlugs = ownedGroups.map((group) => group.slug);

  if (ownedGroups.length === 0) return notAuthorized;

  if (groups.find((group) => !ownedGroupSlugs.includes(group))) return notAuthorized;

  if (!['', 'welcome'].includes(sendEmail)) return notAuthorized;

  if (!email.includes('@')) return missingFields;

  const payloadUser = await getUser(email.toLowerCase());

  const userUpdate =
    payloadUser ||
    (await saveUser({
      email: email.toLowerCase(),
      name,
      groups: [],
      password: null,
      google: null,
      picture: null,
      created: new Date()
    }));

  const newGroups = userUpdate.groups.filter((group) => {
    return !ownedGroupSlugs.includes(group) || groups.includes(group);
  });

  groups.forEach((group) => {
    if (!newGroups.includes(group)) newGroups.push(group);
  });

  await saveUser({
    ...userUpdate,
    groups: newGroups
  });

  if (!sendEmail) return load(cookies);

  const link = await saveLink({
    id: nanoid(),
    name: userUpdate.name,
    email: userUpdate.email,
    password: null,
    redirect,
    expired: null,
    created: new Date()
  });

  const linkURL = `${process.env.API_URL}/api/sign-in-link?id=${link.id}`;

  if (sendEmail === 'welcome') await mail('welcome', userUpdate.email, linkURL);

  return load(cookies);
};

// POST /set-groups
export const setGroups = async (
  cookies: Cookies,
  groups: {
    created: string;
    slug: string;
    permissions: string[];
    owner: string;
    parent: string;
    name: string;
    status: string;
  }[]
): Promise<ErrorResponse | LoadResponse> => {
  const sessionID = cookies.get(cookieName, { signed: true });

  if (!sessionID) return notSignedIn;

  const session = await getSession(sessionID);

  if (!session || session.expired) return notSignedIn;

  const user = await getUser(session.user);

  if (!user) return notSignedIn;

  if (!user.groups.includes('admins')) return notAuthorized;

  const save = groups.map((group) =>
    saveGroup(
      {
        slug: group.slug,
        permissions: group.permissions,
        owner: group.owner,
        parent: group.parent || null,
        name: group.name,
        created: group.created ? parseJSON(group.created) : new Date()
      },
      group.status === 'deleted'
    )
  );

  await Promise.all(save);

  return load(cookies);
};
