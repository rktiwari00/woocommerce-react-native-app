
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      // Simulate API call - replace with actual WooCommerce customer API
      const response = await fetch('YOUR_WOOCOMMERCE_URL/wp-json/wc/v3/customers', {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa('YOUR_CONSUMER_KEY:YOUR_CONSUMER_SECRET'),
          'Content-Type': 'application/json',
        },
      });

      // For demo purposes, create a mock user
      const user = {
        id: Date.now(),
        email,
        first_name: email.split('@')[0],
        last_name: '',
        avatar_url: 'https://via.placeholder.com/100',
        phone: '',
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (userData) => {
    try {
      // Simulate API call - replace with actual WooCommerce customer creation API
      const response = await fetch('YOUR_WOOCOMMERCE_URL/wp-json/wc/v3/customers', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('YOUR_CONSUMER_KEY:YOUR_CONSUMER_SECRET'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.email,
          password: userData.password,
        }),
      });

      // For demo purposes, create a mock user
      const user = {
        id: Date.now(),
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        avatar_url: 'https://via.placeholder.com/100',
        phone: userData.phone || '',
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...state.user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: updates });
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Failed to update profile.' };
    }
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
