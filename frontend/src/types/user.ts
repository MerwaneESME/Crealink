export type UserRole = "admin" | "creator" | "expert" | "pending" | "influencer";

export interface User {
  uid: string;
  email: string | null;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  verified: boolean;
  displayName?: string;
  photoURL?: string | null;
  phone?: string;
  address?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  interests?: string;
  portfolio?: string[];
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}
