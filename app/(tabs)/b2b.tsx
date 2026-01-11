import React from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text, FlatList, RefreshControl, Dimensions, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import * as Font from 'expo-font';
import ScreenTitle from '@/components/screenTitle';
import { useMenuItems, useDrinkItems } from '@/contexts/DataContext';
import { MenuItem, DrinkItem } from '@/types/data';
import { useHighlightItem } from '@/hooks/useHighlightItem';
import theme, { layout } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';

const { width } = Dimensions.get('window');

export default function FoodDrinkScreen() {
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });
  // Use the hook instead of hardcoded data
  const { menuItems, isLoading, isRefreshing, refetch } = useMenuItems();
  const { drinkItems, isLoading: isDrinksLoading, isRefreshing: isDrinksRefreshing, refetch: refetchDrinks } = useDrinkItems();

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

  // Group drinks by category
  const groupedDrinks = React.useMemo(() => {
    const groups: { [category: string]: DrinkItem[] } = {};
    drinkItems.forEach(drink => {
      if (!groups[drink.category]) {
        groups[drink.category] = [];
      }
      groups[drink.category].push(drink);
    });
    return groups;
  }, [drinkItems]);

  // Show loading indicator while data is being fetched
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaViewContainer}> 
        <ScreenTitle>A manger</ScreenTitle>
        <View style={{ justifyContent: 'center', alignItems: 'center' , flex: 1}}>
          <ActivityIndicator size="large" color={theme.background.secondary} />
          <Text style={{ color: theme.background.secondary, marginTop: 20 }}>Loading menu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScreenTitle>A manger</ScreenTitle>

      <View style={{ flexShrink: 1 }}>
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
                    <ThemedText style={styles.categoryTitle}>{item.moment_name}</ThemedText>
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
          // contentContainerStyle={styles.list}
        />
      </View>

      <ScreenTitle >A Boire</ScreenTitle>
      <View style={{ flex: 1 }}>
        {isDrinksLoading ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color={theme.background.secondary} />
            <Text style={{ color: theme.background.secondary, marginTop: 20 }}>Loading drinks...</Text>
          </View>
        ) : (
          <FlatList
            data={Object.keys(groupedDrinks)}
            keyExtractor={(category) => category}
            refreshControl={
              <RefreshControl
                refreshing={isDrinksRefreshing}
                onRefresh={refetchDrinks}
                tintColor={theme.background.secondary}
                title="Actualisation..."
                titleColor={theme.background.secondary}
              />
            }
            renderItem={({ item: category }) => (
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <ThemedText style={styles.categoryTitle}>{category}</ThemedText>
                </View>
                {groupedDrinks[category].map((drink) => (
                  <View key={drink.id} style={[styles.cardContent, { flexDirection:'row', alignItems:'center' }]}>
                    <Text style={styles.drinkName}>{drink.name}</Text>
                    <Text style={styles.drinkDescription}>{drink.description}</Text>
                  </View>
                ))}
              </View>
            )}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  list: {
    alignItems: 'stretch',
    paddingBottom: layout.tabBar.contentPadding,
  },
  card: {
    backgroundColor: theme.background.secondary,
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.02,
    marginBottom: 10,
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
    borderColor: theme.interactive.primary,
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
    marginVertical: 1,
  },
  categoryTitle: {
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
  drinkName: {
    fontSize: width < 350 ? 14 : 16,
    fontWeight: '600',
    color: theme.background.dark,
    flexShrink: 1,
  },
  drinkDescription: {
    fontSize: width < 350 ? 11 : 13,
    fontWeight: '400',
    color: '#545454',
    flexShrink: 1,
  },
});

