import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Card, Button, Chip, Divider, IconButton, TextInput, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productsAPI, reviewsAPI } from '../../services/woocommerce';
import { useCart } from '../../contexts/CartContext';
import { theme } from '../../config/theme';
import { storeConfig } from '../../config/store';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, getCartCount } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [variations, setVariations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const [productData, reviewsData] = await Promise.all([
        productsAPI.getProduct(id),
        reviewsAPI.getProductReviews(id, { per_page: 10 }),
      ]);
      setProduct(productData);
      setReviews(reviewsData);
      if (Array.isArray(productData.variations) && productData.variations.length > 0) {
        const vars = await productsAPI.getProductVariations(productData.id, { per_page: 100 });
        setVariations(vars);
        // Automatically select the first variation if available
        if (vars.length > 0) {
          setSelectedVariation(vars[0]);
        }
      } else {
        setVariations([]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const productToAdd = selectedVariation || product;
    addToCart(productToAdd, quantity);
    setSnackbarMsg('Product added to cart!');
    setSnackbarVisible(true);
  };

  const handleBuyNow = () => {
    if (!product) return;

    const productToAdd = selectedVariation || product;
    addToCart(productToAdd, quantity);
    router.push('/checkout');
  };

  const handleVariationSelect = (variation) => {
    setSelectedVariation(variation);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 999)) {
      setQuantity(newQuantity);
    }
  };

  const getProductImages = () => {
    if (!product?.images) return ['https://via.placeholder.com/400x400'];
    return product.images.map(img => img.src);
  };

  const getAverageRating = () => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const renderVariationOption = (variation) => (
    <TouchableOpacity
      key={variation.id}
      style={[
        styles.variationOption,
        selectedVariation?.id === variation.id && styles.selectedVariation,
      ]}
      onPress={() => handleVariationSelect(variation)}
    >
      <Text style={[
        styles.variationText,
        selectedVariation?.id === variation.id && styles.selectedVariationText,
      ]}>
        {variation.attributes?.map(attr => attr.option).join(' - ')}
      </Text>
      <Text style={[
        styles.variationPrice,
        selectedVariation?.id === variation.id && styles.selectedVariationText,
      ]}>
        {storeConfig.payment.currencySymbol}{variation.price}
      </Text>
    </TouchableOpacity>
  );

  const renderReview = (review) => (
    <Card key={review.id} style={styles.reviewCard}>
      <Card.Content>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewerName}>{review.reviewer}</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={`review-${review.id}-star-${star}`}
                name={star <= review.rating ? 'star' : 'star-outline'}
                size={16}
                color={theme.secondary}
              />
            ))}
          </View>
        </View>
        <Text style={styles.reviewDate}>
          {new Date(review.date_created).toLocaleDateString()}
        </Text>
        <Text style={styles.reviewText}>{review.review}</Text>
      </Card.Content>
    </Card>
  );

  const getDisplayPrice = () => {
    if (selectedVariation) {
      return selectedVariation.price;
    }
    return product.sale_price || product.price;
  };

  const getRegularPrice = () => {
    if (selectedVariation) {
      return selectedVariation.regular_price;
    }
    return product.regular_price;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={50} color={theme.error} />
        <Text style={styles.errorText}>Product not found</Text>
        <Button 
          mode="outlined" 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const images = getProductImages();
  const displayPrice = getDisplayPrice();
  const regularPrice = getRegularPrice();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Product Images */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[currentImageIndex] }}
            style={styles.mainImage}
            resizeMode="contain"
          />
          
          {/* Image Thumbnails */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailsContainer}
            contentContainerStyle={styles.thumbnailsContent}
          >
            {images.map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setCurrentImageIndex(idx)}
                style={[
                  styles.thumbnail,
                  idx === currentImageIndex && styles.activeThumbnail
                ]}
              >
                <Image
                  source={{ uri }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.stockBadge}>
              <Text style={[
                styles.stockText,
                { color: product.stock_status === 'instock' ? theme.success : theme.error }
              ]}>
                {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Short Description */}
          {product.short_description && (
            <Text style={styles.shortDescription}>
              {product.short_description.replace(/<\/?[^>]+(>|$)/g, "")}
            </Text>
          )}

          {/* Price */}
          <View style={styles.priceContainer}>
            {regularPrice && regularPrice !== displayPrice && (
              <Text style={styles.regularPrice}>
                {storeConfig.payment.currencySymbol}{regularPrice}
              </Text>
            )}
            <Text style={styles.price}>
              {storeConfig.payment.currencySymbol}{displayPrice}
            </Text>
            {(regularPrice && regularPrice !== displayPrice) && (
              <Chip icon="sale" mode="outlined" style={styles.saleChip}>
                Sale
              </Chip>
            )}
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= getAverageRating() ? 'star' : 'star-outline'}
                  size={20}
                  color={theme.secondary}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {getAverageRating()} ({reviews.length} reviews)
            </Text>
          </View>

          {/* Variations */}
          {Array.isArray(variations) && variations.length > 0 && (
            <View style={styles.variationsContainer}>
              <Text style={styles.sectionTitle}>Select Options</Text>
              <View style={styles.variationsGrid}>
                {variations.map((variation) =>
                  renderVariationOption(variation)
                )}
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <IconButton
                icon="minus"
                size={24}
                onPress={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                style={styles.quantityButton}
              />
              <TextInput
                value={quantity.toString()}
                onChangeText={(text) => handleQuantityChange(parseInt(text) || 1)}
                style={styles.quantityInput}
                keyboardType="numeric"
                mode="outlined"
                dense
                theme={{ roundness: 8 }}
              />
              <IconButton
                icon="plus"
                size={24}
                onPress={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= (product.stock_quantity || 999)}
                style={styles.quantityButton}
              />
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Product Details</Text>
              <Text style={styles.description}>
                {product.description.replace(/<\/?[^>]+(>|$)/g, "")}
              </Text>
            </View>
          )}

          {/* Reviews */}
          {storeConfig.features.enableReviews && reviews.length > 0 && (
            <View style={styles.reviewsContainer}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Customer Reviews</Text>
                <TouchableOpacity onPress={() => setShowReviews(!showReviews)}>
                  <Text style={styles.seeAllReviews}>
                    {showReviews ? 'Hide' : `See All (${reviews.length})`}
                  </Text>
                </TouchableOpacity>
              </View>
              {showReviews && (
                <View style={styles.reviewsList}>
                  {reviews.map(renderReview)}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {(!product.price && variations.length === 0) ? (
          <Button
            mode="contained"
            onPress={() => Linking.openURL(`whatsapp://send?phone=${storeConfig.contact.whatsapp}&text=Hi! I'm interested in ${product.name}`)}
            style={styles.buyNowButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Request Pricing on WhatsApp
          </Button>
        ) : (
          <>
            <Button
              mode="outlined"
              onPress={handleAddToCart}
              style={[styles.addToCartButton, product.stock_status !== 'instock' && styles.disabledButton]}
              contentStyle={styles.buttonContent}
              labelStyle={[styles.buttonLabel, { color: theme.primary }]}
              disabled={product.stock_status !== 'instock'}
            >
              Add to Cart
            </Button>
            <Button
              mode="contained"
              onPress={handleBuyNow}
              style={[styles.buyNowButton, product.stock_status !== 'instock' && styles.disabledButton]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              disabled={product.stock_status !== 'instock'}
            >
              Buy Now
            </Button>
          </>
        )}
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        {snackbarMsg}
      </Snackbar>
    </View>
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
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: 18,
    color: theme.text,
    marginVertical: theme.spacing.md,
  },
  backButton: {
    marginTop: theme.spacing.md,
    borderColor: theme.primary,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: theme.surface,
    paddingBottom: theme.spacing.md,
  },
  mainImage: {
    width: '100%',
    height: 350,
  },
  thumbnailsContainer: {
    paddingHorizontal: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  thumbnailsContent: {
    paddingHorizontal: theme.spacing.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeThumbnail: {
    borderColor: theme.primary,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  productInfo: {
    padding: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  productName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginRight: theme.spacing.sm,
  },
  stockBadge: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
  },
  shortDescription: {
    fontSize: 16,
    color: theme.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  regularPrice: {
    fontSize: 18,
    color: theme.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: theme.spacing.sm,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
    marginRight: theme.spacing.sm,
  },
  saleChip: {
    backgroundColor: theme.secondaryLight,
    borderColor: theme.secondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  stars: {
    flexDirection: 'row',
    marginRight: theme.spacing.sm,
  },
  ratingText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  stockContainer: {
    marginBottom: theme.spacing.lg,
  },
  stockText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stockQuantity: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: theme.spacing.xs,
  },
  variationsContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: theme.spacing.md,
  },
  variationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  variationOption: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedVariation: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryLight,
  },
  variationText: {
    fontSize: 14,
    color: theme.text,
    textAlign: 'center',
  },
  selectedVariationText: {
    color: theme.primary,
    fontWeight: '600',
  },
  variationPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginTop: theme.spacing.xs,
  },
  quantityContainer: {
    marginBottom: theme.spacing.lg,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    backgroundColor: theme.surface,
    borderRadius: 8,
  },
  quantityInput: {
    width: 80,
    textAlign: 'center',
    marginHorizontal: theme.spacing.sm,
    backgroundColor: theme.background,
  },
  descriptionContainer: {
    marginBottom: theme.spacing.lg,
  },
  description: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
  },
  reviewsContainer: {
    marginBottom: theme.spacing.lg,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  seeAllReviews: {
    color: theme.primary,
    fontSize: 16,
  },
  reviewsList: {
    gap: theme.spacing.md,
  },
  reviewCard: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.surface,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  reviewDate: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  reviewText: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
  },
  addToCartButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    borderColor: theme.primary,
    backgroundColor: theme.background,
  },
  buyNowButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.primary,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  snackbar: {
    backgroundColor: theme.success,
    margin: theme.spacing.md,
    borderRadius: 8,
  },
});