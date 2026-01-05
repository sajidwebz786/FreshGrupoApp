import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../components/CustomHeader';
import BottomNavigation from '../components/BottomNavigation';

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (!currentUser || !currentUser.id) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }

      const response = await fetch(`https://freshgrupo-server.onrender.com/api/orders/${currentUser.id}`);
      if (response.ok) {
        const orderData = await response.json();
        setOrders(orderData);
      } else {
        Alert.alert('Error', 'Failed to fetch order history');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.orderTotal}>Total: ₹{item.totalAmount}</Text>
      <Text style={styles.paymentMethod}>Payment: {item.paymentMethod}</Text>
      <Text style={styles.orderStatus}>Order Status: {item.status || 'Processing'}</Text>
      {item.payment && (
        <Text style={styles.paymentStatus}>Payment Status: {item.payment.status}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" translucent={true} />
      <View style={styles.headerContainer}>
        <CustomHeader />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Order History</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading orders...</Text>
        ) : orders.length === 0 ? (
          <Text style={styles.emptyText}>No orders found</Text>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  content: { flex: 1, padding: 20, paddingBottom: 100 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  loadingText: { textAlign: 'center', fontSize: 16, color: '#666' },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#666' },
  orderItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  orderDate: { fontSize: 14, color: '#666' },
  orderTotal: { fontSize: 16, fontWeight: '600', color: '#4CAF50', marginBottom: 5 },
  paymentMethod: { fontSize: 14, color: '#666', marginBottom: 5 },
  orderStatus: { fontSize: 14, color: '#666' },
  paymentStatus: { fontSize: 14, color: '#666' },
});

export default OrderHistoryScreen;