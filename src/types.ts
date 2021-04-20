// Database Objects

export type User = {
  email: string;
  password: string | null;
  google: string | null;
  groups: string[];
  name: string;
  picture: string | null;
  created: Date;
};

export type Group = {
  slug: string;
  permissions: string[];
  owner: string;
  parent?: string;
  name: string;
  description: string;
  created: Date;
};

export type Session = {
  id: string;
  user: string;
  expired?: Date;
  created: Date;
};

export type Link = {
  id: string;
  name: string;
  email: string;
  password?: string;
  redirect: string;
  expired: Date | null;
  created: Date;
};

export type Log = {
  id: string;
  user?: string;
  group?: string;
  session?: string;
  link?: string;
  type: string;
  action: string;
  detail: string;
  created: Date;
};

export type Permission = {
  slug: string;
  description: string;
};

export type Email = {
  slug: string;
  subject: string;
  html: string;
  text: string;
};

export type Configuration = {
  slug: string;
  value: string;
};

// Response Objects

export type KeyResponse = {
  type: 'key';
  key: string;
};

export type ErrorResponse = {
  type: 'error';
  status: number;
  message: string;
};

export type RedirectResponse = {
  type: 'redirect';
  location: string;
};

export type SignInResponse = {
  type: 'sign-in';
  token: string;
  permissions: string[];
  email: string;
  name: string;
  picture: string;
  password: boolean;
  google: boolean;
};

export type LoadResponse = {
  type: 'load';
  ownedGroups: {
    slug: string;
    parent?: string;
    name: string;
    description: string;
    created: Date;
  }[];
  users: {
    name: string;
    email: string;
    password: boolean;
    google: boolean;
    picture: string;
    groups: string[];
  }[];
  groups?: Group[];
  permissions?: Permission[];
  sessions?: Session[];
  links?: Link[];
  logs?: Log[];
  emails?: Email[];
  configurations?: Configuration[];
};

// Request Body
export type RequestBody = null | {
  email?: string;
  password?: string;
  redirect?: string;
  name?: string;
  id?: string;
  session?: string;
  sendEmail?: string;
  groups?: string[];
  collection?: string;
  object?: User | Group | Session | Permission | Link | Log | Email | Configuration;
  remove?: boolean;
};
