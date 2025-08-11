import axios from 'axios';
import { storeConfig } from '../config/store';

// Create axios instance with WooCommerce API configuration
const woocommerceAPI = axios.create({
  baseURL: `${storeConfig.woocommerce.baseUrl}/wp-json/${storeConfig.woocommerce.version}`,
  auth: {
    username: storeConfig.woocommerce.consumerKey,
    password: storeConfig.woocommerce.consumerSecret,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsAPI = {
  // Get all products
  getProducts: async (params = {}) => {
    try {
      const response = await woocommerceAPI.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID
  getProduct: async (id) => {
    try {
      const response = await woocommerceAPI.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await woocommerceAPI.get('/products', {
        params: {
          ...params,
          category: categoryId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (searchTerm, params = {}) => {
    try {
      const response = await woocommerceAPI.get('/products', {
        params: {
          ...params,
          search: searchTerm,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (params = {}) => {
    try {
      const response = await woocommerceAPI.get('/products', {
        params: {
          ...params,
          featured: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get on-sale products
  getOnSaleProducts: async (params = {}) => {
    try {
      const response = await woocommerceAPI.get('/products', {
        params: {
          ...params,
          on_sale: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching on-sale products:', error);
      throw error;
    }
  },

  // Get variations for a variable product
  getProductVariations: async (productId, params = {}) => {
    try {
      const response = await woocommerceAPI.get(`/products/${productId}/variations`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching product variations:', error);
      throw error;
    }
  },
};

// Categories API
export const categoriesAPI = {
  // Get all categories
  getCategories: async (params = {}) => {
    try {
      const response = await woocommerceAPI.get('/products/categories', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get single category by ID
  getCategory: async (id) => {
    try {
      const response = await woocommerceAPI.get(`/products/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },
};

// Orders API
export const ordersAPI = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await woocommerceAPI.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get order by ID
  getOrder: async (id) => {
    try {
      const response = await woocommerceAPI.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Get customer orders
  getCustomerOrders: async (customerId, params = {}) => {
    try {
      const response = await woocommerceAPI.get('/orders', {
        params: {
          ...params,
          customer: customerId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  },
};

// Customers API
export const customersAPI = {
  // Create new customer
  createCustomer: async (customerData) => {
    try {
      const response = await woocommerceAPI.post('/customers', customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Get customer by ID
  getCustomer: async (id) => {
    try {
      const response = await woocommerceAPI.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    try {
      const response = await woocommerceAPI.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },
};

// Reviews API
export const reviewsAPI = {
  // Get product reviews
  getProductReviews: async (productId, params = {}) => {
    try {
      const response = await woocommerceAPI.get('/products/reviews', {
        params: {
          ...params,
          product: productId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },

  // Create product review
  createReview: async (reviewData) => {
    try {
      const response = await woocommerceAPI.post('/products/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },
};

export default woocommerceAPI;
