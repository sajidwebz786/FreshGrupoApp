import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import CustomHeader from '../components/CustomHeader';

const mockAddresses = [
  { id: '1', name: 'Home', address: '462, Gandhipura, Whitefield, Bangalore' },
  { id: '2', name: 'Work', address: '456 Sigma Tech Park, Whitefield, Bangalore' },
];

const AddressScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category, packType, price, items } = route.params || {};
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState('');

  const handleSubmit = () => {
    const address = selectedAddress ? selectedAddress.address : newAddress;
    if (!address) {
      Alert.alert('Error', 'Please select or enter an address');
      return;
    }
    Alert.alert('Success', `Order submitted for ${packType} ${category} pack to ${address}!`);
    navigation.navigate('Categories');
  };

  const renderAddress = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.addressItem,
        selectedAddress?.id === item.id && styles.selectedAddress
      ]}
      onPress={() => setSelectedAddress(item)}
    >
      <Text style={styles.addressName}>{item.name}</Text>
      <Text style={styles.addressText}>{item.address}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../images/clean_app_bg.png')} // Very clean white background
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <CustomHeader />
        <Text style={styles.title}>Select or Add Address</Text>
        <FlatList
          data={mockAddresses}
          renderItem={renderAddress}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
        
        {/* Input + Button wrapper lifted upward */}
        <View style={styles.bottomWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Or add new address"
            value={newAddress}
            onChangeText={setNewAddress}
            placeholderTextColor="black"
            multiline
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 130,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  list: {
    width: '100%',
    marginBottom: 20,
  },
  addressItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    width: '100%',
  },
  selectedAddress: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
  },
  addressName: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 16,
    color: 'black',
  },
  bottomWrapper: {
    marginBottom: 250, // lifts input + button upward
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    color: 'black',
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
    minHeight: 60,
  },
  submitButton: {
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddressScreen;
