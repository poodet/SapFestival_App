import React, { useState, useEffect } from 'react';
import ScreenTitle from '@/components/screenTitle';
import InfoHeaderButton from '@/components/InfoHeaderButton';
import * as Font from 'expo-font';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { TabView, TabBar } from 'react-native-tab-view';
import { useWindowDimensions } from 'react-native';
import { useFestivalData } from '@/contexts/DataContext';
import { useHighlight } from '@/contexts/HighlightContext';
import { useFestivalCalendar, useDayEvents } from '@/hooks/useCalendar';
import theme from '@/constants/theme';
import { ThemedText } from '@/components/ThemedText';
import { CalendrierView } from '@/components/calendar/CalendrierView';


const DAYS = ['Vendredi', 'Samedi'];

const ScheduleScreen = () => {
  // Fetch data from Google Sheets via DataContext
  const { artists, activities, menuItems, isLoading } = useFestivalData();
  const router = useRouter();
  const { setHighlightId } = useHighlight();
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [selectedDay, setSelectedDay] = useState('Vendredi');

  // Use the centralized calendar service to transform data
  const eventsByDay = useFestivalCalendar(artists, activities, menuItems, {
    allowedDays: DAYS, // Only show Vendredi and Samedi
    sortByTime: true, // Sort events by time
  });

  // Get events for each day (keep hook order stable)
  const eventsVendredi = useDayEvents(eventsByDay, 'Vendredi');
  const eventsSamedi = useDayEvents(eventsByDay, 'Samedi');

  const highlightEvent = (event: any) => {
    // Navigate to programme screen for all event types
    // Store both the ID and category for proper section switching
    const highlightData = {
      id: event.metadata?.id?.toString() || '',
      category: event.category || ''
    };
    setHighlightId(highlightData.id, highlightData.category);
    router.push('/(tabs)/programme');
  };

  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });

  const insets = useSafeAreaInsets();

  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(DAYS.indexOf(selectedDay));
  const [routes] = React.useState(DAYS.map((d) => ({ key: d, title: d })));

  useEffect(() => {
    setIndex(DAYS.indexOf(selectedDay));
  }, [selectedDay]);

  useEffect(() => {
    if (typeof index === 'number' && index >= 0 && index < DAYS.length) {
      setSelectedDay(DAYS[index]);
    }
  }, [index]);

  // Use TabBar so TabView can animate indicator during swipes
  const renderCustomTabBar = (props: any) => (
    <TabBar
      {...props}
      style={{ backgroundColor: 'transparent', elevation: 0 }}
      indicatorStyle={{ backgroundColor: theme.interactive.primary, height: 3 }}
    />
  );

  // Also handle tab presses when the screen is already focused.
  // React Navigation emits a `tabPress` event even if the tab is focused.
  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('tabPress', () => {
  //     setActiveView('calendrier');
  //   });
  //   return unsubscribe;
  // }, [navigation]);

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaViewContainer}>
        {/* <ScreenTitle>LINE UP</ScreenTitle> */}
        <InfoHeaderButton />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.text.primary} />
          <Text style={{ color: theme.text.primary, marginTop: 10, fontFamily: theme.fonts.themed }}>
            Chargement du programme...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <InfoHeaderButton />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={({ route }) => {
                const option = route.key;
                const eventsFor = option === 'Vendredi' ? eventsVendredi : eventsSamedi;
                const minHourFor = option === 'Vendredi' ? 17 : 10;
                const maxHourLocal = 30;
                const timeSlotsLocal: string[] = [];
                for (let hour = minHourFor; hour < maxHourLocal; hour++) {
                  const displayHour = hour % 24;
                  timeSlotsLocal.push(`${displayHour.toString().padStart(2, '0')}:00`);
                  timeSlotsLocal.push(`${displayHour.toString().padStart(2, '0')}:30`);
                }
                timeSlotsLocal.push(`${(6).toString().padStart(2, '0')}:00`);

                return (
                  <View style={{ flex: 1 }}>
                    <CalendrierView
                      events={eventsFor}
                      selectedDay={option}
                      minHour={minHourFor}
                      timeSlots={timeSlotsLocal}
                      onEventPress={highlightEvent}
                    />
                  </View>
                );
              }}
              renderTabBar={renderCustomTabBar}
              onIndexChange={setIndex}
              initialLayout={{ width: layout.width }}
              swipeEnabled={true}
              commonOptions={{
                label: ({ route, labelText, focused, color }) => (
                  <ThemedText style={{
                    fontSize: 14, 
                    color: focused ? theme.text.primary : theme.text.secondary
                  }}>
                    {labelText}
                  </ThemedText>
                )
              }}
        />
      </View>
    </SafeAreaView>
  );
};

// Ensure that when the calendar tab receives focus, we switch back to the main "calendrier" sub-view
// (this helps when the user is viewing Perms or Logistique and taps the bottom tab again)


const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
});

export default ScheduleScreen;
