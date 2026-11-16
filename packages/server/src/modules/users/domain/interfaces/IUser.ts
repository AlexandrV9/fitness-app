export type IUser = {
  id: string;
  login: string;
};

export type IUserAuth = IUser & {
  passwordHash: string;
};
