import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Card, Button, Divider, IconButton, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../../contexts/CartContext';
import { theme } from '../../config/theme';
import { storeConfig } from '../../config/store';

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getShippingCost,
    getTotalWithShipping,
    isFreeShipping,
    clearCart,
  } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => removeFromCart(productId), style: 'destructive' },
      ]
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add some items to your cart before checkout.');
      return;
    }
    router.push('/checkout');
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          onPress: () => {
            console.log('Clearing cart, current items:', items.length);
            clearCart();
            console.log('Cart cleared');
          }, 
          style: 'destructive' 
        },
      ],
      { cancelable: true }
    );
  };

  const renderCartItem = (item) => (
    <Surface key={item.id} style={styles.cartItem} elevation={2}>
      <View style={styles.cartItemContent}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/80x80' }}
          style={styles.itemImage}
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.priceContainer}>
            {item.sale_price && (
              <Text style={styles.regularPrice}>
                {storeConfig.payment.currencySymbol}{item.regular_price}
              </Text>
            )}
            <Text style={styles.itemPrice}>
              {storeConfig.payment.currencySymbol}{item.sale_price || item.price}
            </Text>
          </View>
          <View style={styles.quantityContainer}>
            <IconButton
              icon="minus"
              size={20}
              onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            />
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
            />
          </View>
        </View>
        <View style={styles.itemActions}>
          <Text style={styles.itemTotal}>
            {storeConfig.payment.currencySymbol}
            {((item.sale_price || item.price) * item.quantity).toFixed(2)}
          </Text>
          <IconButton
            icon="delete"
            size={20}
            iconColor={theme.error}
            onPress={() => handleRemoveItem(item.id)}
          />
        </View>
      </View>
    </Surface>
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color={theme.textSecondary} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Add some products to your cart to get started
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)')}
          style={styles.continueShoppingButton}
        >
          Continue Shopping
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Cart Items */}
        <View style={styles.cartItemsContainer}>
          {items.map((item) => renderCartItem(item))}
        </View>

        {/* Order Summary */}
        <Surface style={styles.summaryCard} elevation={3}>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <Divider style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {storeConfig.payment.currencySymbol}{getCartTotal().toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={[styles.summaryValue, isFreeShipping() && styles.freeShipping]}>
                {isFreeShipping() ? 'FREE' : `${storeConfig.payment.currencySymbol}${getShippingCost().toFixed(2)}`}
              </Text>
            </View>
            
            {isFreeShipping() && (
              <Text style={styles.freeShippingText}>
                Free shipping on orders over {storeConfig.payment.currencySymbol}{storeConfig.shipping.freeShippingThreshold}
              </Text>
            )}
            
            <Divider style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {storeConfig.payment.currencySymbol}{getTotalWithShipping().toFixed(2)}
              </Text>
            </View>
          </View>
        </Surface>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={handleClearCart}
            style={styles.clearCartButton}
            textColor={theme.error}
          >
            Clear Cart
          </Button>
          <Button
            mode="contained"
            onPress={handleCheckout}
            style={styles.checkoutButton}
            contentStyle={styles.checkoutButtonContent}
          >
            Proceed to Checkout
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  continueShoppingButton: {
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  cartItemsContainer: {
    padding: theme.spacing.md,
  },
  cartItem: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.card,
  },
  cartItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  regularPrice: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: theme.spacing.xs,
  },
  itemPrice: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'bold',
    color: theme.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    marginHorizontal: theme.spacing.sm,
    minWidth: 30,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: theme.spacing.xs,
  },
  summaryCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.card,
  },
  summaryContent: {
    padding: theme.spacing.lg,
  },
  summaryTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: theme.spacing.md,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: theme.spacing.xs,
  },
  summaryLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.textSecondary,
  },
  summaryValue: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  freeShipping: {
    color: theme.success,
    fontWeight: 'bold',
  },
  freeShippingText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.success,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  totalLabel: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.text,
  },
  totalValue: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.primary,
  },
  actionButtons: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  clearCartButton: {
    borderRadius: theme.borderRadius.lg,
    borderColor: theme.error,
  },
  checkoutButton: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.primary,
  },
  checkoutButtonContent: {
    paddingVertical: theme.spacing.sm,
  },
});