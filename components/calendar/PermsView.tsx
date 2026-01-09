import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { CalendarPermEventCard } from '@/components/CalendarEventCard';
import { ThemedText } from '@/components/ThemedText';
import { timeToMinutes } from '@/services/calendar.service';
import theme from '@/constants/theme';

const SLOT_HEIGHT = 40;

// Perm categories style mapping
export const permStyle: Record<string, { color: string; icon: string }> = {
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
export const getPermColor = (permName: string): string => {
  const normalizedName = permName.toLowerCase();
  const matchedKey = Object.keys(permStyle).find(key => key.toLowerCase() === normalizedName);
  
  if (matchedKey) {
    return permStyle[matchedKey].color;
  }
  
  return '#000000ff'; // Fallback for unknown types
};

export const getPermIcon = (permName: string): string => {
  const normalizedName = permName.toLowerCase();
  const matchedKey = Object.keys(permStyle).find(key => key.toLowerCase() === normalizedName);
  
  if (matchedKey) {
    return permStyle[matchedKey].icon;
  }
  
  return 'help-circle-outline'; // Default icon for unknown types
};

// Custom column assignment for perms - user's perms in first column
const assignColumnsPerms = (events: any[], userName: string) => {
  const userPerms: any[] = [];
  const otherPerms: any[] = [];

  events.forEach(event => {
    if (event.metadata?.organizer === userName) {
      userPerms.push(event);
    } else {
      otherPerms.push(event);
    }
  });

  const sortByTime = (a: any, b: any) => {
    const timeDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    return timeDiff !== 0 ? timeDiff : 0;
  };

  userPerms.sort(sortByTime);
  otherPerms.sort(sortByTime);

  const columns: any[][] = [userPerms];

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

  const positionedEvents: any[] = [];
  for (let i = 0; i < columns.length; i++) {
    for (const event of columns[i]) {
      positionedEvents.push({ ...event, column: i });
    }
  }

  return { positionedEvents, columnCount: columns.length };
};

interface PermsViewProps {
  eventsPerms: any[];
  selectedDay: string;
  days: string[];
  minHour: number;
  timeSlots: string[];
  userName: string;
  onDaySelect: (day: string) => void;
  onPermPress: (perm: any) => void;
}

export const PermsView: React.FC<PermsViewProps> = ({
  eventsPerms,
  selectedDay,
  days,
  minHour,
  timeSlots,
  userName,
  onDaySelect,
  onPermPress,
}) => {
  // Apply perm-specific colors and column assignment
  const permsWithColors = eventsPerms.map(perm => ({
    ...perm,
    bgColor: getPermColor(perm.metadata?.pole || perm.title),
    icon: getPermIcon(perm.metadata?.pole || perm.title),
  }));

  const { positionedEvents: positionedPerms, columnCount: columnCountPerms } = 
    assignColumnsPerms(permsWithColors, userName);

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

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 10 }}>
      <View style={{ padding: 10 }}>
        <ThemedText style={{ fontSize: 20, color: theme.text.primary, marginBottom: 15, textAlign: 'center' }}>
          Planning des Perms
        </ThemedText>
        <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 8 }}>
          {days.map((day) => (
            <Pressable
              key={day}
              onPress={() => onDaySelect(day)}
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
                  onPress={onPermPress}
                  fieldToDisplay={['organizer', 'perm']}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};
