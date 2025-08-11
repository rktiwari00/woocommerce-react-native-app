import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { categoriesAPI } from '../../services/woocommerce';
import { theme } from '../../config/theme';

const { width } = Dimensions.get('window');

export default function CategoriesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesAPI.getCategories({ per_page: 50 });
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleCategoryPress = (category) => {
    router.push(`/(tabs)/categories/${category.id}`);
  };

  const renderCategoryCard = (category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category)}
    >
      <Card style={styles.card}>
        <Card.Cover
          source={{ uri: category.image?.src || 'https://via.placeholder.com/200x200' }}
          style={styles.categoryImage}
        />
        <Card.Content style={styles.cardContent}>
          <Text style={styles.categoryName} numberOfLines={2}>
            {category.name}
          </Text>
          <Text style={styles.categoryCount}>
            {category.count} products
          </Text>
          {category.description && (
            <Text style={styles.categoryDescription} numberOfLines={2}>
              {category.description}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading categories...</Text>
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
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>
          Browse products by category
        </Text>
      </View>
      
      <View style={styles.categoriesGrid}>
        {categories.map(renderCategoryCard)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.primary,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    color: theme.textLight,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.textLight,
    opacity: 0.8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - theme.spacing.md * 3) / 2,
    marginBottom: theme.spacing.md,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
  },
  categoryImage: {
    height: 120,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  categoryName: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  categoryDescription: {
    fontSize: theme.typography.small.fontSize,
    color: theme.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
