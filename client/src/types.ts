export type Group = {
  slug: string;
  parent: string | null;
  name: string;
  description: string;
  created: string;
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
  group: Group;
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
      };
  ownedGroups: Group[];
  users: User[];
};
