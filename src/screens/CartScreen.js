import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  ScrollView,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../components/CustomHeader';
import BottomNavigation from '../components/BottomNavigation';
import Ionicons from 'react-native-vector-icons/Ionicons';


const CartScreen = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeUserAndCart();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user && user.id) {
        fetchCartItems();
      } else {
        initializeUserAndCart();
      }
    }, [user])
  );

  const initializeUserAndCart = async () => {
    await getCurrentUser();
    setTimeout(() => {
      if (user && user.id) {
        fetchCartItems();
      }
    }, 100);
  };

  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        const demoUser = { id: 1, name: 'Demo User' };
        setUser(demoUser);
        await AsyncStorage.setItem('userData', JSON.stringify(demoUser));
      }
    } catch {
      const demoUser = { id: 1, name: 'Demo User' };
      setUser(demoUser);
    }
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (currentUser && currentUser.id) {
        const response = await fetch(`https://freshgrupo-server.onrender.com/api/cart/${currentUser.id}`);
        const data = response.ok ? await response.json() : [];
        setCartItems(data);
      } else setCartItems([]);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await fetch(`https://freshgrupo-server.onrender.com/api/cart/${cartItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      // Update local state without fetching
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: newQuantity, totalPrice: (newQuantity * item.unitPrice).toFixed(2) }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Re-fetch on error
      fetchCartItems();
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await fetch(`https://freshgrupo-server.onrender.com/api/cart/${cartItemId}`, { method: 'DELETE' });
      // Update local state without fetching
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
    } catch (error) {
      console.error('Error removing item:', error);
      // Re-fetch on error
      fetchCartItems();
    }
  };

  const calculateTotal = () =>
    cartItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0).toFixed(2);

  const handleCheckout = () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    navigation.navigate('Payment', {
      cartItems,
      deliveryAddress,
      totalAmount: calculateTotal(),
    });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#1a8b43" barStyle="light-content" translucent={true} />
      <View style={styles.headerContainer}>
        <CustomHeader />
        {/* <Text style={styles.headerTitle}>🛒 Your Cart</Text> */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyEmoji}>🛍️</Text>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add some packs to get started!</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Categories')}
            >
              <Text style={styles.browseButtonText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Cart Items ({cartItems.length})</Text>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.cartTopRow}>
                  <View>
                    <Text style={styles.itemName}>
                      {item.isCustom ? item.customPackName : (item.Pack?.name || 'Unknown Pack')}
                    </Text>
                    <Text style={styles.itemType}>
                      {item.isCustom ? '🛒 Custom Pack' : `⏰ ${item.Pack?.PackType?.name || 'Unknown Type'}`}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                    <Text style={styles.trashIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cartBottomRow}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemPrice}>₹{item.totalPrice || 0}</Text>
                </View>
              </View>
            ))}

            <View style={styles.addressSection}>
             <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
  <Ionicons name="navigate-outline" size={20} color="#1a8b43" style={{ marginRight: 6 }} />
  <Text style={styles.sectionTitle}>Delivery Location</Text>
</View>

              <TextInput
                style={styles.addressInput}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Enter your complete delivery address"
                multiline
              />
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>💰 Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{calculateTotal()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={[styles.summaryValue, { color: '#1a8b43' }]}>Free</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.checkoutContainer}>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>💳 Proceed to Payment</Text>
          </TouchableOpacity>
        </View>
      )}

      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f2fdf5' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666' },
  headerContainer: {
    backgroundColor: '#1a8b43',
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  scrollContainer: { padding: 15, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginVertical: 10 },
  cartItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.8,
    borderColor: '#d9f0df',
  },
  cartTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemType: { fontSize: 14, color: '#1a8b43', marginTop: 4 },
  trashIcon: { fontSize: 20, color: '#dc3545' },
  cartBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  quantityControls: { flexDirection: 'row', alignItems: 'center' },
  qtyButton: {
    backgroundColor: '#1a8b43',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  qtyText: { marginHorizontal: 10, fontSize: 16, fontWeight: '600', color: '#333' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#1a8b43' },
  addressInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#d9f0df',
  },
  addressSection: { marginTop: 10 },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.8,
    borderColor: '#d9f0df',
  },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  summaryDivider: { borderTopWidth: 1, borderColor: '#d9f0df', marginVertical: 8 },
  summaryLabel: { fontSize: 15, color: '#333' },
  summaryValue: { fontSize: 15, color: '#333', fontWeight: '600' },
  totalLabel: { fontSize: 17, fontWeight: 'bold', color: '#1a8b43' },
  totalValue: { fontSize: 17, fontWeight: 'bold', color: '#1a8b43' },
  checkoutContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
  checkoutButton: {
    backgroundColor: '#1a8b43',
    marginHorizontal: 20,
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 3,
  },
  checkoutText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  emptyCart: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 60 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  emptySubtitle: { fontSize: 14, color: '#555', marginTop: 5 },
  browseButton: {
    backgroundColor: '#1a8b43',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
  },
  browseButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default CartScreen;
