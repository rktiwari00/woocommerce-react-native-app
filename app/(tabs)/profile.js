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
import { Card, List, Switch, Divider, Button, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../../contexts/CartContext';
import { theme } from '../../config/theme';
import { storeConfig } from '../../config/store';

export default function ProfileScreen() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
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
            // Add logout logic here
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

  const settingsItems = [
    {
      title: 'Push Notifications',
      icon: 'notifications-outline',
      right: () => (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          color={theme.primary}
        />
      ),
    },
    {
      title: 'Dark Mode',
      icon: 'moon-outline',
      right: () => (
        <Switch
          value={darkModeEnabled}
          onValueChange={setDarkModeEnabled}
          color={theme.primary}
        />
      ),
    },
    {
      title: 'Language',
      icon: 'language-outline',
      onPress: () => router.push('/language'),
    },
    {
      title: 'Currency',
      icon: 'cash-outline',
      onPress: () => router.push('/currency'),
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

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label="JD"
            style={styles.avatar}
            color={theme.textLight}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
            <Button
              mode="outlined"
              onPress={() => router.push('/edit-profile')}
              style={styles.editProfileButton}
            >
              Edit Profile
            </Button>
          </View>
        </Card.Content>
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

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settingsItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <List.Item
                title={item.title}
                left={(props) => (
                  <Ionicons name={item.icon} size={24} color={props.color || theme.text} />
                )}
                right={item.right}
                onPress={item.onPress}
                style={styles.listItem}
              />
              {index < settingsItems.length - 1 && <Divider />}
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

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={theme.error}
        >
          Logout
        </Button>
      </View>

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
    fontSize: theme.typography.body.fontSize,
    color: theme.textSecondary,
    marginBottom: theme.spacing.md,
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
});
