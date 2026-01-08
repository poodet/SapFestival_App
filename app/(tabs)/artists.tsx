import React, { useRef, useEffect, useState } from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  View, 
  Image, 
  Dimensions, 
  ActivityIndicator, 
  RefreshControl,
  Platform 
} from 'react-native';
import Animated from 'react-native-reanimated';
import * as Font from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import imageMapper from '@/components/imageMapper';
import ScreenTitle from '@/components/screenTitle';
import { useArtists } from '@/contexts/DataContext';
import theme from '@/constants/theme'; 
import { useHighlightItem } from '@/hooks/useHighlightItem';
import ThemedText from '@/components/ThemedText';

const { width } = Dimensions.get('window');

export default function ArtistsScreen() {
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });

  const { artists, isLoading, isRefreshing, refetch } = useArtists();
  
  // Use the highlight hook
  const { 
    animatedStyle, 
    isItemHighlighted, 
    flatListRef 
  } = useHighlightItem({ 
    items: artists,
    pulseCount: 2, // Double pulse animation
  });

  const handleScrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaViewContainer}>
        <ScreenTitle>ARTISTES</ScreenTitle>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.background.secondary} />
          <Text style={{ color: theme.background.secondary, marginTop: 20 }}>Loading artists...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScreenTitle>ARTISTES</ScreenTitle>
      <FlatList
        ref={flatListRef}
        data={artists}
        keyExtractor={(item) => item.id.toString()}
        onScrollToIndexFailed={(info) => {
          // Handle scroll failure gracefully
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: 0.2,
            });
          });
        }}
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
                <View style={styles.cardTop}>
                  <Image
                    alt=""
                    resizeMode="cover"
                    source={imageMapper[item.image]}
                    style={styles.cardImg}
                  />
                  <View style={styles.cardTopPills}>
                    <View style={[styles.cardTopPill, { paddingLeft: 6 }]}>
                      <Text style={styles.cardTopPillText}>{item.style}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
                    <Text style={[styles.cardDescription, { textAlign: 'right' }]}>{item.duration}</Text>
                  </View>
                  <Text style={styles.cardDescription}>{item.bio}</Text>
                </View>
              </View>
            </Animated.View>
          );
        }}
        contentContainerStyle={styles.scrollContent}
      />
      <TouchableOpacity style={styles.scrollToTopButton} onPress={handleScrollToTop}>
        <Ionicons name="arrow-up" size={24} color={theme.text.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
    marginBottom: 50,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 50,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: theme.background.dark,
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  card: {
    padding: 12,
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: theme.background.secondary,
    width: '90%',
    maxWidth : 500,
    alignSelf: 'center'
  },
  highlightedCard: {
    borderWidth: 3,
    borderColor: theme.interactive.secondary,
    shadowColor: theme.interactive.secondary,
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: 12,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  cardTop: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: width * 0.65,
    borderRadius: 24,
  },
  cardTopPills: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: theme.background.overlay,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardTopPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTopPillText: {
    color: theme.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d1d1d',
  },
  cardDescription: {
    fontSize: 14,
    color: '#3c3c3c',
    textAlign : 'justify'
  },
});
