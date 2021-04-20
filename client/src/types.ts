export type OwnedGroup = {
  slug: string;
  parent?: string;
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
  group: OwnedGroup;
  children: Hiarchy;
  users: User[];
}[];

export type State = {
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
      };
  ownedGroups: OwnedGroup[];
  users: User[];
};
