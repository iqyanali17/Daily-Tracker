// import apiClient from '../utils/apiClient';

// Types representing what the backend will accept/return
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
}

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<void> => {
    console.log("Registering user:", data.email);
    // REAL API CALL:
    // await apiClient.post('/auth/register', data);
    
    // MOCK FOR NOW:
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  },

  /**
   * Login user
   */
  login: async (email: string, password?: string): Promise<LoginResponse> => {
    console.log("Logging in user:", email, password ? "with password" : "no password");
    // REAL API CALL:
    // const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    // return response.data;

    // MOCK FOR NOW:
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'dummy_jwt_token_123',
          user: {
            id: '1',
            name: email.split('@')[0] || 'User',
            email: email,
          }
        });
      }, 1000);
    });
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    // REAL API CALL:
    // await apiClient.post('/auth/logout');
    
    // MOCK FOR NOW:
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  }
};
