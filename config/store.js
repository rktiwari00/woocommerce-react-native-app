// Store configuration for the WooCommerce Shopping App
// This file can be customized for different clients

export const storeConfig = {
  // Store Information
  storeName: 'Balleza Blue',
  storeDescription: 'Your one-stop shop for quality products',
  storeLogo: 'https://via.placeholder.com/200x80/2196F3/FFFFFF?text=Balleza+Blue',
  
  // WooCommerce API Configuration
  woocommerce: {
    baseUrl: 'https://ballezablue.com',
    consumerKey: 'ck_24d5a8f707a89d998a96f205bca6dde083c161fd',
    consumerSecret: 'cs_43de5fd3573b277a87de1741ec93a86cf556f2dc',
    version: 'wc/v3',
  },
  
  // Contact Information
  contact: {
    email: 'support@ballezablue.com',
    phone: '+1 (555) 123-4567',
    address: '123 Store Street, City, State 12345',
    website: 'https://ballezablue.com',
    whatsapp: '+15551234567',
  },
  
  // Social Media Links
  social: {
    facebook: 'https://facebook.com/ballezablue',
    instagram: 'https://instagram.com/ballezablue',
    twitter: 'https://twitter.com/ballezablue',
    youtube: 'https://youtube.com/ballezablue',
  },
  
  // App Features Configuration
  features: {
    enableReviews: false,
    enableWishlist: true,
    enableSearch: true,
    enableCategories: true,
    enableFilters: false,
    enableSorting: true,
    enablePushNotifications: true,
    enableLocationServices: true,
  },

  // Search & Filter Configuration
  searchFilters: {
    enablePriceRange: true, // slider or min/max inputs
    enableCategoriesFilter: true,
    enableAttributesFilter: true, // size, color, material, etc.
    enableStockStatusFilter: true,
    enableRatingFilter: false, // hide until reviews are enabled
    defaultSortOption: 'popularity', // 'popularity', 'price_low_high', etc.
  },
  
  // Payment Configuration
  payment: {
    currency: 'INR',
    currencySymbol: '₹',
    enableStripe: false,
    enablePayPal: false,
    enableCashOnDelivery: true,
    enableBankTransfer: false,
  },
  
  // Shipping Configuration
  shipping: {
    enableFreeShipping: true,
    freeShippingThreshold: 50, // Minimum order amount for free shipping
    defaultShippingCost: 5.99,
    enableLocalPickup: true,
  },
  
  // App Settings
  app: {
    enableGuestCheckout: true,
    requireAccountForPurchase: false,
    enableOrderTracking: true,
    enableOrderHistory: true,
    enableSavePaymentMethods: false,
    enableAutoLogin: true,
  },
  
  // Content Configuration
  content: {
    welcomeMessage: 'Welcome to Balleza Blue!',
    aboutUs: 'We are committed to providing the best shopping experience.',
    termsAndConditions: 'https://ballezablue.com/terms',
    privacyPolicy: 'https://ballezablue.com/privacy',
    returnPolicy: 'https://ballezablue.com/returns',
  },
};

export default storeConfig;
