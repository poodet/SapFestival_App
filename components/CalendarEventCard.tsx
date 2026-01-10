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

const getSmallerName = (fullName: string): string => {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return parts[0] + ' ' + parts[1].charAt(0) + '.';
}

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
 * CalendarPermEventCard - Unified Perm Card Component
 * 
 * Displays a calendar event card for Perm items in both vertical and horizontal orientations.
 * - Vertical: uses column/span positioning (traditional calendar view)
 * - Horizontal: uses time-based positioning (timeline view)
 * - Shows pole icon always, adapts text display based on available space
 * - Displays organizer initials/abbreviated names when space is limited
 */
interface PermEventCardProps extends CalendarEventCardProps {
  isHorizontal?: boolean;
  event: CalendarEvent & { icon?: string };
}

export const CalendarPermEventCard: React.FC<PermEventCardProps> = ({
  event,
  columnCount,
  minHour,
  slotHeight,
  onPress,
  fieldToDisplay,
  isHorizontal = false,
}) => {
  const start = timeToMinutes(event.startTime);
  const end = timeToMinutes(event.endTime);

  // Calculate dimensions based on orientation
  let top: number | string;
  let left: number | string;
  let width: number | string;
  let height: number | string;
  let isNarrow: boolean;

  if (isHorizontal) {
    // Horizontal: time determines position, row determines vertical placement
    left = (start - minHour * 60) * (slotHeight / 30);
    width = (end - start) * (slotHeight / 30);
    height = '90%';
    top = 0;
    isNarrow = typeof width === 'number' && width < 100;
  } else {
    // Vertical: traditional column-based layout
    top = (start - minHour * 60) * (slotHeight / 30) + 20;
    height = (end - start) * (slotHeight / 30);
    width = `${(100 / columnCount) * event.span}%`;
    left = `${(100 / columnCount) * event.column}%`;
    isNarrow = event.span === 1;
  }

  // Determine space for details
  const numericHeight = typeof height === 'number' ? height : (end - start) * (slotHeight / 30);
  const hasSpaceForDetails = numericHeight >= 60;
  const maxDetailLines = Math.max(0, Math.floor((numericHeight - 40) / 18));

  // Get display value for a field (with abbreviation for narrow cards)
  const getFieldValue = (field: string): string => {
    const value = event.metadata?.[field] || '';
    if (field === 'organizer' && value) {
      return isNarrow ? getInitials(value) : getSmallerName(value);
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
          flexDirection: isHorizontal ? 'row' : 'column',
          justifyContent: isHorizontal ? 'center' : 'flex-start',
        },
      ]}
    >
      {/* Icon */}
      <View style={{ alignItems: isHorizontal ? 'flex-start' : 'center' }}>
        <Ionicons name={event.icon} size={24} color={theme.text.primary} />
      </View>

      {/* Fields */}
      {hasSpaceForDetails && fieldToDisplay && (
        <View style={{ 
          alignItems: isHorizontal ? 'flex-end' : 'center', 
          flex: isHorizontal ? 1 : undefined,
          alignSelf: isHorizontal ? 'center' : undefined,
        }}>
          {fieldToDisplay.map((field, index) =>
            index < maxDetailLines ? (
              <Text
                key={field}
                style={[
                  styles.eventDetail,
                  isHorizontal && { fontSize: 10, alignSelf: 'flex-end' }
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {getFieldValue(field)}
              </Text>
            ) : null
          )}
        </View>
      )}
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



