import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { encryptAuthData, decryptAuthData } from '@/lib/helper';

export interface UserDetails {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone_no?: string;
  status?: boolean;
  token: string;
  position: string;
  address: string
  type?: string
  role?: string
}

export interface LoginData {
    user: UserDetails,
    token: string
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserDetails | null;
  token: string
}

const initialUserStr = decryptAuthData(localStorage.getItem('user')!);
const initialUser: AuthState | null = initialUserStr ? initialUserStr : null;

const initialState: AuthState = {
  user: initialUser?.user || null,
  token: initialUser?.token || '',
  isAuthenticated: !!initialUser,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload?.user;
      state.token = action.payload?.token
      state.isAuthenticated = action?.payload?.token ? true : false;
      localStorage.setItem('user', encryptAuthData(action.payload));
    },
    logoutAction: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
  },
});

export const { loginSuccess, logoutAction } = authSlice.actions;
export default authSlice.reducer;
