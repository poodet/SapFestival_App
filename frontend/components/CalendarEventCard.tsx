import React from 'react';
import { Pressable, Text, StyleSheet, View, Image, Dimensions } from 'react-native';
// removed reanimated usage for fixed image display
import imageMapper from '@/components/imageMapper';
import theme from '@/constants/theme';
import { CALENDAR_CONFIGS, timeToMinutes } from '@/services/calendar.service';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getOrganizerImage } from './organizerImageMapper';

interface CalendarEvent {
  id: string | number;
  startTime: string;
  endTime: string;
  title: string;
  bgColor: string;
  column: number;
  span: number;
  subColumn?: number;
  subColumnCount?: number;
  columnOffset?: number;
  totalUnitColumns?: number;
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
  scrollOffset?: any;
}

// Helper to get initials from full name
export const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0) + '.';
  return parts.map(part => part.charAt(0) + '.').join(' ');
};

export const getSmallerName = (fullName: string): string => {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return parts[0] + ' ' + parts[1].charAt(0) + '.';
}


const { width } = Dimensions.get('window');

export const CalendarEventCard: React.FC<CalendarEventCardProps> = ({
  event,
  columnCount,
  minHour,
  slotHeight,
  onPress,
  fieldToDisplay,
  scrollOffset,
}) => {
  // Calculate position and dimensions
  const start = timeToMinutes(event.startTime);
  const end = timeToMinutes(event.endTime);
  const top = (start - minHour * 60) * (slotHeight / 30) + 20;
  const height = (end - start) * (slotHeight / 30);
  const width = `${(100 / columnCount) * event.span}%`;
  const left = `${(100 / columnCount) * event.column}%`;

  // If event is Artist and has an image, use it as background
  const rawImageKey = event.metadata?.image;
  const lookupKey = typeof rawImageKey === 'string' ? rawImageKey : '';
  // Try exact key, then uppercase key for robustness
  const backgroundImage = imageMapper[lookupKey] || imageMapper[lookupKey.toUpperCase()];
  const isArtist = event.category === 'artist';

  const getIconEvent = (category: string) => {
    switch (category) {
      case 'meal': return 'fast-food-outline';
      case 'artist': return 'musical-notes-outline';
      case 'activity': return 'trophy-outline';  
      default: return 'calendar';
    }
  }

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
      {backgroundImage && isArtist && (
        <View style={styles.imageContainer}>
          {/* Fixed image crop using mapper offsetY */}
          {(() => {
            // Image loads at full size; we shift it vertically to show the desired part
            // offsetY: 0 = show top of image, 0.5 = center, 1 = show bottom
            const imgOffset = typeof backgroundImage?.offsetY === 'number' ? backgroundImage.offsetY : 0.5;
            
            // We need the image to be tall enough to allow vertical shifting
            // Use a height multiplier to ensure image covers all offset positions
            const IMAGE_HEIGHT_MULTIPLIER = 2.5;
            const fullImageHeight = height * IMAGE_HEIGHT_MULTIPLIER;
            
            // Calculate how much we can shift: image extends beyond card bounds
            const maxShift = fullImageHeight - height;
            
            // offsetY determines position: 0 = top (no shift), 1 = bottom (max negative shift)
            const topOffset = -Math.round(imgOffset * maxShift);

            return (
              <Image
                source={backgroundImage.src}
                style={[styles.cardImg, { height: fullImageHeight, top: topOffset }]}
                resizeMode="cover"
              />
            );
          })()}
        </View>
      )}
      {/* Add card header, fixed on top, to display an icon */}
      <View style={{ position: 'absolute', top: 2, right: 4, zIndex: 2 }} >
          <Ionicons name={getIconEvent(event.category)} size={18} color={theme.text.primary} />
      </View>
      <View style={styles.contentContainer}>
        
        <Text style={styles.eventTitle}>
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
      </View>
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

// Constants for consistent card sizing
export const CARD_WIDTH = 40;
export const CARD_HEIGHT = 40;

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

  // Handle sub-columns for overlapping events within the same pole
  const subColumn = event.subColumn ?? 0;
  const subColumnCount = event.subColumnCount ?? 1;
  const columnOffset = event.columnOffset ?? 0;

  if (isHorizontal) {
    // Horizontal: time determines position, row determines vertical placement
    left = (start - minHour * 60) * (slotHeight / 30);
    width = (end - start) * (slotHeight / 30);
    
    // Fixed height for all cards
    height = CARD_HEIGHT;
    top = subColumn * CARD_HEIGHT;
    
    isNarrow = typeof width === 'number' && width < 100;
  } else {
    // Vertical: column-based layout with fixed card width
    top = (start - minHour * 60) * (slotHeight / 30) + 20;
    height = (end - start) * (slotHeight / 30);
    
    // Fixed width for all cards
    width = CARD_WIDTH;
    left = (columnOffset + subColumn) * CARD_WIDTH;
    
    isNarrow = subColumnCount > 1;
  }

  // Determine space for details
  const numericHeight = typeof height === 'number' ? height : (end - start) * (slotHeight / 30);
  const hasSpaceForIcon = numericHeight >= 60;
  const maxDetailLines = Math.max(0, Math.floor((numericHeight - 40) / 18));

  // Get display value for a field (with abbreviation for narrow cards)
  const getFieldValue = (field: string): string => {
    const value = event.metadata?.[field] || '';
    if (field === 'organizer' && value) {
      return isNarrow ? getInitials(value) : getSmallerName(value);
    }
    return value;
  };

  // Check if organizer has a profile image
  const organizerName = event.metadata?.organizer;
  const organizerImage = organizerName ? getOrganizerImage(organizerName) : undefined;
  
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
          flexDirection: isHorizontal ? (isNarrow ? 'column' : 'row') : 'column',
          justifyContent: isHorizontal ? 'start' : 'flex-start',
        },
      ]}
    >
      {/* Icon */}
      {/* {hasSpaceForIcon && event.icon && (
        <View style={{ alignItems: isHorizontal ? 'flex-start' : 'center' }}>
          <Ionicons name={event.icon} size={24} color={theme.text.primary} />
        </View>
      )} */}

      {/* Fields */}
      { fieldToDisplay && (
        <View style={{ 
          alignItems: isHorizontal ? 'flex-start' : 'center', 
          alignSelf: isHorizontal ? undefined : undefined,
        }}>
          {fieldToDisplay.map((field, index) => {
            // Show profile image for organizer field if available
            if (field === 'organizer' && organizerImage ) {
              return (
                <Image
                  key={field}
                  source={organizerImage}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              );
            }
             
            // Otherwise show text
            return index < maxDetailLines ? (
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
            ) : null;
          })}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    position: 'absolute',
    padding: 4,
    margin: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.background.primary,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  contentContainer: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    color: theme.text.primary,
    textShadow: 'rgb(0 0 0 / 46%) 0px 4px 9px;',
    letterSpacing: '.05em',
  },
  eventDetail: {
    fontSize: 16,
    color: theme.text.primary,
    textAlign: 'center',
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.text.primary,
  },
  cardImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});



