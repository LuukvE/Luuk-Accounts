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
};
