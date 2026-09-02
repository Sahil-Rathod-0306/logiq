import api from './api';

export interface AuthResponse {
  token?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
// services/auth.service.ts

export const registerUser = async (data: { name: string; email: string; password: string }): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return { user: response.data.data };
};

export const loginUser = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return { token: response.data.token, user: response.data.data };
};
