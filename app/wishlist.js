
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, IconButton } from 'react-native-paper';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { productsAPI } from '../services/woocommerce';
import { theme } from '../config/theme';
import { storeConfig } from '../config/store';

export default function WishlistScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const wishlistData = await AsyncStorage.getItem('wishlist');
      if (wishlistData) {
        const wishlistIds = JSON.parse(wishlistData);
        
        if (wishlistIds.length > 0) {
          // Load product details for wishlist items
          const products = await Promise.all(
            wishlistIds.map(id => productsAPI.getProduct(id))
          );
          setWishlistItems(products.filter(product => product !== null));
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const wishlistData = await AsyncStorage.getItem('wishlist');
      const wishlistIds = wishlistData ? JSON.parse(wishlistData) : [];
      const updatedWishlist = wishlistIds.filter(id => id !== productId);
      
      await AsyncStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      
      Alert.alert('Removed', 'Product removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCartFromWishlist = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.images?.[0]?.src || 'https://via.placeholder.com/200',
      quantity: 1,
    });
    Alert.alert('Success', 'Product added to cart');
  };

  const renderWishlistItem = (product) => (
    <Card key={product.id} style={styles.productCard}>
      <TouchableOpacity onPress={() => router.push(`/product/${product.id}`)}>
        <View style={styles.productContent}>
          <Image
            source={{ uri: product.images?.[0]?.src || 'https://via.placeholder.com/100' }}
            style={styles.productImage}
            contentFit="cover"
          />
          
          <View style={styles.productInfo}>
            <Title style={styles.productName} numberOfLines={2}>
              {product.name}
            </Title>
            
            <View style={styles.priceContainer}>
              {product.sale_price && product.sale_price !== product.price && (
                <Text style={styles.originalPrice}>
                  {storeConfig.payment.currencySymbol}{product.price}
                </Text>
              )}
              <Text style={styles.price}>
                {storeConfig.payment.currencySymbol}{product.sale_price || product.price}
              </Text>
            </View>
            
            {product.stock_status === 'outofstock' ? (
              <Text style={styles.outOfStock}>Out of Stock</Text>
            ) : (
              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  onPress={() => addToCartFromWishlist(product)}
                  style={styles.addToCartButton}
                  compact
                >
                  Add to Cart
                </Button>
              </View>
            )}
          </View>
          
          <IconButton
            icon="heart"
            iconColor={theme.error}
            size={24}
            onPress={() => removeFromWishlist(product.id)}
            style={styles.removeButton}
          />
        </View>
      </TouchableOpacity>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.notAuthenticatedContainer}>
        <Ionicons name="heart-outline" size={80} color={theme.textSecondary} />
        <Title style={styles.notAuthenticatedTitle}>Sign In Required</Title>
        <Paragraph style={styles.notAuthenticatedText}>
          Please sign in to view your wishlist
        </Paragraph>
        <Button
          mode="contained"
          onPress={() => router.push('/login')}
          style={styles.signInButton}
        >
          Sign In
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading your wishlist...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.screenTitle}>My Wishlist</Title>
        <Paragraph style={styles.subtitle}>
          Your favorite products saved for later
        </Paragraph>
      </View>

      {wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color={theme.textSecondary} />
          <Title style={styles.emptyTitle}>Your Wishlist is Empty</Title>
          <Paragraph style={styles.emptyText}>
            Save products to your wishlist by tapping the heart icon while browsing.
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => router.push('/(tabs)')}
            style={styles.shopButton}
          >
            Start Shopping
          </Button>
        </View>
      ) : (
        <View style={styles.wishlistContainer}>
          <Text style={styles.itemCount}>
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
          </Text>
          {wishlistItems.map(renderWishlistItem)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.surface,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
  },
  subtitle: {
    color: theme.textSecondary,
    marginTop: 4,
  },
  wishlistContainer: {
    padding: theme.spacing.md,
  },
  itemCount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: theme.spacing.md,
  },
  productCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
  },
  productContent: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: theme.spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primary,
  },
  originalPrice: {
    fontSize: 16,
    color: theme.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: theme.spacing.sm,
  },
  outOfStock: {
    color: theme.error,
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  addToCartButton: {
    borderRadius: theme.borderRadius.md,
  },
  removeButton: {
    margin: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.background,
  },
  emptyTitle: {
    marginTop: theme.spacing.lg,
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: theme.spacing.md,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  shopButton: {
    marginTop: theme.spacing.lg,
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.background,
  },
  notAuthenticatedTitle: {
    marginTop: theme.spacing.lg,
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
  },
  notAuthenticatedText: {
    marginTop: theme.spacing.md,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  signInButton: {
    marginTop: theme.spacing.lg,
  },
});
