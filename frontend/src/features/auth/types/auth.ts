export interface AuthResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  interests?: string[];
  totalPoints?: number;
  tier?: string;
  requires2FA?: boolean;
  hasPassword?: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    fullName?: string;
    avatar?: string;
    phone?: string;
    address?: string;
    interests?: string[];
    hasPassword?: boolean;
  };
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
  interests?: string[];
}
