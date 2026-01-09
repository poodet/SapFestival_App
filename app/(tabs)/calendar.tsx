import React, { useState } from 'react';
import ScreenTitle from '@/components/screenTitle';
import * as Font from 'expo-font';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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

  // Get events for the selected day
  const events = useDayEvents(eventsByDay, selectedDay);
  const eventsPerms = useDayEvents(permsByDay, selectedDay);

  const openPermDetails = (permEvent: any) => {
    setSelectedEvent(permEvent);
    setModalVisible(true);
  };

  const openModal = (event: any) => {
    // Navigate to activities screen if it's an activity event
    let pathName = '';
    if (event.category === 'artist') {
      pathName = '/(tabs)/artists';
    } else if (event.category === 'meal') {
      pathName = '/(tabs)/b2b';
    } else if (event.category === 'activity') {
      pathName = '/(tabs)/activities';
    }

    setHighlightId(event.metadata?.id?.toString() || '');
    
    router.push(pathName);
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

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaViewContainer}>
        <ScreenTitle>LINE UP</ScreenTitle>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.text.primary} />
          <Text style={{ color: theme.text.primary, marginTop: 10, fontFamily: 'Oliver-Regular' }}>
            Chargement du programme...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
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
              <NormalText
                style={{
                  color: activeView === 'calendrier' ? theme.ui.white : theme.text.secondary,
                  fontSize: 16,
                }}
              >
                Calendrier
              </NormalText>
            </Pressable>
            <Pressable
              onPress={() => setActiveView('perms')}
              style={[{
                backgroundColor: activeView === 'perms' ? theme.interactive.primary : '',
              },styles.tabButton]}
            >
              <NormalText
                style={{
                  color: activeView === 'perms' ? theme.ui.white : theme.text.secondary,
                  fontSize: 16,
                }}
              >
                Perms
              </NormalText>
            </Pressable>
            <Pressable
              onPress={() => setActiveView('logistique')}
              style={[{
                backgroundColor: activeView === 'logistique' ? theme.interactive.primary : '',
              },styles.tabButton]}
            >
              <NormalText
                style={{
                  color: activeView === 'logistique' ? theme.ui.white : theme.text.secondary,
                  fontSize: 16,
                }}
              >
                Logistique
              </NormalText>
            </Pressable>
          </View>
        )}
        
        {/* Day selector - only show for calendrier view */}
        {activeView === 'calendrier' && (
          <View>
            <ScreenTitle style={{ paddingTop: 10 }}>LINE UP</ScreenTitle>
            <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 8 }}>
              {DAYS.map((day) => (
                <Pressable
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  style={{
                    marginHorizontal: 8,
                    backgroundColor: theme.ui.white,
                    padding: 5,
                    borderRadius: 8,
                    borderWidth: 5,
                    borderColor: selectedDay === day ? theme.interactive.primary : theme.background.primary,
                  }}
                >
                  <ThemedText
                    style={{
                      color: selectedDay === day ? theme.interactive.primary : theme.interactive.inactive,
                      fontSize: 20,
                    }}
                  >
                    {day}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Calendrier View */}
        {activeView === 'calendrier' && (
          <CalendrierView
            events={events}
            selectedDay={selectedDay}
            minHour={minHour}
            timeSlots={timeSlots}
            onEventPress={openModal}
          />
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

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
    marginBottom: 50,
  },
  tabButton: {
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tabContainer: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    padding: 8, 
    marginTop: 10,
    backgroundColor: addOpacity(theme.background.secondary, 0.5),
    width: 'fit-content',
    alignSelf: 'center',
    borderRadius: 20,
  }
});

export default ScheduleScreen;
