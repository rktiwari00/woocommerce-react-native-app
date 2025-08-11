
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  ActivityIndicator,
  FAB,
  List,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { customersAPI } from '../services/woocommerce';
import { theme } from '../config/theme';

export default function AddressesScreen() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [addresses, setAddresses] = useState({
    billing: null,
    shipping: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadAddresses();
    }
  }, [isAuthenticated, user]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const customer = await customersAPI.getCustomer(user.id);
      setAddresses({
        billing: customer.billing,
        shipping: customer.shipping,
      });
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const isAddressComplete = (address) => {
    if (!address) return false;
    return !!(
      address.first_name &&
      address.last_name &&
      address.address_1 &&
      address.city &&
      address.postcode &&
      address.country
    );
  };

  const formatAddress = (address) => {
    if (!address || !isAddressComplete(address)) return null;
    
    return [
      `${address.first_name} ${address.last_name}`,
      address.company,
      address.address_1,
      address.address_2,
      `${address.city}, ${address.state} ${address.postcode}`,
      address.country,
    ].filter(Boolean).join('\n');
  };

  const handleEditAddress = (type) => {
    // In a real app, you'd navigate to an address editing screen
    Alert.alert(
      'Edit Address',
      `Would you like to edit your ${type} address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Edit', 
          onPress: () => {
            // This would navigate to address editing screen
            Alert.alert('Info', 'Address editing feature coming soon!');
          }
        },
      ]
    );
  };

  const handleAddAddress = () => {
    Alert.alert(
      'Add Address',
      'Would you like to add a new address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: () => {
            // This would navigate to address adding screen
            Alert.alert('Info', 'Add address feature coming soon!');
          }
        },
      ]
    );
  };

  const renderAddressCard = (type, address) => {
    const isComplete = isAddressComplete(address);
    const formattedAddress = formatAddress(address);
    
    return (
      <Card key={type} style={styles.addressCard}>
        <Card.Content>
          <View style={styles.addressHeader}>
            <Title style={styles.addressTitle}>
              {type === 'billing' ? 'Billing Address' : 'Shipping Address'}
            </Title>
            <Ionicons 
              name={type === 'billing' ? 'card' : 'location'} 
              size={24} 
              color={theme.primary} 
            />
          </View>
          
          {isComplete && formattedAddress ? (
            <View>
              <Text style={styles.addressText}>{formattedAddress}</Text>
              {address.phone && (
                <Text style={styles.phoneText}>Phone: {address.phone}</Text>
              )}
              {address.email && (
                <Text style={styles.emailText}>Email: {address.email}</Text>
              )}
            </View>
          ) : (
            <View style={styles.noAddressContainer}>
              <Ionicons name="location-outline" size={50} color={theme.textSecondary} />
              <Paragraph style={styles.noAddressText}>
                No {type} address added yet
              </Paragraph>
            </View>
          )}
          
          <Button
            mode="outlined"
            onPress={() => handleEditAddress(type)}
            style={styles.editButton}
          >
            {isComplete ? 'Edit Address' : 'Add Address'}
          </Button>
        </Card.Content>
      </Card>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.notAuthenticatedContainer}>
        <Ionicons name="location-outline" size={80} color={theme.textSecondary} />
        <Title style={styles.notAuthenticatedTitle}>Sign In Required</Title>
        <Paragraph style={styles.notAuthenticatedText}>
          Please sign in to manage your addresses
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
        <Text style={styles.loadingText}>Loading your addresses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Title style={styles.screenTitle}>My Addresses</Title>
          <Paragraph style={styles.subtitle}>
            Manage your billing and shipping addresses
          </Paragraph>
        </View>

        <View style={styles.addressesContainer}>
          {renderAddressCard('billing', addresses.billing)}
          {renderAddressCard('shipping', addresses.shipping)}
          
          {/* Address Management Tips */}
          <Card style={styles.tipsCard}>
            <Card.Content>
              <Title style={styles.tipsTitle}>Address Tips</Title>
              <List.Section>
                <List.Item
                  title="Double-check your details"
                  description="Make sure your address is complete and accurate"
                  left={(props) => <List.Icon {...props} icon="check-circle" />}
                />
                <Divider />
                <List.Item
                  title="Use different addresses"
                  description="You can have different billing and shipping addresses"
                  left={(props) => <List.Icon {...props} icon="map-marker" />}
                />
                <Divider />
                <List.Item
                  title="Keep them updated"
                  description="Update your addresses when you move or change details"
                  left={(props) => <List.Icon {...props} icon="update" />}
                />
              </List.Section>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddAddress}
        label="Add Address"
      />
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
  addressesContainer: {
    padding: theme.spacing.md,
  },
  addressCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  addressText: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  phoneText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: theme.spacing.md,
  },
  noAddressContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  noAddressText: {
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  tipsCard: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    elevation: 1,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: theme.spacing.sm,
  },
  fab: {
    position: 'absolute',
    margin: theme.spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: theme.primary,
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
