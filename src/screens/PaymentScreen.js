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
import CustomHeader from '../components/CustomHeader';
import BottomNavigation from '../components/BottomNavigation';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems, deliveryAddress, totalAmount } = route.params || {};

  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [upiId, setUpiId] = useState('');
  const [selectedUPI, setSelectedUPI] = useState('');
  const [processing, setProcessing] = useState(false);

  const upiOptions = [
    { id: 'gpay', name: 'Google Pay', logo: 'https://logo.svgcdn.com/logos/google-pay.png' },
    { id: 'paytm', name: 'Paytm', logo: 'https://logo.svgcdn.com/s/paytm-dark.png' },
    { id: 'phonepe', name: 'PhonePe', logo: 'https://logo.svgcdn.com/simple-icons/phonepe-dark.png' },
    { id: 'other', name: 'Other UPI', icon: '🔗' },
  ];

  const handlePayment = async () => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo, assume payment success
      Alert.alert('Success', 'Payment processed successfully!', [
        { text: 'OK', onPress: () => placeOrder() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const placeOrder = async () => {
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
    setPaymentMethod('COD');
    placeOrder();
  };

  const renderCardForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Card Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Card Number"
        value={cardDetails.number}
        onChangeText={(text) => setCardDetails({...cardDetails, number: text})}
        keyboardType="numeric"
        maxLength={16}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 10 }]}
          placeholder="MM/YY"
          value={cardDetails.expiry}
          onChangeText={(text) => setCardDetails({...cardDetails, expiry: text})}
          maxLength={5}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="CVV"
          value={cardDetails.cvv}
          onChangeText={(text) => setCardDetails({...cardDetails, cvv: text})}
          keyboardType="numeric"
          maxLength={3}
          secureTextEntry
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Cardholder Name"
        value={cardDetails.name}
        onChangeText={(text) => setCardDetails({...cardDetails, name: text})}
      />
    </View>
  );

  const renderUPIForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>UPI Payment</Text>
      <View style={styles.upiOptions}>
        {upiOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.upiOption, selectedUPI === option.id && styles.selectedUPI]}
            onPress={() => setSelectedUPI(option.id)}
          >
            {option.logo ? (
              <Image source={{ uri: option.logo }} style={styles.upiLogo} />
            ) : (
              <Text style={styles.upiIcon}>{option.icon}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter UPI ID (e.g., user@paytm)"
        value={upiId}
        onChangeText={setUpiId}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" translucent={true} />
      <View style={styles.headerContainer}>
        <CustomHeader />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Choose Payment Method</Text>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Total Amount:</Text>
          <Text style={styles.amountValue}>₹{totalAmount}</Text>
        </View>

        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'card' && styles.selectedOption]}
            onPress={() => setPaymentMethod('card')}
          >
            <Text style={styles.optionIcon}>💳</Text>
            <Text style={styles.optionText}>Credit/Debit Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'upi' && styles.selectedOption]}
            onPress={() => setPaymentMethod('upi')}
          >
            <Text style={styles.optionIcon}>📱</Text>
            <Text style={styles.optionText}>UPI Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cod' && styles.selectedOption]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Text style={styles.optionIcon}>🚚</Text>
            <Text style={styles.optionText}>Cash on Delivery</Text>
          </TouchableOpacity>
        </View>

        {paymentMethod === 'card' && renderCardForm()}
        {paymentMethod === 'upi' && renderUPIForm()}

        <View style={styles.buttonContainer}>
          {paymentMethod === 'cod' ? (
            <TouchableOpacity style={styles.payButton} onPress={handleCOD}>
              <Text style={styles.payButtonText}>Place Order (Cash on Delivery)</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.payButton, processing && styles.disabledButton]}
              onPress={handlePayment}
              disabled={processing}
            >
              <Text style={styles.payButtonText}>
                {processing ? 'Processing...' : `Pay ₹${totalAmount}`}
              </Text>
            </TouchableOpacity>
          )}
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
  paymentOptions: { marginBottom: 15 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, elevation: 2 },
  selectedOption: { borderColor: '#4CAF50', borderWidth: 2 },
  optionIcon: { fontSize: 24, marginRight: 15 },
  optionText: { fontSize: 16, fontWeight: '600', color: '#333' },
  formContainer: { backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 15, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 8 },
  row: { flexDirection: 'row' },
  upiOptions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 5 },
  upiOption: { alignItems: 'center', backgroundColor: '#f0f0f0', padding: 5, borderRadius: 8, width: '48%', marginBottom: 5 },
  selectedUPI: { backgroundColor: '#4CAF50' },
  upiIcon: { fontSize: 20, marginBottom: 5 },
  upiLogo: { width: 40, height: 20, marginBottom: 2, resizeMode: 'contain' },
  upiText: { fontSize: 12, fontWeight: '600', color: '#333' },
  buttonContainer: { marginTop: 10 },
  payButton: { backgroundColor: '#4CAF50', paddingVertical: 15, borderRadius: 10, alignItems: 'center', elevation: 3 },
  disabledButton: { backgroundColor: '#ccc' },
  payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default PaymentScreen;