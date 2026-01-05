import React from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text, ScrollView, RefreshControl } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Font from 'expo-font';
import ScreenTitle from '@/components/screenTitle';
import FullScreenImageModal from '@/components/imageModal';
import { useMenuItems } from '@/contexts/DataContext'; // 👈 NEW: Import the hook

const HomeScreen = () => {
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });

  // Use the hook instead of hardcoded data
  const { menuItems, isLoading, isRefreshing, refetch } = useMenuItems();

  // Show loading indicator while data is being fetched
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaViewContainer}>
        <ScreenTitle>B2B</ScreenTitle>
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color="#F9F2EA" />
          <Text style={{ color: '#F9F2EA', marginTop: 20 }}>Loading menu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScreenTitle>B2B</ScreenTitle>

      <ScrollView 
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor="#F9F2EA"
            title="Actualisation..."
            titleColor="#F9F2EA"
          />
        }
      >
      <View style={styles.container}>

        {/* Use menuItems from the hook */}
        {menuItems.map((card, index) => (
          <View key={index} style={styles.card}>
            <Ionicons name={card.icon} size={48} color="#F2784B" style={{paddingBottom : 10}} />
            <FullScreenImageModal
              buttonText={card.title}
              imageSource={card.image}
            />
          </View>
        ))}
      </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: '#5a9adb',
    marginBottom: 50,
  },
  container: {
    flex: 1,
    backgroundColor: '#5a9adb',
    padding: 20,
    alignItems: 'center',
  },
  card: {
    width: 300,
    height: 200,
    margin: 20,
    borderRadius: 10,
    backgroundColor: '#F9F2EA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default HomeScreen;
