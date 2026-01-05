import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import CustomHeader from '../components/CustomHeader';
import BottomNavigation from '../components/BottomNavigation';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems, deliveryAddress, totalAmount } = route.params || {};

  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Razorpay options
      const options = {
        key: 'rzp_test_RpA1MZUCwoJYJF', // Razorpay key_id
        amount: totalAmount * 100, // Amount in paisa
        currency: 'INR',
        name: 'Fresh Grupo',
        description: 'Payment for order',
        // order_id: 'order_' + Date.now(), // In production, get from backend
        prefill: {
          email: 'user@example.com', // Get from user data
          contact: '9999999999', // Get from user data
          name: 'User Name', // Get from user data
        },
        theme: { color: '#4CAF50' },
      };

      const data = await RazorpayCheckout.open(options);

      // Payment success
      Alert.alert('Success', `Payment successful! Payment ID: ${data.razorpay_payment_id}`, [
        { text: 'OK', onPress: () => placeOrder('online', data) }
      ]);
    } catch (error) {
      console.log('Razorpay error:', error);
      Alert.alert('Error', `Payment failed: ${error ? (error.description || error.message || 'Unknown error') : 'Payment cancelled'}`);
    } finally {
      setProcessing(false);
    }
  };

  const placeOrder = async (paymentMethod, paymentDetails = null) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (!currentUser || !currentUser.id) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }

      for (const item of cartItems) {
        const orderData = {
          userId: currentUser.id,
          quantity: item.quantity,
          deliveryAddress: deliveryAddress,
          paymentMethod: paymentMethod,
          totalAmount: totalAmount,
        };

        if (item.isCustom) {
          // For custom packs
          orderData.isCustom = true;
          orderData.customPackName = item.customPackName;
          orderData.customPackItems = JSON.stringify(item.customPackItemsParsed || []);
          orderData.unitPrice = item.unitPrice;
        } else {
          // For regular packs
          orderData.packId = item.packId;
        }

        const response = await fetch('https://freshgrupo-server.onrender.com/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) throw new Error('Failed to create order');

        const newOrder = await response.json();

        // If online payment, update payment details
        if (paymentMethod === 'online' && paymentDetails) {
          await fetch(`https://freshgrupo-server.onrender.com/api/orders/${newOrder.id}/payment`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayPaymentId: paymentDetails.razorpay_payment_id,
              razorpayOrderId: paymentDetails.razorpay_order_id,
              status: 'completed'
            })
          });
        }
      }

      Alert.alert('Success', 'Order placed successfully!');
      navigation.dispatch(CommonActions.reset({
        index: 0,
        routes: [{ name: 'Drawer' }],
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };

  const handleCOD = () => {
    placeOrder('cod');
  };


  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" translucent={true} />
      <View style={styles.headerContainer}>
        <CustomHeader />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Complete Your Payment</Text>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Amount:</Text>
          <Text style={styles.amountValue}>₹{totalAmount}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.payButton, processing && styles.disabledButton]}
            onPress={handlePayment}
            disabled={processing}
          >
            <Text style={styles.payButtonText}>
              {processing ? 'Processing...' : `Pay Online ₹${totalAmount}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.codButton]} onPress={handleCOD}>
            <Text style={styles.codButtonText}>Cash on Delivery</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollContainer: { flex: 1, padding: 20, paddingBottom: 100 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
  amountContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 15, elevation: 2 },
  amountLabel: { fontSize: 16, color: '#666' },
  amountValue: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },
  buttonContainer: { marginTop: 20 },
  payButton: { backgroundColor: '#4CAF50', paddingVertical: 15, borderRadius: 10, alignItems: 'center', elevation: 3, marginBottom: 15 },
  codButton: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#4CAF50', paddingVertical: 15, borderRadius: 10, alignItems: 'center', elevation: 2 },
  disabledButton: { backgroundColor: '#ccc' },
  payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  codButtonText: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' },
});

export default PaymentScreen;