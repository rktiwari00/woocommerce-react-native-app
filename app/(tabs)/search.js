import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Searchbar, Card, Button, Chip, Divider, Snackbar, Switch, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { productsAPI, categoriesAPI } from '../../services/woocommerce';
import { useCart } from '../../contexts/CartContext';
import theme from '../../config/theme';
import { storeConfig } from '../../config/store';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 32) / 2;
const IMAGE_HEIGHT = CARD_WIDTH * 1.1; // Maintain 1:1 aspect ratio

const decodeHTML = (str) => {
  if (!str) return '';
  return str.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec)).replace(/&amp;/g, '&');
};

export default function SearchScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [addedItems, setAddedItems] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedCategory, sortBy, featuredOnly, priceRange]);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getCategories({ per_page: 20 });
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery,
        per_page: 20,
      };

      if (sortBy === 'price_low' || sortBy === 'price_high') {
        params.orderby = 'price';
        params.order = sortBy === 'price_high' ? 'desc' : 'asc';
      } else if (sortBy === 'date') {
        params.orderby = 'date';
        params.order = 'desc';
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (priceRange.min) {
        params.min_price = priceRange.min;
      }

      if (priceRange.max) {
        params.max_price = priceRange.max;
      }

      if (featuredOnly) {
        params.featured = true;
      }

      const results = await productsAPI.searchProducts(searchQuery, params);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAddedItems((p) => ({ ...p, [product.id]: true }));
    setSnackbarMsg('Added to cart');
    setSnackbarVisible(true);
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSortBy('relevance');
    setPriceRange({ min: '', max: '' });
    setFeaturedOnly(false);
    setShowAdvancedFilters(false);
  };

  const renderProductCard = (product) => {
    const currency = decodeHTML(storeConfig?.payment?.currencySymbol || '');
    const priceValue = product.sale_price && product.sale_price !== '' ? product.sale_price : product.price;
    const displayPrice = priceValue ? `${currency}${priceValue}` : `${currency}0`;

    return (
      <TouchableOpacity
        key={product.id}
        style={styles.productCard}
        onPress={() => handleProductPress(product)}
        activeOpacity={0.9}
      >
        <Card style={styles.card} elevation={2}>
          <Card.Cover
            source={{ uri: product.images?.[0]?.src || storeConfig?.placeholderImage || 'https://via.placeholder.com/200x200' }}
            style={styles.productImage}
          />
          <Card.Content style={styles.cardContent}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            <View style={styles.priceContainer}>
              {product.sale_price && product.sale_price !== '' && (
                <Text style={styles.regularPrice}>
                  {currency}{product.regular_price}
                </Text>
              )}
              <Text style={styles.price}>
                {displayPrice}
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => handleAddToCart(product)}
              style={[styles.addToCartButton, addedItems[product.id] && styles.addedButton]}
              labelStyle={styles.buttonLabel}
              disabled={!!addedItems[product.id]}
              compact
            >
              {addedItems[product.id] ? 'Added' : 'Add to Cart'}
            </Button>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const activeFilterCount = 
    (selectedCategory ? 1 : 0) +
    (sortBy !== 'relevance' ? 1 : 0) +
    (priceRange.min || priceRange.max ? 1 : 0) +
    (featuredOnly ? 1 : 0);

  return (
    <>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search products..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={theme.primary}
            inputStyle={styles.searchInput}
            placeholderTextColor={theme.textSecondary}
            onSubmitEditing={performSearch}
            clearIcon="close-circle-outline"
          />
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Filters Header */}
          <View style={styles.filtersHeader}>
            <Text style={styles.sectionTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              <Text style={styles.advancedFilterText}>
                {showAdvancedFilters ? 'Hide Advanced' : 'Advanced Filters'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sort Filters */}
          <Text style={styles.filterTitle}>Sort By</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            <Chip
              selected={sortBy === 'relevance'}
              onPress={() => setSortBy('relevance')}
              style={[styles.filterChip, sortBy === 'relevance' && styles.activeChip]}
              textStyle={styles.chipText}
            >
              Relevance
            </Chip>
            <Chip
              selected={sortBy === 'price_low'}
              onPress={() => setSortBy('price_low')}
              style={[styles.filterChip, sortBy === 'price_low' && styles.activeChip]}
              textStyle={styles.chipText}
            >
              Price: Low to High
            </Chip>
            <Chip
              selected={sortBy === 'price_high'}
              onPress={() => setSortBy('price_high')}
              style={[styles.filterChip, sortBy === 'price_high' && styles.activeChip]}
              textStyle={styles.chipText}
            >
              Price: High to Low
            </Chip>
            <Chip
              selected={sortBy === 'date'}
              onPress={() => setSortBy('date')}
              style={[styles.filterChip, sortBy === 'date' && styles.activeChip]}
              textStyle={styles.chipText}
            >
              Newest
            </Chip>
          </ScrollView>

          {/* Category Filters */}
          {categories.length > 0 && (
            <>
              <Text style={styles.filterTitle}>Categories</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContent}
              >
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    selected={selectedCategory === category.id}
                    onPress={() => handleCategoryFilter(category.id)}
                    style={[styles.categoryChip, selectedCategory === category.id && styles.activeChip]}
                    textStyle={styles.chipText}
                  >
                    {category.name}
                  </Chip>
                ))}
              </ScrollView>
            </>
          )}

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <View style={styles.advancedFiltersContainer}>
              <Text style={styles.filterTitle}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                <TextInput
                  style={styles.priceInput}
                  label="Min"
                  value={priceRange.min}
                  onChangeText={(text) => setPriceRange({...priceRange, min: text})}
                  keyboardType="numeric"
                  mode="outlined"
                  dense
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  label="Max"
                  value={priceRange.max}
                  onChangeText={(text) => setPriceRange({...priceRange, max: text})}
                  keyboardType="numeric"
                  mode="outlined"
                  dense
                />
              </View>
              
              <View style={styles.featuredContainer}>
                <Text style={styles.featuredText}>Featured Only</Text>
                <Switch 
                  value={featuredOnly} 
                  onValueChange={setFeaturedOnly}
                  color={theme.primary}
                />
              </View>
            </View>
          )}

          {/* Clear Filters */}
          {(activeFilterCount > 0) && (
            <View style={styles.clearFiltersContainer}>
              <Text style={styles.activeFiltersText}>
                {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
              </Text>
              <Button
                mode="text"
                onPress={clearFilters}
                textColor={theme.primary}
                compact
                style={styles.clearButton}
              >
                Clear All
              </Button>
            </View>
          )}

          <Divider style={styles.divider} />

          {/* Search Results */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.loadingText}>Searching products...</Text>
            </View>
          ) : searchQuery.length > 2 ? (
            searchResults.length > 0 ? (
              <>
                <Text style={styles.resultsHeader}>{searchResults.length} results found</Text>
                <View style={styles.resultsGrid}>
                  {searchResults.map((product) => renderProductCard(product))}
                </View>
              </>
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={80} color={theme.textSecondary} />
                <Text style={styles.noResultsTitle}>No products found</Text>
                <Text style={styles.noResultsSubtitle}>
                  Try different keywords or adjust your filters
                </Text>
                <Button 
                  mode="outlined" 
                  onPress={clearFilters}
                  style={styles.tryAgainButton}
                >
                  Clear Filters
                </Button>
              </View>
            )
          ) : (
            <View style={styles.initialStateContainer}>
              <Ionicons name="search" size={90} color={theme.primaryLight} style={styles.searchIcon} />
              <Text style={styles.initialStateTitle}>Search Products</Text>
              <Text style={styles.initialStateSubtitle}>
                Enter keywords to find products in our store
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <Snackbar 
        visible={snackbarVisible} 
        onDismiss={() => setSnackbarVisible(false)} 
        duration={1500}
        style={styles.snackbar}
        theme={{ colors: { surface: theme.successLight } }}
      >
        <Text style={styles.snackbarText}>{snackbarMsg}</Text>
      </Snackbar>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: theme.background,
  },
  searchBar: {
    borderRadius: 12,
    elevation: 1,
    backgroundColor: theme.surface,
    height: 50,
  },
  searchInput: {
    color: theme.text,
    minHeight: 30,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  advancedFilterText: {
    color: theme.primary,
    fontWeight: '500',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    minHeight: 42,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    height: 36,
    justifyContent: 'center',
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    height: 36,
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  chipText: {
    fontSize: 14,
    color: theme.text,
  },
  advancedFiltersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceInput: {
    flex: 1,
    backgroundColor: theme.background,
    height: 50,
  },
  priceSeparator: {
    marginHorizontal: 10,
    color: theme.text,
    fontWeight: 'bold',
  },
  featuredContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredText: {
    color: theme.text,
    fontSize: 16,
  },
  clearFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeFiltersText: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  clearButton: {
    alignSelf: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: theme.borderLight,
    marginVertical: 8,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    color: theme.textSecondary,
    fontSize: 14,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  productCard: {
    width: CARD_WIDTH,
    padding: theme.spacing.sm,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.surface,
  },
  productImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
    paddingTop: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 6,
    height: 40,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  regularPrice: {
    fontSize: 12,
    color: theme.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary,
  },
  addToCartButton: {
    borderRadius: 8,
    backgroundColor: theme.primary,
    paddingVertical: 4,
  },
  addedButton: {
    backgroundColor: theme.success,
  },
  buttonLabel: {
    color: theme.textLight,
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: theme.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  noResultsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  tryAgainButton: {
    borderColor: theme.primary,
    borderWidth: 1,
  },
  initialStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  searchIcon: {
    opacity: 0.8,
    marginBottom: 16,
  },
  initialStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  initialStateSubtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  snackbar: {
    borderRadius: 8,
    margin: 16,
  },
  snackbarText: {
    color: theme.textLight,
    fontWeight: '500',
  },
});