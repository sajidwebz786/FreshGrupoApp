import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';
import CustomHeader from '../components/CustomHeader';
import BottomNavigation from '../components/BottomNavigation';

const PackTypesScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { category } = route.params || {};
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const autoScrollInterval = useRef(null);

  console.log('PackTypesScreen route params:', route.params);
  console.log('PackTypesScreen category:', category);

  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const packOffers = [
    { id: 1, category: 'Weekly Pack', image: require('../../images/12.jpeg'), discount: '15% OFF on', title: 'Weekly Pack Special Offer' },
    { id: 2, category: 'Bi-Weekly Pack', image: require('../../images/13.jpeg'), discount: '20% OFF on', title: 'Bi-Weekly Pack Launch Offer' },
    { id: 3, category: 'Monthly Pack', image: require('../../images/14.jpeg'), discount: '25% OFF on', title: 'Monthly Pack Mega Offer' },
    { id: 4, category: 'Premium Pack', image: require('../../images/15.jpeg'), discount: '30% OFF on', title: 'Premium Pack Exclusive Deal' },
    { id: 5, category: 'Seasonal Pack', image: require('../../images/16.jpeg'), discount: '35% OFF on', title: 'Seasonal Pack Limited Time' },
  ];

  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollInterval.current = setInterval(() => {
        setActiveSlide(prev => {
          const next = (prev + 1) % packOffers.length;
          scrollViewRef.current?.scrollTo({ x: next * Dimensions.get('window').width, animated: true });
          return next;
        });
      }, 4000);
    };
    startAutoScroll();
    return () => clearInterval(autoScrollInterval.current);
  }, []);

  const handleScrollBegin = () => clearInterval(autoScrollInterval.current);
  const handleScrollEnd = () => {
    clearInterval(autoScrollInterval.current);
    autoScrollInterval.current = setInterval(() => {
      setActiveSlide(prev => {
        const next = (prev + 1) % packOffers.length;
        scrollViewRef.current?.scrollTo({ x: next * Dimensions.get('window').width, animated: true });
        return next;
      });
    }, 4000);
  };

  useEffect(() => {
    console.log('PackTypesScreen mounted with category:', category);
    fetchPacks();
  }, [category]);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      console.log('Fetching packs for category:', category);
      // Find category by name to get ID
      const categories = await api.getCategories();
      const selectedCategory = categories.find(cat => cat.name === category);
      console.log('Selected category:', selectedCategory);

      if (selectedCategory) {
        const data = await api.getPacksByCategory(selectedCategory.id);
        console.log('Packs data:', data);
        setPacks(data);
      } else {
        console.log('Category not found:', category);
        Alert.alert('Error', `Category "${category}" not found`);
      }
    } catch (error) {
      console.error('Error fetching packs:', error);
      Alert.alert('Error', 'Failed to fetch packs. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && packs.length > 0) {
      const animations = cardAnimations.map((anim, i) =>
        Animated.spring(anim, { toValue: 1, tension: 50, friction: 7, delay: i * 150, useNativeDriver: true })
      );
      Animated.stagger(100, animations).start();
    }
  }, [loading, packs]);

  const handleSelectPack = pack => {
    navigation.navigate('PackContents', {
      category: category,
      packType: pack.PackType.name,
      price: pack.finalPrice,
      packId: pack.id,
      duration: pack.PackType.duration,
    });
  };

  if (!category) {
    return (
      <View style={styles.centeredContainer}>
        <Text>No category selected</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <ImageBackground
        source={require('../../images/clean_app_bg.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#28a745" />
          <Text style={styles.loadingText}>Loading packs...</Text>
        </View>
      </ImageBackground>
    );
  }

  const getAvailablePackTypes = cat => {
    const base = [
      { name: 'Weekly Pack', description: 'Fresh delivery every week', color: '#8B4513', duration: 'weekly', icon: '📅', available: true },
      { name: 'Bi-Weekly Pack', description: 'Every two weeks delivery', color: '#DC143C', duration: 'bi-weekly', icon: '📆', available: true },
      { name: 'Monthly Pack', description: 'Once a month delivery', color: '#9932CC', duration: 'monthly', icon: '📊', available: true },
      { name: 'Custom Pack', description: 'Create your own pack', color: '#176ecaf5', duration: 'custom', icon: '🛒', available: true },
    ];

    // All pack types are now available for all categories
    return base;
  };

  const packTypes = getAvailablePackTypes(category);


  return (
    <View style={styles.mainContainer}>
      {/* Only status bar green; rest is normal */}
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" translucent={true} />
      <View style={styles.headerContainer}>
        <CustomHeader />
      </View>
      <ImageBackground source={require('../../images/innerimage.png')} style={styles.background} resizeMode="cover" opacity={0.1}>
        <View style={styles.scrollContainer}>
          <View style={styles.offersContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={Dimensions.get('window').width}
              onScroll={event => setActiveSlide(Math.round(event.nativeEvent.contentOffset.x / Dimensions.get('window').width))}
              scrollEventThrottle={16}
              onTouchStart={handleScrollBegin}
              onMomentumScrollEnd={handleScrollEnd}
              onScrollBeginDrag={handleScrollBegin}
              onScrollEndDrag={handleScrollEnd}
            >
              {packOffers.map(offer => (
                <View key={offer.id} style={styles.offerCard}>
                  <ImageBackground source={offer.image} style={styles.offerBackground} imageStyle={{ borderRadius: 15 }}>
                    <View style={styles.discountOverlay}>
                      <Text style={styles.discountText}>{offer.discount}</Text>
                      <Text style={styles.offerTitle}>{offer.title}</Text>
                    </View>
                  </ImageBackground>
                </View>
              ))}
            </ScrollView>
            <View style={styles.paginationDots}>
              {packOffers.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.dot, activeSlide === i ? styles.activeDot : styles.inactiveDot]}
                  onPress={() => scrollViewRef.current?.scrollTo({ x: i * Dimensions.get('window').width, animated: true })}
                />
              ))}
            </View>
          </View>

          <Text style={styles.title}>Choose Pack Type for {category}</Text>
          <View style={styles.categoriesGrid}>
            {packTypes.map((pack, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: pack.available ? pack.color : '#ccc',
                    opacity: pack.available ? cardAnimations[i] : 0.5,
                    transform: pack.available
                      ? [
                          { scale: cardAnimations[i].interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
                          { translateY: cardAnimations[i].interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
                        ]
                      : [],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.cardTouchable}
                  disabled={!pack.available}
                  onPress={() => {
                    if (pack.duration === 'custom') navigation.navigate('CustomPack', { category });
                    else {
                      const selectedPack = packs.find(p => p.PackType.duration === pack.duration);
                      if (selectedPack) handleSelectPack(selectedPack);
                    }
                  }}
                >
                  <Text style={styles.packIcon}>{pack.icon}</Text>
                  <Text style={styles.categoryTitle}>{pack.name}</Text>
                  <Text style={styles.categoryText}>{pack.description}</Text>
                  {!pack.available && <Text style={styles.unavailableText}>Coming Soon</Text>}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </ImageBackground>

      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 }, // removed green
  headerContainer: {
    paddingTop: 50,
    backgroundColor: '#4CAF50',
  },
  background: { flex: 1 },
  scrollContainer: { flex: 1 },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: 'white', marginTop: 10, textAlign: 'center' },
  offersContainer: { height: 180, marginVertical: 10 },
  offerCard: { width: Dimensions.get('window').width, height: 180, paddingHorizontal: 10 },
  offerBackground: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  discountOverlay: { position: 'absolute', top: 20, left: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15 },
  discountText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  offerTitle: { color: '#fff', fontSize: 12, marginTop: 2 },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  activeDot: { backgroundColor: '#4CAF50' },
  inactiveDot: { backgroundColor: '#ddd' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center', marginTop: 20 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 10, alignItems: 'center', marginTop: 20 },
  categoryCard: { width: '30%', height: 150, marginVertical: 6, marginHorizontal: 5, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardTouchable: { width: '100%', padding: 10, alignItems: 'center' },
  packIcon: { fontSize: 36, marginBottom: 6 },
  categoryTitle: { fontSize: 14, fontWeight: 'bold', color: 'white', marginBottom: 2, textAlign: 'center' },
  categoryText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  unavailableText: { fontSize: 10, color: '#999', textAlign: 'center', marginTop: 2, fontStyle: 'italic' },
});

export default PackTypesScreen;
