export type State = {
  error: null | {
    type: string;
    status: number;
    message: string;
  };
  user: null | {
    name: string;
    email: string;
    picture?: string;
  };
};
