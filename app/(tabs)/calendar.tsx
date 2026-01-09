import React, { useState } from 'react';
import ScreenTitle from '@/components/screenTitle';
import {CalendarEventCard, CalendarPermEventCard} from '@/components/CalendarEventCard';
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
import { useFestivalCalendar, useDayEvents, usePermCalendar } from '@/hooks/useCalendar';
import { timeToMinutes } from '@/services/calendar.service';
import theme, { addOpacity } from '@/constants/theme';
import {ThemedText, NormalText} from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';


const DAYS = ['Vendredi', 'Samedi'];
const SLOT_HEIGHT = 40; // hauteur pour 30 minutes

// Perm categories style mapping
const permStyle: Record<string, { color: string; icon: string }> = {
  'Hygiène': {
    color: '#15716bff',
    icon: 'water-outline',
  },
  'Sécurité': {
    color: '#E74C3C',
    icon: 'shield-checkmark-outline',
  },
  'Bar': {
    color: '#F7DC6F',
    icon: 'beer-outline',
  },
  'Photo': {
    color: '#BB8FCE',
    icon: 'camera-outline',
  },
  'Logistique': {
    color: '#AAB7B8',
    icon: 'cube-outline',
  },
  'Activité': {
    color: '#52BE80',
    icon: 'football-outline',
  },
  'Artiste': {
    color: '#FF6B6B',
    icon: 'musical-notes-outline',
  },
  'Cuisine': {
    color: '#F39C12',
    icon: 'restaurant-outline',
  },
  'Accueil': {
    color: '#5DADE2',
    icon: 'people-outline',
  },
};

// Generate consistent color for a perm name
const getPermColor = (permName: string): string => {
  const normalizedName = permName.toLowerCase();
  const matchedKey = Object.keys(permStyle).find(key => key.toLowerCase() === normalizedName);
  
  if (matchedKey) {
    return permStyle[matchedKey].color;
  }
  
  // Fallback colors for unknown perm types
  const fallbackColor = '#000000ff';

  return fallbackColor;
};

const getPermIcon = (permName: string): string => {
  const normalizedName = permName.toLowerCase();
  const matchedKey = Object.keys(permStyle).find(key => key.toLowerCase() === normalizedName);
  
  if (matchedKey) {
    return permStyle[matchedKey].icon;
  }
  
  return 'help-circle-outline'; // Default icon for unknown types
};

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

// Custom column assignment for perms - user's perms in first column
const assignColumnsPerms = (events: any[], userName: string) => {
  // Separate user's perms and others
  const userPerms: any[] = [];
  const otherPerms: any[] = [];

  events.forEach(event => {
    if (event.metadata?.organizer === userName) {
      userPerms.push(event);
    } else {
      otherPerms.push(event);
    }
  });

  // Sort both groups by time
  const sortByTime = (a: any, b: any) => {
    const timeDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    return timeDiff !== 0 ? timeDiff : 0;
  };

  userPerms.sort(sortByTime);
  otherPerms.sort(sortByTime);

  // Assign user perms to column 0
  const columns: any[][] = [userPerms];

  // Assign other perms to subsequent columns
  for (const event of otherPerms) {
    let placed = false;
    for (let i = 1; i < columns.length; i++) {
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

  // Position events with column info
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
  const { positionedEvents, columnCount } = assignColumns(events);
  
  // Apply perm-specific colors and column assignment
  const permsWithColors = eventsPerms.map(perm => ({
    ...perm,
    bgColor: getPermColor(perm.metadata?.pole || perm.title),
    icon: getPermIcon(perm.metadata?.pole || perm.title),
  }));
  
  const userName = user ? `${user.firstName} ${user.lastName}` : '';
  const { positionedEvents: positionedPerms, columnCount: columnCountPerms } = 
    assignColumnsPerms(permsWithColors, userName);
 
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

  const extendedPerms = positionedPerms.map((perm) => {
    let span = 1;
    for (let i = perm.column + 1; i < columnCountPerms; i++) {
      const overlapping = positionedPerms.some(
        (p) =>
          p.column === i &&
          timeToMinutes(p.startTime) < timeToMinutes(perm.endTime) &&
          timeToMinutes(p.endTime) > timeToMinutes(perm.startTime)
      );  
      if (overlapping) break; 
      span++;
    }
    return { ...perm, span };
  });
  console.log("extendes perms:", extendedPerms); 
  
 

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
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8 }}>
              <ThemedText
                style={{
                  color: theme.text.primary,
                  fontSize: 18,
                  marginHorizontal: 10,
                  backgroundColor: theme.categories.artists,
                  borderRadius: 5,
                  padding: 5,
                }}
              >
                ARTISTES
              </ThemedText>
              <ThemedText
                style={{
                  color: theme.text.primary,
                  fontSize: 18,
                  marginHorizontal: 10,
                  backgroundColor: theme.categories.activities,
                  borderRadius: 5,
                  padding: 5,
                }}
              >
                ACTIVITES
              </ThemedText>
              <ThemedText
                style={{
                  color: theme.text.primary,
                  fontSize: 18,
                  marginHorizontal: 10,
                  backgroundColor: theme.categories.meals,
                  borderRadius: 5,
                  padding: 5,
                }}
              >
                REPAS
              </ThemedText>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 60 }}>
                  {timeSlots.map((time, idx) => (
                    <View key={idx} style={{ height: SLOT_HEIGHT, justifyContent: 'center' }}>
                      <ThemedText style={{ fontSize: 16, color: theme.text.primary }}>{time}</ThemedText>
                    </View>
                  ))}
                </View>
                <View style={{ flex: 1, position: 'relative' }}>
                  {extendedEvents.sort((a, b) => a.column - b.column).map((event) => (
                    <CalendarEventCard
                      key={event.id}
                      event={event}
                      columnCount={columnCount}
                      minHour={minHour}
                      slotHeight={SLOT_HEIGHT}
                      onPress={openModal}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>
          </>
        )}

        {/* Perms View */}
        {activeView === 'perms' && (
          <ScrollView contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 10 }}>
            <View style={{ padding: 10 }}>
              <ThemedText style={{ fontSize: 20, color: theme.text.primary, marginBottom: 15, textAlign: 'center' }}>
                Planning des Perms
              </ThemedText>
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

            <ScrollView contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 60 }}>
                  {timeSlots.map((time, idx) => (
                    <View key={idx} style={{ height: SLOT_HEIGHT, justifyContent: 'center' }}>
                      <ThemedText style={{ fontSize: 16, color: theme.text.primary }}>{time}</ThemedText>
                    </View>
                  ))}
                </View>
                <View style={{ flex: 1, position: 'relative' }}>
                  {extendedPerms.sort((a, b) => a.column - b.column).map((event) => (
                    <CalendarPermEventCard
                      key={event.id}
                      event={event}
                      columnCount={columnCountPerms}
                      minHour={minHour}
                      slotHeight={SLOT_HEIGHT}
                      onPress={openPermDetails}
                      fieldToDisplay={['organizer', 'perm']}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>

            </View>
          </ScrollView>
        )}

        {/* Logistique View */}
        {activeView === 'logistique' && (
          <ScrollView contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 10 }}>
            <View style={{ padding: 10 }}>
              <ThemedText style={{ fontSize: 20, color: theme.text.primary, marginBottom: 15, textAlign: 'center' }}>
                Logistique
              </ThemedText>
              <View
                style={{
                  backgroundColor: theme.ui.white,
                  padding: 20,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <ThemedText style={{ fontSize: 16, color: theme.text.secondary, textAlign: 'center' }}>
                  Section en cours de développement
                </ThemedText>
              </View>
            </View>
          </ScrollView>
        )}
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Pressable onPress={closeModal} style={styles.closeIconButton}>
                <Ionicons name="close" size={28} color={theme.text.secondary} />
              </Pressable>
              {selectedEvent && selectedEvent.category === 'perm' ? (
                <>
                  <View style={{ alignItems: 'end', marginBottom: 15, flexDirection: 'row' }}>
                    <Ionicons 
                      name={selectedEvent.icon || 'help-circle-outline'} 
                      size={48} 
                      color={selectedEvent.bgColor} 
                    />
                    <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                  </View>
                  <View style={styles.modalSection}>
                    <Text style={{fontWeight: 'bold'}} > {selectedEvent.metadata?.perm || selectedEvent.metadata?.pole} - </Text>
                    <Text>
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </Text>
                    <Text >, {selectedEvent.metadata?.organizer || 'Orga non spécifié'}</Text>
                  </View>
                </>
              ) : selectedEvent ? (
                <>
                  <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                  <Text style={styles.modalTime}>
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </Text>
                  <Text style={styles.modalDescription}>{selectedEvent.description || 'Pas de description.'}</Text>
                </>
              ) : null}
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
  closeIconButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 5,
  },
  modalSection: {
    width: '100%',
    marginBottom: 15,
    flexDirection: 'row', 
    display: 'flow',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: 4,
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
    marginTop:10,
    backgroundColor: addOpacity(theme.background.secondary, 0.5),
    width: 'fit-content',
    alignSelf: 'center',
    borderRadius: 20,
  }
});

export default ScheduleScreen;
