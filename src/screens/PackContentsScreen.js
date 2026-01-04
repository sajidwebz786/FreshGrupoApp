import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../components/CustomHeader';
import BottomNavigation from '../components/BottomNavigation';
import api from '../services/api';

const { width } = Dimensions.get('window');

const PackContentsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, packType, price, packId } = route.params || {};

  const [packDetails, setPackDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    fetchPackDetails();
  }, [packId]);

  const fetchPackDetails = async () => {
    try {
      setLoading(true);
      if (packId) {
        const data = await api.getPackDetails(packId);
        setPackDetails(data);
        // Calculate grand total
        if (data?.Products) {
          const total = data.Products.reduce((sum, item) => {
            const unitPrice = item.PackProduct?.unitPrice || item.price || 0;
            const quantity = item.PackProduct?.quantity || 1;
            return sum + (unitPrice * quantity);
          }, 0);
          setGrandTotal(total);
        }
      }
    } catch (error) {
      console.error('Error fetching pack details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        alert('Please login first');
        setAddingToCart(false);
        return;
      }
      const user = JSON.parse(userData);
      const userId = user.id;
      if (!userId || !packId) {
        alert('Missing user or pack information');
        setAddingToCart(false);
        return;
      }
      const token = await AsyncStorage.getItem('userToken');
      await api.addToCart({ userId, packId, quantity: 1 }, token);
      alert('Pack added to cart successfully!');
      navigation.navigate('Cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const getProductIcon = (name) => {
    const n = name.toLowerCase();
    // Vegetables
    if (n.includes('spinach')) return '🥬';
    if (n.includes('lettuce')) return '🥬';
    if (n.includes('kale')) return '🥬';
    if (n.includes('celery')) return '🥬';
    if (n.includes('chard')) return '🥬';
    if (n.includes('collard')) return '🥬';
    if (n.includes('endive')) return '🥬';
    if (n.includes('escarole')) return '🥬';
    if (n.includes('kohlrabi')) return '🥬';
    if (n.includes('fennel')) return '🥬';
    if (n.includes('artichoke')) return '🥬';
    if (n.includes('asparagus')) return '🥬';
    if (n.includes('brussels sprout')) return '🥬';
    if (n.includes('tomato')) return '🍅';
    if (n.includes('potato')) return '🥔';
    if (n.includes('carrot')) return '🥕';
    if (n.includes('beet')) return '🥕';
    if (n.includes('radish')) return '🥕';
    if (n.includes('turnip')) return '🥕';
    if (n.includes('parsnip')) return '🥕';
    if (n.includes('onion')) return '🧅';
    if (n.includes('leek')) return '🧅';
    if (n.includes('shallot')) return '🧅';
    if (n.includes('scallion')) return '🧅';
    if (n.includes('chive')) return '🧅';
    if (n.includes('bell pepper')) return '🫑';
    if (n.includes('poblano')) return '🫑';
    if (n.includes('broccoli')) return '🥦';
    if (n.includes('cauliflower')) return '🥬';
    if (n.includes('cabbage')) return '🥬';
    if (n.includes('bean')) return '🫘';
    if (n.includes('pea')) return '🫛';
    if (n.includes('corn')) return '🌽';
    if (n.includes('eggplant')) return '🍆';
    if (n.includes('cucumber')) return '🥒';
    if (n.includes('zucchini')) return '🥒';
    if (n.includes('squash')) return '🎃';
    if (n.includes('pumpkin')) return '🎃';
    if (n.includes('mushroom')) return '🍄';
    if (n.includes('garlic')) return '🧄';
    if (n.includes('ginger')) return '🫚';
    if (n.includes('chili') || n.includes('chilli')) return '🌶️';
    if (n.includes('jalapeno')) return '🌶️';
    if (n.includes('habanero')) return '🌶️';
    // Fruits
    if (n.includes('banana')) return '🍌';
    if (n.includes('apple')) return '🍎';
    if (n.includes('orange')) return '🍊';
    if (n.includes('mango')) return '🥭';
    if (n.includes('grape')) return '🍇';
    if (n.includes('strawberry')) return '🍓';
    if (n.includes('pineapple')) return '🍍';
    if (n.includes('watermelon')) return '🍉';
    if (n.includes('papaya')) return '🍈';
    if (n.includes('kiwi')) return '🥝';
    // Other groceries
    if (n.includes('rice')) return '🍚';
    if (n.includes('wheat') || n.includes('flour')) return '🌾';
    if (n.includes('milk')) return '🥛';
    if (n.includes('bread')) return '🍞';
    if (n.includes('egg')) return '🥚';
    if (n.includes('chicken') || n.includes('meat')) return '🍗';
    if (n.includes('fish')) return '🐟';
    if (n.includes('oil') || n.includes('ghee')) return '🫒';
    if (n.includes('sugar') || n.includes('salt') || n.includes('spice')) return '🧂';
    return '📦';
  };

  if (!category || !packType) {
    return (
      <View style={styles.centered}>
        <Text>No pack details available.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={styles.loadingText}>Loading pack contents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#28a745" barStyle="light-content" translucent={true} />

      {/* Use your standard app header */}
      <View style={styles.headerContainer}>
        <CustomHeader />
      </View>

      {/* Pack Info Card */}
      <View style={styles.packInfo}>
        <Text style={styles.packTitle}>{category} - {packType}</Text>
        <Text style={styles.packPrice}>₹{grandTotal}</Text>
      </View>

      {/* Pack Contents Table */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.contentsTitle}>Pack Contents</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.productColumn]}>Product</Text>
          <Text style={[styles.tableHeaderText, styles.unitColumn]}>Unit</Text>
          <Text style={[styles.tableHeaderText, styles.priceColumn]}>Price</Text>
          <Text style={[styles.tableHeaderText, styles.qtyColumn]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.subtotalColumn]}>Sub Total</Text>
        </View>

        {/* Table Rows */}
        <View style={styles.tableContainer}>
          {(packDetails?.Products || []).map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.productCell}>
                <View style={styles.itemIconContainer}>
                  <Text style={styles.itemIcon}>{getProductIcon(item.name)}</Text>
                </View>
                <Text style={styles.productName}>{item.name}</Text>
              </View>
              <Text style={[styles.tableCell, styles.unitCell]}>{item.UnitType?.abbreviation || 'PC'}</Text>
              <Text style={[styles.tableCell, styles.priceCell]}>₹{item.PackProduct?.unitPrice || item.price}</Text>
              <Text style={[styles.tableCell, styles.qtyCell]}>{item.PackProduct?.quantity || 1}</Text>
              <Text style={[styles.tableCell, styles.subtotalCell]}>
                ₹{(item.PackProduct?.unitPrice || item.price || 0) * (item.PackProduct?.quantity || 1)}
              </Text>
            </View>
          ))}
        </View>

        {/* Grand Total */}
        <View style={styles.grandTotalContainer}>
          <Text style={styles.grandTotalText}>Grand Total: ₹{grandTotal}</Text>
        </View>
      </ScrollView>

      {/* Floating Add to Cart */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={[styles.addToCartButton, addingToCart && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          <Text style={styles.addToCartText}>
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerContainer: {
    paddingTop: 50,
    backgroundColor: '#4CAF50',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Pack Info Card
  packInfo: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  packTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 3, color: '#333' },
  packPrice: { fontSize: 20, fontWeight: 'bold', color: '#28a745' },

  // Scroll & contents
  scrollContainer: { flex: 1, marginHorizontal: 10, marginTop: 8 },
  contentsTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 8, textAlign: 'center' },

  // Table styles
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 5,
    borderRadius: 5,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  productColumn: { flex: 2.5 },
  unitColumn: { flex: 1 },
  priceColumn: { flex: 1.2 },
  qtyColumn: { flex: 0.8 },
  subtotalColumn: { flex: 1.2 },

  tableContainer: { paddingBottom: 120 },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 5,
    marginBottom: 2,
    borderRadius: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    alignItems: 'center',
  },
  productCell: {
    flex: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  tableCell: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  unitCell: { flex: 1 },
  priceCell: { flex: 1.2 },
  qtyCell: { flex: 0.8 },
  subtotalCell: { flex: 1.2, fontWeight: 'bold', color: '#28a745' },

  // Item card
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  grandTotalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  grandTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemIcon: { fontSize: 20 },

  itemDetails: { flex: 1 },
  itemInfo: { fontSize: 12, color: '#333', fontWeight: '500' },

  // Floating Add to Cart
  floatingButtonContainer: { position: 'absolute', bottom: 100, left: 20, right: 20 },
  addToCartButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
  },
  disabledButton: { backgroundColor: '#ccc' },
  addToCartText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },


  // Loading
  loadingText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10 },
});

export default PackContentsScreen;
