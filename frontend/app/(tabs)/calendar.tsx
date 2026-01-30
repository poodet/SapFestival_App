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
import { useFestivalCalendar, useDayEvents, usePermCalendar } from '@/hooks/useCalendar';
import theme, { addOpacity } from '@/constants/theme';
import { ThemedText, NormalText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { CalendrierView } from '@/components/calendar/CalendrierView';
import { PermsView } from '@/components/calendar/PermsView';
import { LogistiqueView } from '@/components/calendar/LogistiqueView';
import { PermModal } from '@/components/calendar/PermModal';


const DAYS = ['Vendredi', 'Samedi'];

const ScheduleScreen = () => {
  // Fetch data from Google Sheets via DataContext
  const { artists, activities, menuItems, perms, isLoading } = useFestivalData();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { setHighlightId } = useHighlight();
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState('Vendredi');
  const [activeView, setActiveView] = useState<'calendrier' | 'perms' | 'logistique'>('calendrier');

  // Use the centralized calendar service to transform data
  const eventsByDay = useFestivalCalendar(artists, activities, menuItems, {
    allowedDays: DAYS, // Only show Vendredi and Samedi
    sortByTime: true, // Sort events by time
  });
  const permsByDay = usePermCalendar(perms, {
    allowedDays: DAYS, 
    sortByTime: true,
  });

  // Get events for each day (keep hook order stable)
  const eventsVendredi = useDayEvents(eventsByDay, 'Vendredi');
  const eventsSamedi = useDayEvents(eventsByDay, 'Samedi');
  const eventsPerms = useDayEvents(permsByDay, selectedDay);

  const openPermDetails = (permEvent: any) => {
    setSelectedEvent(permEvent);
    setModalVisible(true);
  };

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

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };
 
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });

  const insets = useSafeAreaInsets();
  const userName = user ? `${user.firstName} ${user.lastName}` : '';
  const minHour = selectedDay === 'Vendredi' ? 17 : 10;
  const maxHour = 30;
  const timeSlots = [];
  for (let hour = minHour; hour < maxHour; hour++) {
    const displayHour = hour % 24;
    timeSlots.push(`${displayHour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${displayHour.toString().padStart(2, '0')}:30`);
  }
  timeSlots.push(`${(6).toString().padStart(2, '0')}:00`);

  useEffect(() => {
    if (isFocused) {
      setActiveView('calendrier');
    }
  }, [isFocused]);

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

  // Use TabBar so TabView can animate label/indicator during swipes
  const renderCustomTabBar = (props: any) => (
    // Lags too much, dont know why
    //     <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 8 }}>
    //   {props.navigationState.routes.map((route: any, i: number) => {
    //     const focused = props.navigationState.index === i;
    //     return (
    //       <TouchableOpacity
    //         key={route.key}
    //         onPress={() => props.jumpTo(route.key)}
    //         style={{ paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' }}
    //         activeOpacity={0.85}
    //       >
    //         <Text style={{ fontFamily: theme.fonts.themed, fontSize: 15, color: focused ? theme.text.primary : theme.text.secondary }}>{route.title}</Text>
    //         <View style={{ height: 3, width: 36, marginTop: 6, borderRadius: 2, backgroundColor: focused ? theme.interactive.primary : 'transparent' }} />
    //       </TouchableOpacity>
    //     );
    //   })}
    // </View>
    
    <TabBar
      {...props}
      style={{ backgroundColor: 'transparent', elevation: 0 }}
      indicatorStyle={{ backgroundColor: theme.interactive.primary, height: 3 }}
      activeColor={theme.text.primary}
      inactiveColor={theme.text.secondary}
      // Not working
      // labelStyle={{ fontFamily: theme.fonts.themed, fontSize: 16 }}
      // renderLabel={({ focused, route }) => {
      //   return (
      //     <TextView
      //       size={20}
      //       category="Medium"
      //       color={focused ? 'red' : 'red'}>
      //       {route.title}
      //     </TextView>
      //   );
      // }}
    />
  );

  // Also handle tab presses when the screen is already focused.
  // React Navigation emits a `tabPress` event even if the tab is focused.
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      setActiveView('calendrier');
    });
    return unsubscribe;
  }, [navigation]);

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
        {/* View switcher for organisateur role */}
        {user?.role === 'organisateur' && (
          <View style={styles.tabContainer}>
            <Pressable
              onPress={() => setActiveView('calendrier')}
              style={[{
                backgroundColor: activeView === 'calendrier' ? theme.interactive.primary : '',
              },styles.tabButton]}
            >
              <ThemedText
                style={{
                  color: activeView === 'calendrier' ? theme.ui.white : theme.text.secondary,
                  fontSize: 14,
                }}
              >
                Calendrier
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setActiveView('perms')}
              style={[{
                backgroundColor: activeView === 'perms' ? theme.interactive.primary : '',
              },styles.tabButton]}
            >
              <ThemedText
                style={{
                  color: activeView === 'perms' ? theme.ui.white : theme.text.secondary,
                  fontSize: 14,
                }}
              >
                Perms
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setActiveView('logistique')}
              style={[{
                backgroundColor: activeView === 'logistique' ? theme.interactive.primary : '',
              },styles.tabButton]}
            >
              <ThemedText
                style={{
                  color: activeView === 'logistique' ? theme.ui.white : theme.text.secondary,
                  fontSize: 14,
                }}
              >
                Logistique
              </ThemedText>
            </Pressable>
          </View>
        )}
        
        {activeView === 'calendrier' && (
          <View style={{ flex: 1 }}>
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
            />
          </View>
        )}

        {/* Perms View */}
        {activeView === 'perms' && (
          <PermsView
            eventsPerms={eventsPerms}
            selectedDay={selectedDay}
            days={DAYS}
            minHour={minHour}
            timeSlots={timeSlots}
            userName={userName}
            onDaySelect={setSelectedDay}
            onPermPress={openPermDetails}
          />
        )}

        {/* Logistique View */}
        {activeView === 'logistique' && <LogistiqueView />}

        {/* Perm Details Modal */}
        <PermModal 
          visible={modalVisible}
          selectedEvent={selectedEvent}
          onClose={closeModal}
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
  tabButton: {
    marginHorizontal: 2,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: addOpacity(theme.background.secondary, 0.5),
    alignSelf: 'center',
    borderRadius: 20,
  }
});

export default ScheduleScreen;
