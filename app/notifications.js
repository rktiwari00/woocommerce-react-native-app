
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  IconButton,
  Chip,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotification } from '../contexts/NotificationContext';
import { theme } from '../config/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotification();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return 'receipt';
      case 'promotion':
        return 'pricetag';
      case 'new_product':
        return 'cube';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return theme.success;
      case 'promotion':
        return theme.warning;
      case 'new_product':
        return theme.info;
      default:
        return theme.primary;
    }
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'order' && notification.orderId) {
      router.push(`/order/${notification.orderId}`);
    } else if (notification.type === 'new_product' && notification.productId) {
      router.push(`/product/${notification.productId}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>Notifications</Title>
        <IconButton
          icon="dots-vertical"
          size={24}
          onPress={() => {
            // Show options menu
          }}
        />
      </View>

      {notifications.length > 0 && (
        <View style={styles.actions}>
          <Button
            mode="text"
            onPress={markAllAsRead}
            style={styles.actionButton}
          >
            Mark All Read
          </Button>
          <Button
            mode="text"
            onPress={clearAllNotifications}
            textColor={theme.error}
            style={styles.actionButton}
          >
            Clear All
          </Button>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-outline"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              You'll see your notifications here when you receive them.
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard,
              ]}
            >
              <TouchableOpacity
                onPress={() => handleNotificationPress(notification)}
                style={styles.notificationContent}
              >
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationIcon}>
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={24}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>
                  <View style={styles.notificationInfo}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        !notification.read && styles.unreadText,
                      ]}
                      numberOfLines={1}
                    >
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTime(notification.timestamp)}
                    </Text>
                  </View>
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => deleteNotification(notification.id)}
                  />
                </View>
                <Text style={styles.notificationBody} numberOfLines={2}>
                  {notification.body}
                </Text>
                {notification.type && (
                  <Chip
                    style={[
                      styles.typeChip,
                      { backgroundColor: getNotificationColor(notification.type) + '20' },
                    ]}
                    textStyle={{ color: getNotificationColor(notification.type) }}
                  >
                    {notification.type.replace('_', ' ')}
                  </Chip>
                )}
              </TouchableOpacity>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: theme.surface,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.surface,
  },
  actionButton: {
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  notificationCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: theme.surface,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  notificationBody: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  typeChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
