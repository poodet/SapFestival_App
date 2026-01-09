import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import theme from '@/constants/theme';
import { timeToMinutes } from '@/services/calendar.service';
import Ionicons from '@expo/vector-icons/Ionicons';

interface CalendarEvent {
  id: string | number;
  startTime: string;
  endTime: string;
  title: string;
  bgColor: string;
  column: number;
  span: number;
  category?: string;
  metadata?: any;
}

interface CalendarEventCardProps {
  event: CalendarEvent;
  columnCount: number;
  minHour: number;
  slotHeight: number;
  onPress: (event: CalendarEvent) => void;
  fieldToDisplay?: string[];
}

// Helper to get initials from full name
const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0) + '.';
  return parts.map(part => part.charAt(0) + '.').join(' ');
};

export const CalendarEventCard: React.FC<CalendarEventCardProps> = ({
  event,
  columnCount,
  minHour,
  slotHeight,
  onPress,
  fieldToDisplay,
}) => {
  // Calculate position and dimensions
  const start = timeToMinutes(event.startTime);
  const end = timeToMinutes(event.endTime);
  const top = (start - minHour * 60) * (slotHeight / 30) + 20;
  const height = (end - start) * (slotHeight / 30);
  const width = `${(100 / columnCount) * event.span}%`;
  const left = `${(100 / columnCount) * event.column}%`;

  return (
    <Pressable
      onPress={() => onPress(event)}
      style={[
        styles.eventCard,
        {
          top,
          left,
          width,
          height,
          backgroundColor: event.bgColor,
        },
      ]}
    >
      <Text style={styles.eventTitle} >
        {event.title}
      </Text>
      {fieldToDisplay && fieldToDisplay.map((field, index) => (
        <Text
          key={field}
          style={styles.eventDetail}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {event.metadata?.[field]}
        </Text>
      ))}
    </Pressable>
  );
};



/**
 * CalendarPermEventCard for Perm Component
 * 
 * Displays a calendar event card specifically for Perm items. Each pole has its own color.
 * - Show "pole" field as title with icon
 * - show "organizer" and "perm" fields as details
 * - If the card is narrow (span 1), show initials of organizer instead of full name
 */
export const CalendarPermEventCard: React.FC<CalendarEventCardProps> = ({
  event,
  columnCount,
  minHour,
  slotHeight,
  onPress,
  fieldToDisplay,
}) => {
  // Calculate position and dimensions
  const start = timeToMinutes(event.startTime);
  const end = timeToMinutes(event.endTime);
  const top = (start - minHour * 60) * (slotHeight / 30) + 20;
  const height = (end - start) * (slotHeight / 30);
  const width = `${(100 / columnCount) * event.span}%`;
  const left = `${(100 / columnCount) * event.column}%`;

  // Determine if there's space for details (minimum 60px for title + details)
  const hasSpaceForDetails = height >= 60;
  const maxDetailLines = Math.max(0, Math.floor((height - 40) / 18)); // Estimate lines based on available space
  const isNarrow = event.span === 1; // Only 1 column available



  // Get display value for a field
  const getFieldValue = (field: string): string => {
    const value = event.metadata?.[field] || '';
    if (isNarrow && field === 'organizer' && value) {
      return getInitials(value);
    }
    return value;
  };

  return (
    <Pressable
      onPress={() => onPress(event)}
      style={[
        styles.eventCard,
        {
          top,
          left,
          width,
          height,
          backgroundColor: event.bgColor,
        },
      ]}
    >
      <Text style={styles.eventTitle} >
        <Ionicons name={event.icon} size={24} color={theme.text.primary} />
        {isNarrow ? '' : event.title}

      </Text>
      {hasSpaceForDetails && fieldToDisplay && fieldToDisplay.map((field, index) => (
        index < maxDetailLines && (
          <Text
            key={field}
            style={styles.eventDetail}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {getFieldValue(field)}
          </Text>
        )
      ))}
    </Pressable>
  );
};

/**
 * CalendarPermEventHorizontalCard for Horizontal Perm View
 * 
 * Displays a horizontal calendar event card for Perm items in timeline view.
 * - Width represents duration
 * - Left position represents start time
 * - Shows icon always, title only if width allows
 */
interface HorizontalCardProps {
  event: CalendarEvent & { icon?: string };
  minHour: number;
  slotHeight: number;
  onPress: (event: CalendarEvent) => void;
  fieldToDisplay?: string[];
}

export const CalendarPermEventHorizontalCard: React.FC<HorizontalCardProps> = ({
  event,
  minHour,
  slotHeight,
  onPress,
  fieldToDisplay,
}) => {
  const start = timeToMinutes(event.startTime);
  const end = timeToMinutes(event.endTime);
  const left = (start - minHour * 60) * (slotHeight / 30);
  const width = (end - start) * (slotHeight / 30);
  const isNarrow = width < 100; // Minimum width to show title

  // Get display value for a field
  const getFieldValue = (field: string): string => {
    const value = event.metadata?.[field] || '';
    if (isNarrow && field === 'organizer' && value) {
      return getInitials(value);
    }
    return value;
  };

  return (
    <Pressable
      onPress={() => onPress(event)}
      style={{
        position: 'absolute',
        left,
        width,
        height: '90%',
        backgroundColor: event.bgColor,
        borderRadius: 4,
        padding: 4,
        borderWidth: 1,
        borderColor: theme.background.primary,
        justifyContent: 'center',
        flexDirection: 'row',
      }}
    >

      <View style={{ alignItems: 'start' }}>
        <Ionicons name={event.icon} size={24} color={theme.text.primary}/>
        {!isNarrow && (
          <Text
            style={[styles.eventTitle, { fontSize: 14}]}
            numberOfLines={1}
          >
            {event.title}
          </Text>
        )}
      </View>

      {fieldToDisplay &&
      <View style={{ alignItems: 'center', flex: 1, alignSelf: 'center' }}>

      {fieldToDisplay.map((field, index) => (
        <Text
          key={field}
          style={{ fontSize: 10, color: theme.text.primary, alignSelf: 'end' }}
          numberOfLines={1}
        >
          {getFieldValue(field)}
        </Text>
      ))}
      </View>
      }
      
    </Pressable>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    position: 'absolute',
    padding: 4,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.background.primary,
    overflow: 'hidden',
  },
  eventTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    color: theme.text.primary,
  },
  eventDetail: {
    fontSize: 16,
    color: theme.text.primary,
    textAlign: 'center',
  },
});



