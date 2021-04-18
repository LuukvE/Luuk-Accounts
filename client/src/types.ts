export type State = {
  error: string;
  user: null | {
    name: string;
    email: string;
    picture?: string;
  };
};
