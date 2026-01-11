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
  const { category, packType, packId } = route.params || {};

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
      const data = await api.getPackDetails(packId);
      setPackDetails(data);

      if (data?.Products?.length) {
        const total = data.Products.reduce((sum, item) => {
          const price = item.PackProduct?.unitPrice || item.price || 0;
          const qty = item.PackProduct?.quantity || 1;
          return sum + price * qty;
        }, 0);
        setGrandTotal(total);
      }
    } catch (error) {
      console.error('Error fetching pack details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('carrot')) return '🥕';
    if (lowerName.includes('apple')) return '🍎';
    if (lowerName.includes('banana')) return '🍌';
    if (lowerName.includes('orange')) return '🍊';
    if (lowerName.includes('juice') || lowerName.includes('drink')) return '🥤';
    if (lowerName.includes('milk')) return '🥛';
    if (lowerName.includes('bread')) return '🍞';
    if (lowerName.includes('rice')) return '🍚';
    if (lowerName.includes('wheat')) return '🌾';
    if (lowerName.includes('sugar')) return '🧂';
    if (lowerName.includes('salt')) return '🧂';
    if (lowerName.includes('oil')) return '🫒';
    if (lowerName.includes('tomato')) return '🍅';
    if (lowerName.includes('potato')) return '🥔';
    if (lowerName.includes('onion')) return '🧅';
    if (lowerName.includes('garlic')) return '🧄';
    if (lowerName.includes('ginger')) return '🫚';
    if (lowerName.includes('spinach')) return '🥬';
    if (lowerName.includes('lettuce')) return '🥬';
    if (lowerName.includes('cucumber')) return '🥒';
    if (lowerName.includes('pepper')) return '🫑';
    if (lowerName.includes('egg')) return '🥚';
    if (lowerName.includes('chicken')) return '🍗';
    if (lowerName.includes('fish')) return '🐟';
    if (lowerName.includes('cheese')) return '🧀';
    if (lowerName.includes('butter')) return '🧈';
    if (lowerName.includes('yogurt')) return '🥛';
    if (lowerName.includes('honey')) return '🍯';
    if (lowerName.includes('nuts') || lowerName.includes('almond')) return '🥜';
    if (lowerName.includes('dates')) return '🌴';
    if (lowerName.includes('raisin')) return '🍇';
    if (lowerName.includes('tea')) return '🍵';
    if (lowerName.includes('coffee')) return '☕';
    if (lowerName.includes('masala') || lowerName.includes('spice')) return '🌶️';
    if (lowerName.includes('dal') || lowerName.includes('lentil')) return '🫘';
    if (lowerName.includes('flour')) return '🌾';
    if (lowerName.includes('atta')) return '🌾';
    if (lowerName.includes('maida')) return '🌾';
    if (lowerName.includes('besan')) return '🌾';
    if (lowerName.includes('corn')) return '🌽';
    if (lowerName.includes('peas')) return '🫛';
    if (lowerName.includes('beans')) return '🫘';
    if (lowerName.includes('chickpea')) return '🫘';
    if (lowerName.includes('moong')) return '🫘';
    if (lowerName.includes('urad')) return '🫘';
    if (lowerName.includes('toor')) return '🫘';
    if (lowerName.includes('masoor')) return '🫘';
    if (lowerName.includes('rajma')) return '🫘';
    if (lowerName.includes('chana')) return '🫘';
    // Default icon
    return '🥦';
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        alert('Please login first');
        return;
      }
      const user = JSON.parse(userData);
      const token = await AsyncStorage.getItem('userToken');
      await api.addToCart({ userId: user.id, packId, quantity: 1 }, token);
      alert('Pack added to cart successfully!');
      navigation.getParent().navigate('Cart');
    } catch (err) {
      console.error(err);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

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
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" translucent={true} />
      <View style={styles.headerContainer}>
        <CustomHeader />
      </View>

      <View style={styles.packInfo}>
        <Text style={styles.packTitle}>{category} - {packType}</Text>
        <Text style={styles.packPrice}>₹{grandTotal}</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.contentsTitle}>Pack Contents</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, { flex: 0.5 }]}></Text>
          <Text style={[styles.headerText, { flex: 2 }]}>Product</Text>
          <Text style={[styles.headerText, { flex: 1 }]}>Unit</Text>
          <Text style={[styles.headerText, { flex: 1 }]}>Price</Text>
          <Text style={[styles.headerText, { flex: 1 }]}>Qty</Text>
          <Text style={[styles.headerText, { flex: 0.5 }]}>Sum</Text>
        </View>

        {/* Pack Products */}
        {(packDetails?.Products || []).map((item, index) => {
          const unitPrice = item.PackProduct?.unitPrice || item.price || 0;
          const qty = item.PackProduct?.quantity || 1;
          const sum = unitPrice * qty;
          return (
            <View key={index} style={styles.tableRow}>
              <Text style={{ flex: 0.5, textAlign: 'center', fontSize: 20 }}>{getProductIcon(item.name)}</Text>
              <Text style={{ flex: 2 }}>{item.name}</Text>
              <Text style={{ flex: 1, textAlign: 'center' }}>{item.unitType || 'pcs'}</Text>
              <Text style={{ flex: 1, textAlign: 'right' }}>₹{unitPrice}</Text>
              <Text style={{ flex: 0.5, textAlign: 'center' }}>{qty}</Text>
              <Text style={{ flex: 1, textAlign: 'right' }}>₹{sum}</Text>
            </View>
          );
        })}

        <View style={styles.grandTotalContainer}>
          <Text style={styles.grandTotalText}>Grand Total: ₹{grandTotal}</Text>
        </View>
      </ScrollView>

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          <Text style={styles.addToCartText}>
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>

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

  packInfo: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  packTitle: { fontSize: 18, fontWeight: 'bold' },
  packPrice: { fontSize: 20, fontWeight: 'bold', color: '#28a745' },

  scrollContainer: { marginHorizontal: 10 },
  scrollContent: { paddingBottom: 100 },
  contentsTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 5,
  },
  headerText: { color: '#fff', fontWeight: 'bold' },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
  },

  grandTotalContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  grandTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },

  floatingButtonContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
  },
  addToCartButton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  loadingText: { marginTop: 10, color: '#666' },
});

export default PackContentsScreen;
