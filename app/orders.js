
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Card, Title, Paragraph, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/woocommerce';
import { theme } from '../config/theme';
import { storeConfig } from '../config/store';

export default function OrdersScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadOrders();
    }
  }, [isAuthenticated, user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await ordersAPI.getCustomerOrders(user.id, {
        per_page: 50,
        orderby: 'date',
        order: 'desc',
      });
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return theme.success;
      case 'processing':
        return theme.warning;
      case 'pending':
        return theme.info;
      case 'cancelled':
      case 'failed':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderOrderItem = (order) => (
    <Card key={order.id} style={styles.orderCard}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Title style={styles.orderNumber}>Order #{order.number}</Title>
            <Paragraph style={styles.orderDate}>
              {formatDate(order.date_created)}
            </Paragraph>
          </View>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getStatusColor(order.status) }]}
            textStyle={{ color: getStatusColor(order.status) }}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Chip>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.orderTotal}>
            Total: {storeConfig.payment.currencySymbol}{parseFloat(order.total).toFixed(2)}
          </Text>
          <Text style={styles.itemCount}>
            {order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.orderItems}>
          {order.line_items.slice(0, 2).map((item, index) => (
            <Text key={index} style={styles.itemName}>
              • {item.name} x{item.quantity}
            </Text>
          ))}
          {order.line_items.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.line_items.length - 2} more item{order.line_items.length - 2 !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        <Button
          mode="outlined"
          onPress={() => router.push(`/order/${order.id}`)}
          style={styles.viewButton}
          compact
        >
          View Details
        </Button>
      </Card.Content>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.notAuthenticatedContainer}>
        <Ionicons name="person" size={80} color={theme.textSecondary} />
        <Title style={styles.notAuthenticatedTitle}>Sign In Required</Title>
        <Paragraph style={styles.notAuthenticatedText}>
          Please sign in to view your order history
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
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.screenTitle}>My Orders</Title>
        <Paragraph style={styles.subtitle}>
          Track and manage your orders
        </Paragraph>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color={theme.textSecondary} />
          <Title style={styles.emptyTitle}>No Orders Yet</Title>
          <Paragraph style={styles.emptyText}>
            You haven't placed any orders yet. Start shopping to see your orders here.
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
        <View style={styles.ordersList}>
          {orders.map(renderOrderItem)}
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
  ordersList: {
    padding: theme.spacing.md,
  },
  orderCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  orderDate: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  statusChip: {
    marginLeft: theme.spacing.sm,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  itemCount: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  orderItems: {
    marginBottom: theme.spacing.md,
  },
  itemName: {
    color: theme.text,
    fontSize: 14,
    marginBottom: 2,
  },
  moreItems: {
    color: theme.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  viewButton: {
    alignSelf: 'flex-start',
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
