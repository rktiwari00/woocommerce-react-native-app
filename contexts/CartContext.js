import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeConfig } from '../config/store';

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      console.log('CLEAR_CART action dispatched');
      return {
        ...state,
        items: [],
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
      };

    default:
      return state;
  }
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
  });

  // Load cart from AsyncStorage on app start
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    saveCart();
  }, [state.items]);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      regular_price: product.regular_price,
      sale_price: product.sale_price,
      image: product.images?.[0]?.src || '',
      quantity,
      stock_quantity: product.stock_quantity,
      variations: product.variations || [],
    };
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    }
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    // Force save empty cart to AsyncStorage
    AsyncStorage.setItem('cart', JSON.stringify([])).catch(error => {
      console.error('Error clearing cart from storage:', error);
    });
  };

  // Calculate cart totals
  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      const price = item.sale_price || item.price;
      return total + (parseFloat(price) * item.quantity);
    }, 0);
  };

  // Calculate cart count
  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  // Check if cart is empty
  const isCartEmpty = () => {
    return state.items.length === 0;
  };

  // Get shipping cost
  const getShippingCost = () => {
    const subtotal = getCartTotal();
    if (storeConfig.shipping.enableFreeShipping && subtotal >= storeConfig.shipping.freeShippingThreshold) {
      return 0;
    }
    return storeConfig.shipping.defaultShippingCost;
  };

  // Get total with shipping
  const getTotalWithShipping = () => {
    return getCartTotal() + getShippingCost();
  };

  // Check if free shipping applies
  const isFreeShipping = () => {
    const subtotal = getCartTotal();
    return storeConfig.shipping.enableFreeShipping && subtotal >= storeConfig.shipping.freeShippingThreshold;
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isCartEmpty,
    getShippingCost,
    getTotalWithShipping,
    isFreeShipping,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};