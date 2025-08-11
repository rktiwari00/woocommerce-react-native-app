# WooCommerce Shopping App

A comprehensive React Native Expo app for online shopping stores that integrates with WooCommerce API. This app provides a complete e-commerce solution with customizable themes, store configurations, and modern UI/UX.

## Features

### 🛍️ Core Shopping Features
- **Product Catalog**: Browse products with categories and search
- **Product Details**: Detailed product pages with images, descriptions, and reviews
- **Shopping Cart**: Add/remove items, quantity management, cart persistence
- **Checkout Process**: Complete checkout with shipping and payment options
- **Order Management**: Place orders and track order history

### 🎨 Customization Features
- **Theme System**: Fully customizable color schemes and styling
- **Store Configuration**: Easy store branding and settings management
- **Multi-Store Support**: Configure for different client stores
- **Localization Ready**: Support for multiple languages and currencies

### 📱 Modern UI/UX
- **Responsive Design**: Works on all screen sizes
- **Material Design**: Modern UI components with React Native Paper
- **Smooth Navigation**: Tab-based navigation with stack navigation
- **Loading States**: Skeleton screens and loading indicators
- **Pull-to-Refresh**: Refresh data with pull gestures

### 🔧 Technical Features
- **Expo SDK 53**: Latest Expo framework with modern features
- **Expo Router**: File-based routing system
- **State Management**: Context API for cart and app state
- **API Integration**: Complete WooCommerce REST API integration
- **Offline Support**: Cart persistence with AsyncStorage
- **Performance**: Optimized for smooth performance

## Prerequisites

- Node.js (v18 or higher)
- Bun (recommended) or npm
- Expo CLI (latest)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd woocommerce-react-native-expo-app
   ```

2. **Install dependencies**
   ```bash
   # Using Bun (recommended)
   bun install
   
   # Or using npm
   npm install
   ```

3. **Configure your WooCommerce store**
   
   Edit `config/store.js` and update the following:
   ```javascript
   export const storeConfig = {
     // Store Information
     storeName: 'Your Store Name',
     storeDescription: 'Your store description',
     storeLogo: 'https://your-store.com/logo.png',
     
     // WooCommerce API Configuration
     woocommerce: {
       baseUrl: 'https://your-store.com', // Your WooCommerce store URL
       consumerKey: 'ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Your consumer key
       consumerSecret: 'cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Your consumer secret
       version: 'wc/v3',
     },
     
     // Contact Information
     contact: {
       email: 'support@yourstore.com',
       phone: '+1 (555) 123-4567',
       address: 'Your store address',
       website: 'https://yourstore.com',
       whatsapp: '+15551234567',
     },
     
     // Social Media Links
     social: {
       facebook: 'https://facebook.com/yourstore',
       instagram: 'https://instagram.com/yourstore',
       twitter: 'https://twitter.com/yourstore',
       youtube: 'https://youtube.com/yourstore',
     },
   };
   ```

4. **Customize the theme** (optional)
   
   Edit `config/theme.js` to match your brand colors:
   ```javascript
   export const theme = {
     primary: '#2196F3', // Your primary color
     secondary: '#FF9800', // Your secondary color
     // ... other theme properties
   };
   ```

## Getting WooCommerce API Keys

1. Go to your WordPress admin panel
2. Navigate to **WooCommerce > Settings > Advanced > REST API**
3. Click **Add Key**
4. Set permissions to **Read/Write**
5. Copy the **Consumer Key** and **Consumer Secret**
6. Update the `config/store.js` file with these keys

## Running the App

### Development Mode
```bash
# Start the development server
bun run start
# or
npx expo start
```

### Platform Specific
```bash
# Android
bun run android
# or
npx expo start --android

# iOS
bun run ios
# or
npx expo start --ios

# Web
bun run web
# or
npx expo start --web
```

### Building for Production
```bash
# Prebuild the app
bun run prebuild

# Build for Android
bun run build:android

# Build for iOS
bun run build:ios
```

## Project Structure

```
woocommerce-react-native-expo-app/
├── app/                          # Expo Router pages
│   ├── _layout.js               # Root layout
│   ├── index.js                 # Entry point
│   ├── (tabs)/                  # Tab navigation
│   │   ├── _layout.js           # Tab layout
│   │   ├── home.js              # Home screen
│   │   ├── categories.js        # Categories screen
│   │   ├── search.js            # Search screen
│   │   ├── cart.js              # Cart screen
│   │   └── profile.js           # Profile screen
│   ├── product/[id].js          # Product detail screen
│   └── checkout.js              # Checkout screen
├── config/                      # Configuration files
│   ├── theme.js                 # Theme configuration
│   └── store.js                 # Store configuration
├── contexts/                    # React Context providers
│   └── CartContext.js           # Cart state management
├── services/                    # API services
│   └── woocommerce.js           # WooCommerce API integration
├── assets/                      # Static assets
├── package.json                 # Dependencies and scripts
├── app.json                     # Expo configuration
└── README.md                    # This file
```

## Customization Guide

### Adding New Features

1. **New Screens**: Add files in the `app/` directory following Expo Router conventions
2. **New API Endpoints**: Extend the `services/woocommerce.js` file
3. **New Components**: Create reusable components in a `components/` directory
4. **New Contexts**: Add state management in the `contexts/` directory

### Theme Customization

The theme system supports:
- Color schemes (primary, secondary, background, text, etc.)
- Typography (font sizes, weights, families)
- Spacing (margins, padding, gaps)
- Border radius
- Shadows and elevations

### Store Configuration

The store configuration supports:
- Store information (name, description, logo)
- WooCommerce API settings
- Contact information
- Social media links
- Feature toggles
- Payment and shipping settings
- App-specific settings

## API Endpoints Used

The app integrates with the following WooCommerce REST API endpoints:

- `GET /wp-json/wc/v3/products` - Get products
- `GET /wp-json/wc/v3/products/{id}` - Get single product
- `GET /wp-json/wc/v3/products/categories` - Get categories
- `GET /wp-json/wc/v3/orders` - Get orders
- `POST /wp-json/wc/v3/orders` - Create order
- `GET /wp-json/wc/v3/customers` - Get customers
- `POST /wp-json/wc/v3/customers` - Create customer
- `GET /wp-json/wc/v3/products/reviews` - Get product reviews

## Troubleshooting

### Common Issues

1. **API Connection Error**
   - Verify your WooCommerce API keys are correct
   - Ensure your store URL is accessible
   - Check if WooCommerce REST API is enabled

2. **Build Errors**
   - Clear cache: `bun run start --clear`
   - Delete node_modules and reinstall: `rm -rf node_modules && bun install`

3. **Navigation Issues**
   - Ensure all route files exist in the correct locations
   - Check for proper file naming conventions

4. **Performance Issues**
   - Enable Hermes engine in app.json
   - Optimize images and assets
   - Use proper loading states

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact: support@yourstore.com
- Documentation: [Link to documentation]

## Changelog

### Version 1.0.0
- Initial release
- Complete e-commerce functionality
- WooCommerce API integration
- Customizable themes and store configuration
- Modern UI/UX with Material Design
- Cross-platform support (iOS, Android, Web)
