export type UserRole = 'admin' | 'analyst' | 'viewer';

export type AccountStatus = 'active' | 'disabled';

export type Permission =
  | 'view_dashboard'
  | 'view_analytics'
  | 'view_activities'
  | 'manage_users'
  | 'change_user_roles';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  permissions: Permission[];
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'bearer';
  expiresIn: number;
  user: AuthUser;
}

export interface ManagedUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewUser {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}
