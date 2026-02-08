import httpAPI from '../utils/http';
import { API_ROUTES } from '../utils/api.routes';

const login = async (email: string, password: string) => {
  try {
    const response = await httpAPI.post(API_ROUTES.AUTH.LOGIN, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

const register = async (username: string, email: string, password: string) => {
  try {
    const response = await httpAPI.post(API_ROUTES.AUTH.REGISTER, { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

const getProfile = async () => {
  try {
    const { data } = await httpAPI.get(API_ROUTES.AUTH.GET_PROFILE);
    return data.data;
  } catch (error) {
    throw error.response?.data || { message: 'Fetching profile failed' };
  }
};

const updateProfile = async (profileData: { username?: string; email?: string; profileImage?: string }) => {
  try {
    const response = await httpAPI.put(API_ROUTES.AUTH.UPDATE_PROFILE, profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Updating profile failed' };
  }
};

const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await httpAPI.put(API_ROUTES.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Changing password failed' };
  }
};

export const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
};
