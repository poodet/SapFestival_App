import React from 'react';
import { View, ScrollView } from 'react-native';
import { CalendarEventCard } from '@/components/CalendarEventCard';
import { ThemedText } from '@/components/ThemedText';
import { timeToMinutes } from '@/services/calendar.service';
import theme, { layout } from '@/constants/theme';

const SLOT_HEIGHT = 40;

interface CalendrierViewProps {
  events: any[];
  selectedDay: string;
  minHour: number;
  timeSlots: string[];
  onEventPress: (event: any) => void;
}

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

export const CalendrierView: React.FC<CalendrierViewProps> = ({
  events,
  selectedDay,
  minHour,
  timeSlots,
  onEventPress,
}) => {
  const { positionedEvents, columnCount } = assignColumns(events);

  // Extend cards horizontally when there's no conflict
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

  return (
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
      <ScrollView contentContainerStyle={{ paddingBottom: layout.tabBar.contentPadding, paddingHorizontal: 10 }}>
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
                onPress={onEventPress}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
};
