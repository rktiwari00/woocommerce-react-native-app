# Package Dependencies Notes

## Expo SDK 53 Specific Packages

- `expo-background-task`: ~1.0.0 - New in SDK 53, allows background task execution
- `expo-audio`: ~1.0.0 - Replaces expo-av, provides audio playback capabilities
- `react-native-maps`: 1.12.0 - Compatible with SDK 53's New Architecture

## Key Dependencies

### Navigation
- `expo-router`: ~4.0.0 - File-based routing for Expo
- `@react-navigation/*`: React Navigation components for tab and stack navigation

### UI Components
- `react-native-paper`: Material Design components
- `react-native-elements`: Additional UI components
- `@expo/vector-icons`: Icon library

### State Management & Storage
- `@react-native-async-storage/async-storage`: Local storage
- `expo-secure-store`: Secure storage for sensitive data

### API & Networking
- `axios`: HTTP client for WooCommerce API calls

### UI Enhancements
- `react-native-image-slider-box`: Image carousel/slider
- `react-native-super-grid`: Grid layout component
- `react-native-skeleton-placeholder`: Loading placeholders
- `react-native-shimmer-placeholder`: Shimmer loading effects

## Package Manager

Using `npm@10.0.0` for reliable package management.

## Installation

```bash
npm install
```

## Development

```bash
npm start
```
