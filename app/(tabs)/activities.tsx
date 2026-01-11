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
import Animated from 'react-native-reanimated';
import ScreenTitle from '@/components/screenTitle';
import { useActivities } from '@/contexts/DataContext';
import {theme, layout} from '@/constants/theme'; 
import { extractDayName, extractTime } from '@/services/calendar.service';
import { useHighlightItem } from '@/hooks/useHighlightItem';
import ThemedText from '@/components/ThemedText';

const { width } = Dimensions.get('window');

export default function ActivityScreen() {
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });

  const { activities, isLoading, isRefreshing, refetch } = useActivities();
  
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

  const sound1 = require('../../sounds/Le_SAP_dans_l_espace_(reggae_version).mp3');
  const sound2 = require('../../sounds/Le_SAP_dans_l_espace.mp3');
  const sound3 = require('../../sounds/SAP_en_el_espacio.mp3');

  const currentSound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSource, setCurrentSource] = useState<number | null>(null);

  // Placeholder for future implementation
  const navigateToPersonCard = (person: any) => {
    // TODO: Implement person card navigation
    console.log('Navigate to person card:', person);
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
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={activities}
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
                  <View style={[styles.cardContent, {flexWrap : 'nowrap',flexDirection:'row'}]}>
                    <ThemedText style={styles.name}>{item.name}</ThemedText>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.detail}>📅 
                      {
                       ' '+ extractDayName(item.date_start) + ' ' + extractTime(item.date_start) + ' - ' + extractTime(item.date_end)
                      }
                    </Text>
                    <Text style={styles.detail}>📍 {item.location}</Text>
                  </View>
                    <View style={[styles.detail, { flexDirection: 'row', justifyContent: 'left' }]}>
                      {/* 🧙🏻‍♀️🧙‍♂️ */}
                      {item.respo.map((person, index) => (
                        <TouchableOpacity key={index} onPress={() => navigateToPersonCard(person)}>
                          <Text style={styles.detail}> {person}  </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                  {item.info ? (
                    <View style={styles.cardContent}>
                      <Text style={[styles.detail, {fontWeight : 400}]}>{item.info}</Text>
                    </View>
                  ) : null}
                  {item.name === 'Élection Hymne' && (
                    <View style={[styles.cardContent, { gap: 8, marginTop: 10 }]}>
                      <Button
                        title="▶️ Écouter Version 1"
                        onPress={() => togglePlayPause(sound1)}
                      />
                      <Button
                        title="▶️ Écouter Version 2"
                        onPress={() => togglePlayPause(sound2)}
                      />
                      <Button
                        title="▶️ Écouter Version 3"
                        onPress={() => togglePlayPause(sound3)}
                      />
                    </View>
                  )}
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
