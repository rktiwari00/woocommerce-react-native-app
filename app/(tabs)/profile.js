import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Card, List, Switch, Divider, Button, Avatar, Title, Paragraph } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { theme } from '../../config/theme';
import { storeConfig } from '../../config/store';

export default function ProfileScreen() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    notificationSettings,
    updateNotificationSettings,
    getUnreadCount,
    sendOrderNotification,
    sendPromotionalNotification
  } = useNotification();
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleContactPress = (type) => {
    let url = '';
    switch (type) {
      case 'email':
        url = `mailto:${storeConfig.contact.email}`;
        break;
      case 'phone':
        url = `tel:${storeConfig.contact.phone}`;
        break;
      case 'whatsapp':
        url = `whatsapp://send?phone=${storeConfig.contact.whatsapp}`;
        break;
      case 'website':
        url = storeConfig.contact.website;
        break;
      default:
        return;
    }

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    });
  };

  const handleSocialPress = (platform) => {
    const url = storeConfig.social[platform];
    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open this link');
        }
      });
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            clearCart();
            logout();
            Alert.alert('Success', 'You have been logged out');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'My Orders',
      icon: 'receipt-outline',
      onPress: () => router.push('/orders'),
    },
    {
      title: 'Wishlist',
      icon: 'heart-outline',
      onPress: () => router.push('/wishlist'),
    },
    {
      title: 'Addresses',
      icon: 'location-outline',
      onPress: () => router.push('/addresses'),
    },
    {
      title: 'Payment Methods',
      icon: 'card-outline',
      onPress: () => router.push('/payment-methods'),
    },
  ];

  const supportItems = [
    {
      title: 'Help Center',
      icon: 'help-circle-outline',
      onPress: () => router.push('/help'),
    },
    {
      title: 'Terms & Conditions',
      icon: 'document-text-outline',
      onPress: () => Linking.openURL(storeConfig.content.termsAndConditions),
    },
    {
      title: 'Privacy Policy',
      icon: 'shield-checkmark-outline',
      onPress: () => Linking.openURL(storeConfig.content.privacyPolicy),
    },
    {
      title: 'Return Policy',
      icon: 'refresh-outline',
      onPress: () => Linking.openURL(storeConfig.content.returnPolicy),
    },
  ];

  const testNotifications = () => {
    sendOrderNotification();
    sendPromotionalNotification();
  };

  return (
    <ScrollView style={styles.container}>
      {isAuthenticated ? (
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Icon
              size={80}
              icon="account"
              style={styles.avatar}
            />
            <Title style={styles.profileName}>
              {user?.first_name} {user?.last_name}
            </Title>
            <Paragraph style={styles.profileEmail}>{user?.email}</Paragraph>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Icon
              size={80}
              icon="account-plus"
              style={styles.avatar}
            />
            <Title style={styles.profileName}>Welcome Guest</Title>
            <Paragraph style={styles.profileEmail}>Sign in to access your account</Paragraph>
            <View style={styles.authButtons}>
              <Button
                mode="contained"
                onPress={() => router.push('/login')}
                style={styles.authButton}
              >
                Sign In
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push('/signup')}
                style={styles.authButton}
              >
                Sign Up
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <List.Section>
          <List.Subheader>Notifications</List.Subheader>
          <List.Item
            title="View Notifications"
            description={`${getUnreadCount()} unread notifications`}
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/notifications')}
          />
          <Divider />
          <List.Item
            title="Order Updates"
            description="Get notified about order status changes"
            left={(props) => <List.Icon {...props} icon="receipt" />}
            right={() => (
              <Switch
                value={notificationSettings.orderUpdates}
                onValueChange={(value) =>
                  updateNotificationSettings({ orderUpdates: value })
                }
              />
            )}
          />
          <List.Item
            title="Promotions"
            description="Receive promotional offers and deals"
            left={(props) => <List.Icon {...props} icon="percent" />}
            right={() => (
              <Switch
                value={notificationSettings.promotions}
                onValueChange={(value) =>
                  updateNotificationSettings({ promotions: value })
                }
              />
            )}
          />
          <List.Item
            title="New Products"
            description="Be first to know about new arrivals"
            left={(props) => <List.Icon {...props} icon="new-box" />}
            right={() => (
              <Switch
                value={notificationSettings.newProducts}
                onValueChange={(value) =>
                  updateNotificationSettings({ newProducts: value })
                }
              />
            )}
          />
          <Divider />
          <List.Item
            title="Test Notifications"
            description="Send sample notifications"
            left={(props) => <List.Icon {...props} icon="test-tube" />}
            onPress={testNotifications}
          />
        </List.Section>
      </Card>

      {/* Contact Information */}
      <Card style={styles.contactCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContactPress('email')}
            >
              <Ionicons name="mail" size={24} color={theme.primary} />
              <Text style={styles.contactButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContactPress('phone')}
            >
              <Ionicons name="call" size={24} color={theme.primary} />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContactPress('whatsapp')}
            >
              <Ionicons name="logo-whatsapp" size={24} color={theme.success} />
              <Text style={styles.contactButtonText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContactPress('website')}
            >
              <Ionicons name="globe" size={24} color={theme.primary} />
              <Text style={styles.contactButtonText}>Website</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Social Media */}
      <Card style={styles.socialCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialButtons}>
            {Object.keys(storeConfig.social).map((platform) => (
              <TouchableOpacity
                key={platform}
                style={styles.socialButton}
                onPress={() => handleSocialPress(platform)}
              >
                <Ionicons
                  name={`logo-${platform}`}
                  size={24}
                  color={theme.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Menu Items */}
      <Card style={styles.menuCard}>
        <Card.Content>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <List.Item
                title={item.title}
                left={(props) => (
                  <Ionicons name={item.icon} size={24} color={props.color || theme.text} />
                )}
                right={(props) => (
                  <Ionicons name="chevron-forward" size={24} color={props.color || theme.textSecondary} />
                )}
                onPress={item.onPress}
                style={styles.listItem}
              />
              {index < menuItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      {/* Support */}
      <Card style={styles.supportCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Support</Text>
          {supportItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <List.Item
                title={item.title}
                left={(props) => (
                  <Ionicons name={item.icon} size={24} color={props.color || theme.text} />
                )}
                right={(props) => (
                  <Ionicons name="chevron-forward" size={24} color={props.color || theme.textSecondary} />
                )}
                onPress={item.onPress}
                style={styles.listItem}
              />
              {index < supportItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.card}>
        <List.Section>
          <List.Subheader>Settings</List.Subheader>
          <List.Item
            title="Dark Mode"
            description="Toggle dark theme"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Clear Cart"
            description="Remove all items from cart"
            left={(props) => <List.Icon {...props} icon="cart-remove" />}
            onPress={() => {
              Alert.alert(
                'Clear Cart',
                'Are you sure you want to remove all items from your cart?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', onPress: clearCart, style: 'destructive' },
                ]
              );
            }}
          />
          {isAuthenticated && (
            <>
              <Divider />
              <List.Item
                title="Sign Out"
                description="Sign out of your account"
                left={(props) => <List.Icon {...props} icon="logout" />}
                onPress={handleLogout}
                titleStyle={{ color: theme.error }}
              />
            </>
          )}
        </List.Section>
      </Card>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  profileCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  avatar: {
    backgroundColor: theme.primary,
    marginBottom: theme.spacing.md,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    color: theme.textSecondary,
    marginBottom: 16,
  },
  authButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  authButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  editProfileButton: {
    borderRadius: theme.borderRadius.lg,
    borderColor: theme.primary,
  },
  contactCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  socialCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: theme.spacing.md,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  contactButton: {
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  contactButtonText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.textSecondary,
    marginTop: theme.spacing.xs,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    padding: theme.spacing.md,
  },
  menuCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  settingsCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  supportCard: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  listItem: {
    paddingVertical: theme.spacing.xs,
  },
  logoutContainer: {
    padding: theme.spacing.md,
  },
  logoutButton: {
    borderRadius: theme.borderRadius.lg,
    borderColor: theme.error,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.lg,
  },
  versionText: {
    fontSize: theme.typography.small.fontSize,
    color: theme.textSecondary,
  },
  card: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
});