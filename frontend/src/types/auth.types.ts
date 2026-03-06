export interface RegisterInput {
  userId: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface AuthState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  registeredEmail: string | null;
}
