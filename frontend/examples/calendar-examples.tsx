/**
 * Example: Creating a New Calendar Page
 * 
 * This is a template showing how to create a new calendar page
 * using the centralized calendar service.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useCalendar, useDayEvents } from '@/hooks/useCalendar';
import { CALENDAR_CONFIGS } from '@/services/calendar.service';

/**
 * Example 1: Simple Activity Calendar
 * Shows only activities, no artists or meals
 */
export function ActivitiesOnlyCalendar() {
  const [selectedDay, setSelectedDay] = useState('Samedi');
  
  // Assume we have activities data from somewhere
  const { activities, isLoading } = useActivitiesData();

  // Transform activities into calendar format
  const eventsByDay = useCalendar(
    activities,
    CALENDAR_CONFIGS.activities,
    {
      allowedDays: ['Samedi', 'Dimanche'],
      sortByTime: true,
    }
  );

  const events = useDayEvents(eventsByDay, selectedDay);

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Activités</Text>
      
      {/* Day selector */}
      <View style={styles.daySelector}>
        {['Samedi', 'Dimanche'].map((day) => (
          <Pressable
            key={day}
            onPress={() => setSelectedDay(day)}
            style={[
              styles.dayButton,
              selectedDay === day && styles.dayButtonActive,
            ]}
          >
            <Text>{day}</Text>
          </Pressable>
        ))}
      </View>

      {/* Events list */}
      <ScrollView>
        {events.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <Text style={styles.eventTime}>
              {event.startTime} - {event.endTime}
            </Text>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>
            {event.location && (
              <Text style={styles.eventLocation}>📍 {event.location}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Example 2: Workshops Calendar with Custom Configuration
 */
export function WorkshopsCalendar() {
  const [selectedDay, setSelectedDay] = useState('Samedi');
  const { workshops, isLoading } = useWorkshopsData();

  // Custom configuration for workshops
  const workshopConfig = {
    titleField: 'name',
    descriptionFields: ['description', 'instructor'],
    categoryName: 'workshop',
    defaultColor: '#9B59B6',
    locationField: 'room',
    iconField: 'icon',
  };

  const eventsByDay = useCalendar(workshops, workshopConfig, {
    allowedDays: ['Samedi'],
    sortByTime: true,
  });

  const events = useDayEvents(eventsByDay, selectedDay);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ateliers</Text>
      <ScrollView>
        {events.map((event) => (
          <WorkshopCard key={event.id} event={event} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Example 3: Merged Calendar with Multiple Data Sources
 */
export function CombinedCalendar() {
  const [selectedDay, setSelectedDay] = useState('Vendredi');
  const { speakers, panels } = useConferenceData();

  // Merge speakers and panels into one calendar
  const eventsByDay = useMergedCalendar(
    [
      {
        data: speakers,
        config: {
          titleField: 'name',
          descriptionFields: ['bio', 'topic'],
          categoryName: 'speaker',
          defaultColor: '#FF6B6B',
        },
      },
      {
        data: panels,
        config: {
          titleField: 'title',
          descriptionFields: ['description'],
          categoryName: 'panel',
          defaultColor: '#4ECDC4',
        },
      },
    ],
    {
      allowedDays: ['Vendredi', 'Samedi'],
      sortByTime: true,
    }
  );

  const events = useDayEvents(eventsByDay, selectedDay);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Conférences</Text>
      
      {/* Category filter */}
      <CategoryFilter
        categories={['speaker', 'panel']}
        onFilter={(filtered) => {
          // Handle filtering
        }}
      />

      <ScrollView>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            categoryColor={
              event.category === 'speaker' ? '#FF6B6B' : '#4ECDC4'
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Example 4: Filtered Calendar (Morning Activities Only)
 */
export function MorningActivitiesCalendar() {
  const { activities } = useActivitiesData();

  const eventsByDay = useCalendar(
    activities,
    CALENDAR_CONFIGS.activities,
    {
      timeRange: {
        start: '08:00',
        end: '12:00',
      },
      sortByTime: true,
    }
  );

  const events = useDayEvents(eventsByDay, 'Samedi');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Activités Matinales</Text>
      <Text style={styles.subtitle}>8h - 12h</Text>
      <ScrollView>
        {events.map((event) => (
          <ActivityCard key={event.id} event={event} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Example 5: Timeline View (Using Calendar Data)
 */
export function TimelineCalendar() {
  const { artists, activities } = useFestivalData();
  const [selectedDay, setSelectedDay] = useState('Vendredi');

  const eventsByDay = useFestivalCalendar(artists, activities, [], {
    allowedDays: ['Vendredi', 'Samedi'],
    sortByTime: true,
  });

  const events = useDayEvents(eventsByDay, selectedDay);

  // Group events by hour
  const eventsByHour = events.reduce((acc, event) => {
    const hour = event.startTime.split(':')[0];
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(event);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Timeline</Text>
      <ScrollView>
        {Object.keys(eventsByHour)
          .sort()
          .map((hour) => (
            <View key={hour} style={styles.hourBlock}>
              <Text style={styles.hourLabel}>{hour}:00</Text>
              {eventsByHour[hour].map((event) => (
                <TimelineEvent key={event.id} event={event} />
              ))}
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Example 6: Category-Specific Calendar
 */
export function ArtistsOnlyCalendar() {
  const { artists } = useFestivalData();
  const [selectedDay, setSelectedDay] = useState('Vendredi');

  const eventsByDay = useCalendar(
    artists,
    CALENDAR_CONFIGS.artists,
    {
      allowedDays: ['Vendredi', 'Samedi'],
      sortByTime: true,
    }
  );

  const events = useDayEvents(eventsByDay, selectedDay);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Line Up</Text>
      <ScrollView>
        {events.map((event) => (
          <ArtistCard
            key={event.id}
            name={event.title}
            style={event.description}
            time={`${event.startTime} - ${event.endTime}`}
            color={event.bgColor}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components (you would implement these)
function LoadingView() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" />
      <Text>Chargement...</Text>
    </View>
  );
}

function WorkshopCard({ event }: { event: any }) {
  return (
    <View style={[styles.card, { borderLeftColor: event.bgColor }]}>
      <Text style={styles.cardTime}>
        {event.startTime} - {event.endTime}
      </Text>
      <Text style={styles.cardTitle}>{event.title}</Text>
      <Text style={styles.cardDescription}>{event.description}</Text>
      {event.location && (
        <Text style={styles.cardLocation}>📍 {event.location}</Text>
      )}
    </View>
  );
}

function EventCard({ event, categoryColor }: { event: any; categoryColor: string }) {
  return (
    <View style={[styles.card, { backgroundColor: categoryColor + '20' }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardCategory}>{event.category}</Text>
        <Text style={styles.cardTime}>
          {event.startTime} - {event.endTime}
        </Text>
      </View>
      <Text style={styles.cardTitle}>{event.title}</Text>
      <Text style={styles.cardDescription}>{event.description}</Text>
    </View>
  );
}

function ActivityCard({ event }: { event: any }) {
  return (
    <View style={[styles.card, { borderColor: event.bgColor }]}>
      <Text style={styles.cardTime}>
        {event.startTime} - {event.endTime}
      </Text>
      <Text style={styles.cardTitle}>{event.title}</Text>
      <Text style={styles.cardDescription}>{event.description}</Text>
    </View>
  );
}

function TimelineEvent({ event }: { event: any }) {
  return (
    <View style={[styles.timelineEvent, { borderLeftColor: event.bgColor }]}>
      <Text style={styles.timelineTime}>{event.startTime}</Text>
      <Text style={styles.timelineTitle}>{event.title}</Text>
    </View>
  );
}

function ArtistCard({ name, style, time, color }: any) {
  return (
    <View style={[styles.artistCard, { backgroundColor: color }]}>
      <Text style={styles.artistTime}>{time}</Text>
      <Text style={styles.artistName}>{name}</Text>
      <Text style={styles.artistStyle}>{style}</Text>
    </View>
  );
}

function CategoryFilter({ categories, onFilter }: any) {
  return (
    <View style={styles.filter}>
      {categories.map((cat: string) => (
        <Pressable key={cat} style={styles.filterButton}>
          <Text>{cat}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Mock data hooks (replace with real data fetching)
function useActivitiesData() {
  // Replace with actual data fetching
  return { activities: [], isLoading: false };
}

function useWorkshopsData() {
  return { workshops: [], isLoading: false };
}

function useConferenceData() {
  return { speakers: [], panels: [] };
}

function useFestivalData() {
  return { artists: [], activities: [], menuItems: [] };
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
  },
  dayButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCard: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  eventTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 12,
    color: '#666',
  },
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardCategory: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  cardTime: {
    fontSize: 12,
    color: '#666',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#444',
  },
  cardLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  hourBlock: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  hourLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timelineEvent: {
    padding: 8,
    marginLeft: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  artistCard: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
  },
  artistTime: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  artistStyle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  filter: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  filterButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
});
