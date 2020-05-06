export interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  roles?: Roles;
  createdGames?: any;
}

export interface Roles {
  default?: boolean;
  pro?: boolean;
  admin?: boolean;
}
