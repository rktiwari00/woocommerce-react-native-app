import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Card, Button, Chip, FAB, Surface } from "react-native-paper";
import { useRouter } from "expo-router";
import { productsAPI, categoriesAPI } from "../../services/woocommerce";
import { useCart } from "../../contexts/CartContext";
import { theme } from "../../config/theme";
import { storeConfig } from "../../config/store";

const { width } = Dimensions.get("window");
// const itemHalfWidth = theme.screenWidth / 2; // for two category cards

export default function Index() {
  const router = useRouter();
  const { addToCart, getCartCount } = useCart();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [onSaleProducts, setOnSaleProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners] = useState([
    "https://t4.ftcdn.net/jpg/09/34/81/11/360_F_934811162_D5LpBYkWOcXlxOcHggM0TUpApfDwVRoP.jpg",
    "https://www.brilliance.com/cdn-cgi/image/f=webp,width=1440,height=1440,quality=90/sites/default/files/vue/collections/engagement-rings-diamond_hero.jpg",
    "https://kinclimg0.bluestone.com/f_jpg,c_scale,w_1024,q_80,b_rgb:f0f0f0/giproduct/BIDG0319R189-POSTER-V1-69449.jpg",
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [featured, onSale, cats] = await Promise.all([
        productsAPI.getFeaturedProducts({ per_page: 6 }),
        productsAPI.getOnSaleProducts({ per_page: 6 }),
        categoriesAPI.getCategories({ per_page: 8 }),
      ]);
      setFeaturedProducts(featured);
      setOnSaleProducts(onSale);
      setCategories(cats);
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleProductPress = (product) => {
    router.push(`/product/${product.id}`);
  };

  const handleCategoryPress = (category) => {
    router.push(`/(tabs)/categories/${category.id}`);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const renderProductCard = (product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
    >
      <Card style={styles.card}>
        <Card.Cover
          source={{
            uri:
              product.images?.[0]?.src || "https://via.placeholder.com/200x200",
          }}
          style={styles.productImage}
        />
        <Card.Content style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.priceContainer}>
            {product.sale_price && (
              <Text style={styles.regularPrice}>
                {storeConfig.payment.currencySymbol}
                {product.regular_price}
              </Text>
            )}
            <Text style={styles.price}>
              {storeConfig.payment.currencySymbol}
              {product.sale_price || product.price}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={() => handleAddToCart(product)}
            style={styles.addToCartButton}
            labelStyle={styles.buttonLabel}
          >
            Add to Cart
          </Button>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderCategoryCard = (category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category)}
    >
      <Surface style={styles.categoryCard} elevation={2}>
        <Card.Cover
          source={{
            uri: category.image?.src || "https://via.placeholder.com/150x150",
          }}
          style={styles.categoryImage}
        />
        <Card.Content style={styles.categoryContent}>
          <Text style={styles.categoryName} numberOfLines={2}>
            {category.name}
          </Text>
          <Text style={styles.categoryCount}>{category.count} products</Text>
        </Card.Content>
      </Surface>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
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
        <LinearGradient
          colors={[theme.primary, theme.primaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>
              {storeConfig.content.welcomeMessage}
            </Text>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push("/(tabs)/cart")}
            >
              <Ionicons name="cart" size={24} color={theme.textLight} />
              {getCartCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.bannerContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {banners.map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/categories")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories
            .filter(
              (cat) =>
                cat.name.toLowerCase() !== "see all" &&
                cat.name.toLowerCase() !== "featured product"
            )
            .map((cat, index, arr) => (
              <View key={cat.id} style={{ width: width / arr.length }}>
                {renderCategoryCard(cat)}
              </View>
            ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productsGrid}>
          {featuredProducts.map(renderProductCard)}
        </View>
      </View>

      {onSaleProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>On Sale</Text>
            <Chip icon="sale" mode="outlined" style={styles.saleChip}>
              Up to 50% Off
            </Chip>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {onSaleProducts.map(renderProductCard)}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginBottom: theme.spacing.md },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: "bold",
    color: theme.textLight,
    flex: 1,
  },
  cartButton: { position: "relative", padding: theme.spacing.sm },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: theme.error,
    borderRadius: theme.borderRadius.round,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: theme.textLight,
    fontSize: theme.typography.small.fontSize,
    fontWeight: "bold",
  },
  bannerContainer: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  bannerImage: { width: width - theme.spacing.md * 2, height: 200 },
  section: { marginBottom: theme.spacing.xl },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: "bold",
    color: theme.text,
  },
  seeAllText: {
    color: theme.primary,
    fontSize: theme.typography.body.fontSize,
  },
  saleChip: { backgroundColor: theme.secondaryLight },
  categoryCard: {
    marginLeft: theme.spacing.md,
    width: 120,
    padding: theme.spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.card,
  },
  categoryCardInner: { borderRadius: theme.borderRadius.lg },
  categoryImage: {
    height: 80,
    width: 110,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  categoryContent: { padding: theme.spacing.md, alignItems: "center" },
  categoryName: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  categoryCount: {
    fontSize: theme.typography.small.fontSize,
    color: theme.textSecondary,
    textAlign: "center",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: theme.spacing.md,
    justifyContent: "space-between",
  },
  productCard: {
    width: (width - theme.spacing.md * 3) / 2,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  featuredProductCard: {
    width: (width - theme.spacing.md * 3) / 2,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: 10,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
    backgroundColor: theme.card,
  },
  productImage: {
    height: 150,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  cardContent: { padding: theme.spacing.md },
  productName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
    marginBottom: theme.spacing.xs,
    height: 40,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  regularPrice: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.textSecondary,
    textDecorationLine: "line-through",
    marginRight: theme.spacing.xs,
  },
  price: {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: "bold",
    color: theme.primary,
  },
  addToCartButton: { borderRadius: theme.borderRadius.md },
  buttonLabel: { fontSize: theme.typography.caption.fontSize },
});
