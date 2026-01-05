import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, Text, 
  TouchableOpacity, View, Image, Dimensions, 
  ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Font from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import imageMapper from '@/components/imageMapper';
import ScreenTitle from '@/components/screenTitle';
import { useArtists } from '@/contexts/DataContext'; 

const { width } = Dimensions.get('window');

export default function ArtistsScreen() {
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });

  // const { artists, isLoading } = useArtists();
  const { artists, isLoading, isRefreshing, refetch } = useArtists();
  const { focusArtist } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const [offsets, setOffsets] = useState<{ [key: number]: number }>({});

  const handleLayout = (id: number, event: any) => {
    const offsetY = event.nativeEvent.layout.y;
    setOffsets((prev) => ({ ...prev, [id]: offsetY }));
  };

  const handleScrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  useEffect(() => {
    if (focusArtist) {
      const id = parseInt(focusArtist as string, 10);
      const targetOffset = offsets[id];
      if (targetOffset !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: targetOffset, animated: true });
      }
    }
  }, [focusArtist, offsets]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaViewContainer}>
        <ScreenTitle>ARTISTS</ScreenTitle>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#F9F2EA" />
          <Text style={{ color: '#F9F2EA', marginTop: 20 }}>Loading artists...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScreenTitle>ARTISTS</ScreenTitle>
      <ScrollView 
        ref={scrollViewRef} 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
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
        {artists.map(({ id, image, name, bio, duration, style }, index) => (
          <View key={`artist-${index}`} style={styles.card} onLayout={(event) => handleLayout(id, event)}>
            <View style={styles.cardTop}>
              <Image
                alt=""
                resizeMode="cover"
                source={imageMapper[image]}
                style={styles.cardImg}
              />
              <View style={styles.cardTopPills}>
                <View style={[styles.cardTopPill, { paddingLeft: 6 }]}>
                  <Text style={styles.cardTopPillText}>{style}</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{name}</Text>
                <Text style={[styles.cardDescription, { textAlign: 'right' }]}>{duration}</Text>
              </View>
              <Text style={styles.cardDescription}>{bio}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.scrollToTopButton} onPress={handleScrollToTop}>
        <Ionicons name="arrow-up" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: '#5a9adb',
    marginBottom: 50,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: '#25292e',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  container: {
    paddingHorizontal: 16,
  },
  card: {
    padding: 12,
    borderRadius: 24,
    marginBottom: 24,
    backgroundColor: '#F9F2EA',
    width: '90%',
    maxWidth : 500,
    alignSelf: 'center'
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardTopPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTopPillText: {
    color: 'white',
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
