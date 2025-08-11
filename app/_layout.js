import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { CartProvider } from '../contexts/CartContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { theme as appTheme } from '../config/theme';
import { storeConfig } from '../config/store';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const paperTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: appTheme.primary,
      secondary: appTheme.secondary,
      background: appTheme.background,
      surface: appTheme.card,
      onSurface: appTheme.text,
      error: appTheme.error,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: appTheme.primary,
                  },
                  headerTintColor: appTheme.textLight,
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                  headerShown: false,
                }}
              >
                <Stack.Screen
                  name="index"
                  options={{
                    title: storeConfig.storeName,
                  }}
                />
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="product/[id]"
                  options={{
                    title: 'Product Details',
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="checkout"
                  options={{
                    title: 'Checkout',
                    headerShown: true,
                  }}
                />
                <Stack.Screen name="login" options={{ title: 'Sign In' }} />
                <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="light" />
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}