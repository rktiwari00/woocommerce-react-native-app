import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Card } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productsAPI, categoriesAPI } from '../../../services/woocommerce';
import { theme } from '../../../config/theme';
import { storeConfig } from '../../../config/store';

const { width } = Dimensions.get('window');

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cat, prods] = await Promise.all([
        categoriesAPI.getCategory(id),
        productsAPI.getProductsByCategory(id, { per_page: 20 }),
      ]);
      setCategory(cat);
      setProducts(prods);
    } catch (error) {
      console.error('Error loading category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    router.push(`/product/${product.id}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{category?.name || 'Category'}</Text>
        {category?.description ? (
          <Text style={styles.subtitle}>{category.description}</Text>
        ) : null}
      </View>

      <View style={styles.grid}>
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.cardWrap}
            onPress={() => handleProductPress(product)}
          >
            <Card style={styles.card}>
              <Card.Cover
                source={{ uri: product.images?.[0]?.src || 'https://via.placeholder.com/200x200' }}
                style={styles.image}
              />
              <Card.Content>
                <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>
                  {storeConfig.payment.currencySymbol}{product.sale_price || product.price}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: theme.spacing.lg, backgroundColor: theme.primary },
  title: { fontSize: theme.typography.h2.fontSize, fontWeight: 'bold', color: theme.textLight },
  subtitle: { marginTop: theme.spacing.xs, color: theme.textLight },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: theme.spacing.md, justifyContent: 'space-between',
  },
  cardWrap: { width: (width - theme.spacing.md * 3) / 2, marginBottom: theme.spacing.md },
  card: { borderRadius: theme.borderRadius.lg, backgroundColor: theme.card, elevation: 2 },
  image: { height: 150, borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg },
  name: { marginTop: theme.spacing.xs },
  price: { color: theme.primary, fontWeight: 'bold', marginTop: theme.spacing.xs },
});