import React, { useState } from 'react';
import ScreenTitle from '@/components/screenTitle';
import * as Font from 'expo-font';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFestivalData } from '@/contexts/DataContext';
import { useHighlight } from '@/contexts/HighlightContext';
import { useFestivalCalendar, useDayEvents } from '@/hooks/useCalendar';
import { timeToMinutes } from '@/services/calendar.service';
import theme from '@/constants/theme';

const DAYS = ['Vendredi', 'Samedi'];
const SLOT_HEIGHT = 40; // hauteur pour 30 minutes

const assignColumns = (events: any[]) => {
  const sortedEvents = [...events].sort((a, b) => {
    const timeDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    if (timeDiff !== 0) return timeDiff;
    if (a.category === 'artist' && b.category !== 'artist') return -1;
    if (b.category === 'artist' && a.category !== 'artist') return 1;
    return 0;
  });

  const columns: any[][] = [];

  for (const event of sortedEvents) {
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      if (
        !columns[i].some(
          e =>
            timeToMinutes(e.endTime) > timeToMinutes(event.startTime) &&
            timeToMinutes(e.startTime) < timeToMinutes(event.endTime)
        )
      ) {
        columns[i].push(event);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([event]);
    }
  }

  const positionedEvents: any[] = [];
  for (let i = 0; i < columns.length; i++) {
    for (const event of columns[i]) {
      positionedEvents.push({ ...event, column: i });
    }
  }

  return { positionedEvents, columnCount: columns.length };
};

const ScheduleScreen = () => {
  // Fetch data from Google Sheets via DataContext
  const { artists, activities, menuItems, isLoading } = useFestivalData();
  const router = useRouter();
  const { setHighlightId } = useHighlight();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState('Vendredi');

  // Use the centralized calendar service to transform data
  const eventsByDay = useFestivalCalendar(artists, activities, menuItems, {
    allowedDays: DAYS, // Only show Vendredi and Samedi
    sortByTime: true, // Sort events by time
  });

  // Get events for the selected day
  const events = useDayEvents(eventsByDay, selectedDay);

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
  const { positionedEvents, columnCount } = assignColumns(events);

  // Étendre horizontalement chaque carte tant que pas de conflit
  const extendedEvents = positionedEvents.map((event) => {
    let span = 1;
    for (let i = event.column + 1; i < columnCount; i++) {
      const overlapping = positionedEvents.some(
        (e) =>
          e.column === i &&
          timeToMinutes(e.startTime) < timeToMinutes(event.endTime) &&
          timeToMinutes(e.endTime) > timeToMinutes(event.startTime)
      );  
      if (overlapping) break; 
      span++;
    }
    return { ...event, span };
  });

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
      <ScreenTitle>LINE UP</ScreenTitle>
      <View style={{ flex: 1, paddingTop: insets.top }}>
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
              <Text
                style={{
                  color: selectedDay === day ? theme.interactive.primary : theme.interactive.inactive,
                  fontSize: 16,
                  fontFamily: 'Oliver-Regular',
                }}
              >
                {day}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
          <Text
            style={{
              color: theme.text.primary,
              fontSize: 14,
              fontFamily: 'Oliver-Regular',
              marginHorizontal: 10,
              backgroundColor: theme.categories.artists,
              borderRadius: 5,
              padding: 5,
            }}
          >
            ARTISTES
          </Text>
          <Text
            style={{
              color: theme.text.primary,
              fontSize: 14,
              fontFamily: 'Oliver-Regular',
              marginHorizontal: 10,
              backgroundColor: theme.categories.activities,
              borderRadius: 5,
              padding: 5,
            }}
          >
            ACTIVITES
          </Text>
          <Text
            style={{
              color: theme.text.primary,
              fontSize: 14,
              fontFamily: 'Oliver-Regular',
              marginHorizontal: 10,
              backgroundColor: theme.categories.meals,
              borderRadius: 5,
              padding: 5,
            }}
          >
            REPAS
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 60 }}>
              {timeSlots.map((time, idx) => (
                <View key={idx} style={{ height: SLOT_HEIGHT, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12, color: theme.text.primary }}>{time}</Text>
                </View>
              ))}
            </View>
            <View style={{ flex: 1, position: 'relative' }}>
              {extendedEvents.sort((a, b) => a.column - b.column).map((event) => {
                const start = timeToMinutes(event.startTime);
                const end = timeToMinutes(event.endTime);
                const top = (start - minHour * 60) * (SLOT_HEIGHT / 30) + 20;
                const height = (end - start) * (SLOT_HEIGHT / 30);
                const width = `${(100 / columnCount) * event.span}%`;
                const left = `${(100 / columnCount) * event.column}%`;
                return (
                  <Pressable
                    key={event.id}
                    onPress={() => openModal(event)}
                    style={{
                      position: 'absolute',
                      top,
                      left,
                      width,
                      height,
                      backgroundColor: event.bgColor,
                      padding: 4,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: theme.background.primary,
                      overflow: 'hidden',
                    }}
                  >
                    <Text
                      style={{ fontWeight: 'bold', fontSize: 12, color: theme.text.primary }}
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {event.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedEvent && (
                <>
                  <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                  <Text style={styles.modalTime}>
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </Text>
                  <Text style={styles.modalDescription}>{selectedEvent.description || 'Pas de description.'}</Text>
                  <Pressable onPress={closeModal} style={styles.closeButton}>
                    <Text style={{ color: theme.text.primary }}>Fermer</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: theme.ui.white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalTime: {
    fontSize: 14,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: theme.interactive.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
});

export default ScheduleScreen;
