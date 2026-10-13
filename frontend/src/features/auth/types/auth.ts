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
  };
}

