
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    orderUpdates: true,
    promotions: true,
    newProducts: false,
    pushEnabled: false,
  });

  useEffect(() => {
    loadNotifications();
    loadNotificationSettings();
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('notificationSettings');
      if (stored) {
        setNotificationSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveNotifications = async (newNotifications) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const saveNotificationSettings = async (settings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const addNotification = async (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);

    // Show in-app notification
    if (notification.showAlert) {
      Alert.alert(notification.title, notification.body);
    }
  };

  const markAsRead = async (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  const deleteNotification = async (notificationId) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    await saveNotifications([]);
  };

  const updateNotificationSettings = async (settings) => {
    const updatedSettings = { ...notificationSettings, ...settings };
    setNotificationSettings(updatedSettings);
    await saveNotificationSettings(updatedSettings);
  };

  // Simulate sending different types of notifications
  const sendOrderNotification = (orderId, status) => {
    if (!notificationSettings.orderUpdates) return;

    const statusMessages = {
      pending: 'Your order has been received and is being processed.',
      processing: 'Your order is being prepared for shipment.',
      shipped: 'Your order has been shipped and is on its way!',
      delivered: 'Your order has been delivered successfully.',
      cancelled: 'Your order has been cancelled.',
    };

    addNotification({
      title: `Order #${orderId} ${status}`,
      body: statusMessages[status] || 'Your order status has been updated.',
      type: 'order',
      orderId,
      showAlert: true,
    });
  };

  const sendPromotionalNotification = (title, body, link) => {
    if (!notificationSettings.promotions) return;

    addNotification({
      title,
      body,
      type: 'promotion',
      link,
      showAlert: false,
    });
  };

  const sendNewProductNotification = (productName, productId) => {
    if (!notificationSettings.newProducts) return;

    addNotification({
      title: 'New Product Available!',
      body: `Check out our latest product: ${productName}`,
      type: 'new_product',
      productId,
      showAlert: false,
    });
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const value = {
    notifications,
    notificationSettings,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateNotificationSettings,
    sendOrderNotification,
    sendPromotionalNotification,
    sendNewProductNotification,
    getUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
