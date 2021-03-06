# **Luuk Accounts**

A complete authentication and user management solution.

## **Functionality**

- [x] Sign in with Google or with an email and password
- [x] Authorize your users by giving permissions to nested groups
- [x] Authenticate your users on your other APIs using JWT tokens
- [x] Allow specific groups to manage other users through a user interface

## **Services**

- **Sendgrid:** sends create account and forgot password e-mails
- **Google Cloud Firestore:** stores accounts and software configuration

## **Considerations**

- Passwords are hashed before saved
- Email addresses are case-insensitive
- Cookies are protected against forgery using a signature cookie
- Requests from an allowed origin return CORS headers with that origin
- Groups can _(optionally)_ be nested in other groups, forming a hiarchy
- Users get the permissions attached to the groups they are in and the groups nested inside of them
- The group owner property refers to a permission required to add or remove users from that group
- Links are used to sign up and sign in a user when they follow the link from their e-mail client

## **Installation**
1. Run `npm install` inside both the `/api` and `/client` folder
2. Create environment variable files `.env.production` and `.env.development` in both the `/api` and `/client` folder
3. Add a `google-service.json` file to the `/api` folder. You can get this file from Google Cloud Console
4. Create SSL certificate files in the `/api/ssl` folder. *I host my server on Google Cloud Run, and therefore I only need to configure this for local development*
    1. Set the `HTTPS_PORT` in the `.env.production` and `.env.development` files in the `/api` folder
    2. On your local machine run `openssl req -new -newkey rsa:4096 -days 9999 -nodes -x509 -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.irrelevant.gg" -keyout privkey.pem -out cert.pem`
    3. On your server run `certbot certonly -d <YOUR_DOMAIN> -m <YOUR_EMAIL> --standalone --no-eff-email --non-interactive --agree-tos`
    4. Put `cert.pem`, `privkey.pem` and optionally `chain.pem` in the `api/ssl` folder

I have added a `Dockerfile` for those that want to deploy this application as a container. The client should still be built on your local machine using `npm run-script build` before creating and deploying your image.

## **Types**

```typescript
// Database Objects

type User = {
  email: string;
  name: string;
  groups: string[];
  password: string | null;
  google: string | null;
  picture: string | null;
  created: Date;
};

type Group = {
  slug: string;
  permissions: string[];
  owner: string;
  parent: string | null;
  name: string;
  created: Date;
};

type Session = {
  id: string;
  user: string;
  expired: Date | null;
  created: Date;
};

type Link = {
  id: string;
  name: string;
  email: string;
  password: string | null;
  redirect: string;
  expired: Date | null;
  created: Date;
};

type Email = {
  slug: string;
  subject: string;
  html: string;
  text: string;
};

type Configuration = {
  slug: string;
  value: string;
};

// Response Objects

type KeyResponse = {
  type: "key";
  key: string;
};

type ErrorResponse = {
  type: "error";
  status: number;
  message: string;
};

type RedirectResponse = {
  type: "redirect";
  location: string;
};

type SignInResponse = {
  type: "sign-in";
  token?: string;
  groups: string[];
  permissions: string[];
  email: string;
  name: string;
  picture: string;
  password: boolean;
  google: boolean;
};

type LoadResponse = {
  type: "load";
  ownedGroups: {
    slug: string;
    parent: string | null;
    name: string;
    created: Date;
  }[];
  users: {
    email: string;
    name: string;
    password: boolean;
    google: boolean;
    picture: string;
    groups: string[];
  }[];
  groups?: Group[];
};

// Request Body
type RequestBody = null | {
  name?: string;
  email?: string;
  groups?: string[];
  redirect?: string;
  password?: string;
  sendEmail?: string;
  setGroups?: {
    created: string;
    slug: string;
    permissions: string[];
    owner: string;
    parent: string;
    name: string;
    status: string;
  }[];
};
```
