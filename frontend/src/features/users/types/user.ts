export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: string;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  bio?: string;
  interests?: string[];
  reputationScore?: number;
  tier?: string;
  createdAt: string;
  hasPassword?: boolean;
}

export interface UpdateProfileRequest {
  phone?: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  oldPassword?: string;
  newPassword?: string;
}

export interface SetInitialPasswordRequest {
  newPassword: string;
}
