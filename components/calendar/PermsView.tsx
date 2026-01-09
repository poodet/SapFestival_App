import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { CalendarPermEventCard, CalendarPermEventHorizontalCard } from '@/components/CalendarEventCard';
import { ThemedText } from '@/components/ThemedText';
import { timeToMinutes } from '@/services/calendar.service';
import theme from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

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
  const [isHorizontal, setIsHorizontal] = useState(false);

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

  // Assign rows for horizontal view
  const assignRowsHorizontal = () => {
    const userPerms: any[] = [];
    const otherPerms: any[] = [];

    permsWithColors.forEach(perm => {
      if (perm.metadata?.organizer === userName) {
        userPerms.push(perm);
      } else {
        otherPerms.push(perm);
      }
    });

    // Sort by time
    const sortByTime = (a: any, b: any) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    userPerms.sort(sortByTime);
    otherPerms.sort(sortByTime);

    const rows: any[][] = [userPerms];

    // Assign other perms to rows (each row contains non-overlapping perms)
    for (const perm of otherPerms) {
      let placed = false;
      for (let i = 1; i < rows.length; i++) {
        const hasOverlap = rows[i].some(
          p => timeToMinutes(p.endTime) > timeToMinutes(perm.startTime) &&
               timeToMinutes(p.startTime) < timeToMinutes(perm.endTime)
        );
        if (!hasOverlap) {
          rows[i].push(perm);
          placed = true;
          break;
        }
      }
      if (!placed) {
        rows.push([perm]);
      }
    }

    return rows;
  };

  const horizontalRows = isHorizontal ? assignRowsHorizontal() : [];

  return (
    <View style={{ flex: 1, paddingBottom: 50, paddingHorizontal: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 8, flex: 1 }}>
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
        
        <Pressable
          onPress={() => setIsHorizontal(!isHorizontal)}
          style={{
            backgroundColor: theme.interactive.primary,
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Ionicons 
            name={isHorizontal ? "phone-portrait-outline" : "phone-landscape-outline"} 
            size={24} 
            color={theme.ui.white} 
          />
        </Pressable>
      </View>

      {!isHorizontal ? (
        // Vertical View (existing)
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 10 }}>
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
      ) : (
        // Horizontal View 
        <ScrollView 
          style={{ flex: 1 }} 
          horizontal={true}
          contentContainerStyle={{ paddingVertical: 10 }}
        >
          <ScrollView 
            style={{ flexDirection: 'column' }}
            contentContainerStyle={{ paddingHorizontal: 10 }}
          >
            <View>
              {/* Header with time labels */}
              <View style={{ flexDirection: 'row', height: 40, marginBottom: 5 }}>
                <ScrollView 
                  horizontal={true}
                  contentContainerStyle={{ paddingHorizontal: 10 }}
                >
                  {timeSlots.map((time, idx) => (
                    <View 
                      key={idx} 
                      style={{ 
                        width: SLOT_HEIGHT, 
                        justifyContent: 'center', 
                        alignItems: 'center',
                      }}
                    >
                      <ThemedText 
                        style={{ 
                          fontSize: 12, 
                          color: theme.text.primary,
                          width: 60,
                        }}
                      >
                        {time}
                      </ThemedText>
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Content area with fixed labels and scrollable perms */}
              <View style={{ flexDirection: 'row' }}>
                {/* Scrollable perm rows */}
                <ScrollView 
                  horizontal={true}
                  contentContainerStyle={{ paddingHorizontal: 10 }}
                >
                  <View>
                    {horizontalRows.map((row, rowIdx) => (
                      <View 
                        key={rowIdx} 
                        style={{ 
                          height: 80, 
                          position: 'relative',
                          marginBottom: 0,
                        }}
                      >
                        {row.map((perm) => (
                          <CalendarPermEventHorizontalCard
                            key={perm.id}
                            event={perm}
                            minHour={minHour}
                            slotHeight={SLOT_HEIGHT}
                            onPress={onPermPress}
                            fieldToDisplay={['organizer', 'perm']}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
};
