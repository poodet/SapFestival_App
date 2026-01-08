import React from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text, FlatList, RefreshControl, Dimensions, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import * as Font from 'expo-font';
import ScreenTitle from '@/components/screenTitle';
import { useMenuItems } from '@/contexts/DataContext';
import { MenuItem } from '@/types/data';
import { useHighlightItem } from '@/hooks/useHighlightItem';
import theme from '@/constants/theme';
import ThemedText from '@/components/ThemedText';

const { width } = Dimensions.get('window');

export default function FoodDrinkScreen() {
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });
  // Use the hook instead of hardcoded data
  const { menuItems, isLoading, isRefreshing, refetch } = useMenuItems();

  // Use the highlight hook
  const { 
    currentHighlightId, 
    animatedStyle, 
    isItemHighlighted, 
    flatListRef 
  } = useHighlightItem({ 
    items: menuItems,
    pulseCount: 2, // Double pulse animation
  });

  // Show loading indicator while data is being fetched
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaViewContainer}>
        <ScreenTitle>A manger</ScreenTitle>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={theme.background.secondary} />
          <Text style={{ color: theme.background.secondary, marginTop: 20 }}>Loading menu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScreenTitle>A manger</ScreenTitle>

      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={menuItems}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refetch}
              tintColor={theme.background.secondary}
              title="Actualisation..."
              titleColor={theme.background.secondary}
            />
          }
          renderItem={({ item }) => {
            const isHighlighted = isItemHighlighted(item.id);
            return (
              <Animated.View style={isHighlighted ? animatedStyle : undefined}>
                <View style={[
                  styles.card,
                  isHighlighted && styles.highlightedCard
                ]}>
                  <View style={styles.cardContent}>
                    <ThemedText style={styles.momentName}>{item.moment_name}</ThemedText>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  </View>
                </View>
              </Animated.View>
            );
          }}
          contentContainerStyle={styles.list}
        />
      </View>

      <ScreenTitle>A Boire</ScreenTitle>
      <View style={styles.container}>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
    marginBottom: 50,
  },
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  list: {
    paddingVertical: 20,
    alignItems: 'stretch',
    // paddingBottom: 50,
  },
  card: {
    backgroundColor: theme.background.secondary,
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.02,
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: theme.ui.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 5 : 0,
    width: '90%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  highlightedCard: {
    borderWidth: 3,
    borderColor: theme.interactive.secondary,
    shadowColor: theme.interactive.secondary,
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: 12,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  cardContent: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  momentName: {
    fontSize: width < 350 ? 16 : 20,
    fontWeight: '700',
    color: theme.background.dark,
    flexShrink: 1,
  },
  menuTitle: {
    fontSize: width < 350 ? 14 : 18,
    fontWeight: '600',
    color: theme.background.dark,
    flexShrink: 1,
  },
  menuDescription: {
    fontSize: width < 350 ? 12 : 15,
    fontWeight: '400',
    color: '#545454',
    flexShrink: 1,
    textAlign: 'justify',
  },
});

