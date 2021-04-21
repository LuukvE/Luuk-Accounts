export type OwnedGroup = {
  slug: string;
  parent: string | null;
  name: string;
  created: string;
};

export type Group = {
  slug: string;
  parent: string | null;
  name: string;
  created: string;
  owner: string;
  permissions: string[];
  status: string; // unchanged, changed, new, deleted
};

export type User = {
  email: string;
  name: string;
  password: boolean;
  google: boolean;
  picture: string;
  groups: string[];
};

export type Hiarchy = {
  group: OwnedGroup;
  children: Hiarchy;
  users: User[];
}[];

export type State = {
  requests: number;
  error: null | {
    type: string;
    status: number;
    message: string;
  };
  user:
    | null
    | false
    | {
        name: string;
        email: string;
        picture?: string;
        permissions: string[];
        groups: string[];
        token: string;
        password: boolean;
        google: boolean;
      };
  ownedGroups: OwnedGroup[];
  users: User[];
  groups: Group[];
};
