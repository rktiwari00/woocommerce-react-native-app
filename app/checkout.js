import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Card, Button, TextInput, RadioButton, Divider, List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../contexts/CartContext';
import { ordersAPI } from '../services/woocommerce';
import { theme } from '../config/theme';
import { storeConfig } from '../config/store';

export default function CheckoutScreen() {
  const router = useRouter();
  const {
    items,
    getCartTotal,
    getShippingCost,
    getTotalWithShipping,
    isFreeShipping,
    clearCart,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const shippingMethods = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      cost: storeConfig.shipping.defaultShippingCost,
      time: '3-5 business days',
    },
    {
      id: 'express',
      name: 'Express Shipping',
      cost: storeConfig.shipping.defaultShippingCost + 5,
      time: '1-2 business days',
    },
    {
      id: 'pickup',
      name: 'Local Pickup',
      cost: 0,
      time: 'Same day',
    },
  ];

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: 'cash',
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Transfer money to our bank account',
      icon: 'card',
    },
  ];

  const handleInputChange = (field, value) => {
    setBillingInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode'];
    for (const field of requiredFields) {
      if (!billingInfo[field].trim()) {
        Alert.alert('Error', `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const orderData = {
        payment_method: paymentMethod,
        payment_method_title: paymentMethods.find(pm => pm.id === paymentMethod)?.name,
        set_paid: false,
        billing: {
          first_name: billingInfo.firstName,
          last_name: billingInfo.lastName,
          address_1: billingInfo.address,
          city: billingInfo.city,
          state: billingInfo.state,
          postcode: billingInfo.zipCode,
          country: billingInfo.country || 'US',
          email: billingInfo.email,
          phone: billingInfo.phone,
        },
        shipping: {
          first_name: billingInfo.firstName,
          last_name: billingInfo.lastName,
          address_1: billingInfo.address,
          city: billingInfo.city,
          state: billingInfo.state,
          postcode: billingInfo.zipCode,
          country: billingInfo.country || 'US',
        },
        line_items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        shipping_lines: [
          {
            method_id: shippingMethod,
            method_title: shippingMethods.find(sm => sm.id === shippingMethod)?.name,
            total: shippingMethod === 'pickup' ? '0' : shippingMethods.find(sm => sm.id === shippingMethod)?.cost.toString(),
          },
        ],
      };

      const order = await ordersAPI.createOrder(orderData);
      
      Alert.alert(
        'Order Placed Successfully!',
        `Your order #${order.id} has been placed. You will receive a confirmation email shortly.`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              router.push('/(tabs)');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getShippingCostForMethod = () => {
    const method = shippingMethods.find(sm => sm.id === shippingMethod);
    return method ? method.cost : 0;
  };

  const getTotalWithShippingMethod = () => {
    return getCartTotal() + getShippingCostForMethod();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Order Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  {storeConfig.payment.currencySymbol}
                  {((item.sale_price || item.price) * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            <Divider style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {storeConfig.payment.currencySymbol}{getCartTotal().toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Shipping Method */}
        <Card style={styles.methodCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Shipping Method</Text>
            <RadioButton.Group onValueChange={setShippingMethod} value={shippingMethod}>
              {shippingMethods.map((method) => (
                <RadioButton.Item
                  key={method.id}
                  label={`${method.name} - ${method.time}`}
                  description={`${storeConfig.payment.currencySymbol}${method.cost.toFixed(2)}`}
                  value={method.id}
                  style={styles.radioItem}
                />
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Billing Information */}
        <Card style={styles.billingCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Billing Information</Text>
            
            <View style={styles.row}>
              <TextInput
                label="First Name"
                value={billingInfo.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                style={styles.halfInput}
                mode="outlined"
              />
              <TextInput
                label="Last Name"
                value={billingInfo.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                style={styles.halfInput}
                mode="outlined"
              />
            </View>

            <TextInput
              label="Email"
              value={billingInfo.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              mode="outlined"
              style={styles.fullInput}
            />

            <TextInput
              label="Phone"
              value={billingInfo.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.fullInput}
            />

            <TextInput
              label="Address"
              value={billingInfo.address}
              onChangeText={(text) => handleInputChange('address', text)}
              mode="outlined"
              style={styles.fullInput}
              multiline
            />

            <View style={styles.row}>
              <TextInput
                label="City"
                value={billingInfo.city}
                onChangeText={(text) => handleInputChange('city', text)}
                style={styles.halfInput}
                mode="outlined"
              />
              <TextInput
                label="State"
                value={billingInfo.state}
                onChangeText={(text) => handleInputChange('state', text)}
                style={styles.halfInput}
                mode="outlined"
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="ZIP Code"
                value={billingInfo.zipCode}
                onChangeText={(text) => handleInputChange('zipCode', text)}
                keyboardType="numeric"
                style={styles.halfInput}
                mode="outlined"
              />
              <TextInput
                label="Country"
                value={billingInfo.country}
                onChangeText={(text) => handleInputChange('country', text)}
                style={styles.halfInput}
                mode="outlined"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Payment Method */}
        <Card style={styles.paymentCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <RadioButton.Group onValueChange={setPaymentMethod} value={paymentMethod}>
              {paymentMethods.map((method) => (
                <RadioButton.Item
                  key={method.id}
                  label={method.name}
                  description={method.description}
                  value={method.id}
                  style={styles.radioItem}
                />
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Final Total */}
        <Card style={styles.finalTotalCard}>
          <Card.Content>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {storeConfig.payment.currencySymbol}{getCartTotal().toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={styles.totalValue}>
                {storeConfig.payment.currencySymbol}{getShippingCostForMethod().toFixed(2)}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.finalTotalLabel}>Total</Text>
              <Text style={styles.finalTotalValue}>
                {storeConfig.payment.currencySymbol}{getTotalWithShippingMethod().toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.placeOrderContainer}>
        <Button
          mode="contained"
          onPress={handlePlaceOrder}
          loading={loading}
          disabled={loading || items.length === 0}
          style={styles.placeOrderButton}
          contentStyle={styles.placeOrderButtonContent}
        >
          Place Order
        </Button>
      </View>
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
  summaryCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  methodCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  billingCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  paymentCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  finalTotalCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: theme.spacing.md,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  itemQuantity: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.textSecondary,
  },
  itemPrice: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: 'bold',
    color: theme.primary,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: theme.spacing.xs,
  },
  totalLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.textSecondary,
  },
  totalValue: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.text,
  },
  finalTotalLabel: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.text,
  },
  finalTotalValue: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.primary,
  },
  radioItem: {
    paddingVertical: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  fullInput: {
    marginBottom: theme.spacing.sm,
  },
  placeOrderContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  placeOrderButton: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.primary,
  },
  placeOrderButtonContent: {
    paddingVertical: theme.spacing.sm,
  },
});
