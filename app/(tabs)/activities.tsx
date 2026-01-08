import React, { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Button, ActivityIndicator, RefreshControl } from 'react-native';
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
import ScreenTitle from '@/components/screenTitle';
import { useActivities } from '@/contexts/DataContext';
import theme from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function ActivityScreen() {
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });

  const { activities, isLoading, isRefreshing, refetch } = useActivities();

  const sound1 = require('../../sounds/Le_SAP_dans_l_espace_(reggae_version).mp3');
  const sound2 = require('../../sounds/Le_SAP_dans_l_espace.mp3');
  const sound3 = require('../../sounds/SAP_en_el_espacio.mp3');

  const currentSound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSource, setCurrentSource] = useState<number | null>(null);

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
      <ScreenTitle>ACTIVITIES</ScreenTitle>
      <View style={styles.container}>
        <FlatList
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
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={[styles.cardContent, {flexWrap : 'nowrap',flexDirection:'row'}]}>
                <Text style={styles.name}>{item.name}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.detail}>📅 {item.duration}</Text>
                <Text style={styles.detail}>📍 {item.location}</Text>
              </View>
              {item.participation ? (
                <View style={styles.cardContent}>
                  <Text style={styles.participation}>📝 {item.participation}</Text>
                  <Text style={styles.detail}>🧙🏻‍♀️🧙‍♂️ {item.respo}</Text>
                </View>
              ) : <View style={styles.cardContent}>
                    <Text style={styles.detail}>🧙🏻‍♀️🧙‍♂️ {item.respo}</Text>
                  </View>}
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
          )}
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
    marginBottom: 50,
  },
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  list: {
    paddingVertical: 20,
    alignItems: 'stretch',
    paddingBottom : 50
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
