
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeConfig } from '../config/store';

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
      // Basic email and password validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required.' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      // Get all customers and find the one with matching email
      const response = await fetch(`${storeConfig.woocommerce.baseUrl}/wp-json/wc/v3/customers?email=${email}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${storeConfig.woocommerce.consumerKey}:${storeConfig.woocommerce.consumerSecret}`),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network error');
      }

      const customers = await response.json();
      
      if (customers.length === 0) {
        return { success: false, error: 'No account found with this email address.' };
      }

      const customer = customers[0];
      
      // Store password hash in AsyncStorage for basic validation
      const storedPassword = await AsyncStorage.getItem(`password_${email}`);
      
      if (storedPassword && storedPassword !== password) {
        return { success: false, error: 'Invalid password. Please try again.' };
      }
      
      const user = {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        avatar_url: customer.avatar_url || 'https://via.placeholder.com/100',
        phone: customer.billing?.phone || '',
        username: customer.username,
        date_created: customer.date_created,
        billing: customer.billing,
        shipping: customer.shipping,
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please check your internet connection and try again.' };
    }
  };

  const signup = async (userData) => {
    try {
      // Check if user already exists
      const existingUserResponse = await fetch(`${storeConfig.woocommerce.baseUrl}/wp-json/wc/v3/customers?email=${userData.email}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${storeConfig.woocommerce.consumerKey}:${storeConfig.woocommerce.consumerSecret}`),
          'Content-Type': 'application/json',
        },
      });

      if (existingUserResponse.ok) {
        const existingUsers = await existingUserResponse.json();
        if (existingUsers.length > 0) {
          return { 
            success: false, 
            error: 'An account with this email already exists.', 
            shouldRedirectToLogin: true 
          };
        }
      }

      // Create customer using WooCommerce API
      const response = await fetch(`${storeConfig.woocommerce.baseUrl}/wp-json/wc/v3/customers`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${storeConfig.woocommerce.consumerKey}:${storeConfig.woocommerce.consumerSecret}`),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.email,
          password: userData.password,
          billing: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            email: userData.email,
            phone: userData.phone || '',
          },
          shipping: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const customer = await response.json();
      
      // Store password for basic validation
      await AsyncStorage.setItem(`password_${userData.email}`, userData.password);
      
      const user = {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        avatar_url: customer.avatar_url || 'https://via.placeholder.com/100',
        phone: customer.billing?.phone || '',
        username: customer.username,
        date_created: customer.date_created,
        billing: customer.billing,
        shipping: customer.shipping,
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific WooCommerce errors
      if (error.message.includes('email_exists')) {
        return { 
          success: false, 
          error: 'An account with this email already exists.', 
          shouldRedirectToLogin: true 
        };
      } else if (error.message.includes('username_exists')) {
        return { success: false, error: 'This username is already taken.' };
      } else if (error.message.includes('invalid_email')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      
      return { success: false, error: error.message || 'Signup failed. Please try again.' };
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
      if (!state.user?.id) {
        return { success: false, error: 'No user logged in.' };
      }

      // Update customer using WooCommerce API
      const response = await fetch(`${storeConfig.woocommerce.baseUrl}/wp-json/wc/v3/customers/${state.user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Basic ' + btoa(`${storeConfig.woocommerce.consumerKey}:${storeConfig.woocommerce.consumerSecret}`),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      const customer = await response.json();
      
      const updatedUser = {
        ...state.user,
        ...customer,
        avatar_url: customer.avatar_url || state.user.avatar_url,
      };

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: customer });
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message || 'Failed to update profile.' };
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
