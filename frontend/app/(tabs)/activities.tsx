import React, { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Button, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import * as Font from 'expo-font';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import Animated from 'react-native-reanimated';
import ScreenTitle from '@/components/screenTitle';
import { useRouter } from 'expo-router';
import { useHighlight } from '@/contexts/HighlightContext';
import InfoHeaderButton from '@/components/InfoHeaderButton';
import { useActivities, useOrgas } from '@/contexts/DataContext';
import {theme, layout} from '@/constants/theme'; 
import { extractDayName, extractTime } from '@/services/calendar.service';
import { useHighlightItem } from '@/hooks/useHighlightItem';
import ThemedText from '@/components/ThemedText';
import { SubscribeButton } from '@/components/SubscribeButton';


const { width } = Dimensions.get('window');

export default function ActivityScreen() {
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });

  const { activities, isLoading, isRefreshing, refetch } = useActivities();
  const { orgas } = useOrgas();
  const router = useRouter();
  const { setHighlightId, clearHighlight } = useHighlight();
  
  // Use the highlight hook
  const { 
    currentHighlightId, 
    animatedStyle, 
    isItemHighlighted, 
    flatListRef 
  } = useHighlightItem({ 
    items: activities,
    pulseCount: 2, // Double pulse animation
  });

  const currentSound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSource, setCurrentSource] = useState<number | null>(null);

  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);

  // When an activity is highlighted externally, open its card
  useEffect(() => {
    if (currentHighlightId) {
      const id = parseInt(currentHighlightId, 10);
      if (!Number.isNaN(id)) setExpandedActivity(id);
    }
  }, [currentHighlightId]);
  

  // Navigate to orgas list and highlight matching organizer
  const navigateToPersonCard = (personName: string) => {
    // Find the orga that matches the person name
    const matchingOrga = orgas?.find((orga: any) => {
      const fullName = `${orga.firstName} ${orga.lastName}`.trim();
      return fullName === personName.trim();
    });

    if (matchingOrga) {
      setHighlightId(matchingOrga.id.toString());
      router.push('/(tabs)/pratique');
    } else {
      // Still navigate but without highlight
      router.push('/(tabs)/pratique');
    }
  };

  useEffect(() => {
    return () => {
      if (currentSound.current) {
        currentSound.current.unloadAsync();
      }
    };
  }, []);

  const togglePlayPause = async (source: number) => {
    if (!currentSound.current) {
      const { sound } = await Audio.Sound.createAsync(source);
      currentSound.current = sound;
      setCurrentSource(source);
      await sound.playAsync();
      setIsPlaying(true);
      return;
    }

    if (currentSource === source) {
      const status = await currentSound.current.getStatusAsync();

      if (status.isPlaying) {
        await currentSound.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await currentSound.current.playAsync();
        setIsPlaying(true);
      }
    } else {
      await currentSound.current.stopAsync();
      await currentSound.current.unloadAsync();

      const { sound } = await Audio.Sound.createAsync(source);
      currentSound.current = sound;
      setCurrentSource(source);
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaViewContainer}>
        <ScreenTitle>ACTIVITIES</ScreenTitle>
        <InfoHeaderButton />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={theme.background.secondary} />
          <Text style={{ color: theme.background.secondary, marginTop: 20 }}>Loading activities...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScreenTitle>ACTIVITES</ScreenTitle>
      <InfoHeaderButton />
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={activities}
          keyExtractor={(item) => item.id.toString()}
          bounces={false}
          overScrollMode="never"
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
            const isOpen = expandedActivity === item.id;
            
            return (
              <Animated.View style={isHighlighted ? animatedStyle : undefined}>
                <View style={[
                  styles.card,
                  isHighlighted && styles.highlightedCard
                ]}>
                  <View style={[styles.cardContent, {flexWrap : 'nowrap',flexDirection:'row'}]}>
                    <ThemedText style={styles.name}>{item.name}</ThemedText>
                    <View style={{ position: 'absolute', top: 5, right: 5, zIndex: 2 }} >
                      <SubscribeButton type="activity" id={item.id} compact />
                    </View>
                  </View>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        // Clear any external highlight when user manually opens another card
                        clearHighlight();
                        setExpandedActivity(prev => (prev === item.id ? null : item.id));
                      }}
                    >
                      <View style={styles.cardContent}>
                        <Text style={styles.detail}>📅 
                          {
                          ' '+ extractDayName(item.date_start) + ' ' + extractTime(item.date_start) + ' - ' + extractTime(item.date_end)
                          }
                        </Text>
                        { item.location ? (
                        <View>
                          <Text style={styles.detail}>📍 {item.location}</Text>
                        </View>
                        ) : null }
                      </View>
                    </TouchableOpacity>

                    <Collapsible collapsed={!isOpen} duration={300} align="top">
                    
                      <View style={[styles.detail, { flexDirection: 'row', justifyContent: 'left' }]}>
                        {/* 🧙🏻‍♀️🧙‍♂️ */}
                        {item.respo.map((person, index) => (
                          <TouchableOpacity 
                          style={{borderWidth: 1, borderColor: theme.interactive.primary, borderRadius: 5, paddingHorizontal: 5, marginRight: 5}}
                          
                          key={index} onPress={() => navigateToPersonCard(person)}>
                            <Text style={styles.detail}> {person}  </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {item.info ? (
                        <View style={styles.cardContent}>
                          <Text style={[styles.detail, {fontWeight : 400}]}>{item.info}</Text>
                        </View>
                      ) : null}
                    </Collapsible>
                  

                </View>
              </Animated.View>
            );
          }}
          contentContainerStyle={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  list: {
    paddingVertical: 20,
    alignItems: 'stretch',
    paddingBottom: layout.tabBar.contentPadding,
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
    borderColor: theme.interactive.primary,
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
    shadowRadius: 12,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  cardContent: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems : 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  name: {
    fontSize: width < 350 ? 14 : 18,
    fontWeight: '700',
    color: theme.background.dark,
    flexShrink: 1,
    paddingRight: 10,
  },

  detail: {
    fontSize: width < 350 ? 12 : 15,
    fontWeight: '500',
    color: '#545454',
    flexShrink: 1,
    textAlign :'justify'
  },
  participation: {
    fontSize: width < 350 ? 12 : 15,
    fontWeight: '500',
    color: '#545454',
    flexShrink: 1,
    textAlign :'left'
  },
});
