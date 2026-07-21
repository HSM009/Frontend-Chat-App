export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;

  token: string | null;

  isLoading: boolean;

  login: (user: User, token: string) => Promise<void>;

  logout: () => Promise<void>;

  loadToken: () => Promise<void>;
}
