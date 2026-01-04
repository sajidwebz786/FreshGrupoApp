import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BottomNavigation = () => {
  const navigation = useNavigation();

  const menuItems = [
    { icon: 'home-outline', text: 'Home', onPress: () => navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Drawer' }] })) },
    { icon: 'list-outline', text: 'Categories', onPress: () => navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Drawer' }] })) },
    { icon: 'cart-outline', text: 'Cart', onPress: () => navigation.navigate('Cart') },
    { icon: 'person-outline', text: 'Profile', onPress: () => navigation.openDrawer() },
  ];

  return (
    <View style={styles.bottomMenu}>
      {menuItems.map((item, index) => (
        <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
          <Ionicons name={item.icon} size={20} color="#fff" />
          <Text style={styles.menuText}>{item.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomMenu: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 6,
  },
  menuItem: { alignItems: 'center' },
  menuText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
});

export default BottomNavigation;