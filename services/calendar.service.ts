import theme from '@/constants/theme';

/**
 * Calendar Service
 * 
 * Centralized service for transforming any data into calendar-ready format.
 * Provides reusable functions for calendar display across multiple pages.
 */

/**
 * Preset configurations for common data types
 */
export const CALENDAR_CONFIGS = {
  artists: {
    titleField: 'name',
    descriptionFields: ['style', 'bio', 'description'],
    categoryName: 'artist',
    defaultColor: theme.categories.artists,
  } as CalendarTransformConfig,
  
  activities: {
    titleField: 'name',
    descriptionFields: ['info'],
    categoryName: 'activity',
    defaultColor: theme.categories.activities,
    locationField: 'location',
    iconField: 'icon',
  } as CalendarTransformConfig,
  
  meals: {
    titleField: 'title',
    descriptionFields: ['description', 'info'],
    categoryName: 'meal',
    defaultColor: theme.categories.meals,
    iconField: 'icon',
  } as CalendarTransformConfig,
};


// Base interface for any item that can be displayed in a calendar
export interface CalendarItem {
  id: string | number;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  title: string;
  description?: string;
  bgColor: string;
  category: string;
  // Additional optional fields for advanced features
  location?: string;
  icon?: string;
  metadata?: Record<string, any>; // For any custom data
}

// Input data that needs to be transformed
export interface CalendarDataInput {
  id: string | number;
  date_start: string; // DD/MM/YYYY HH:MM format
  date_end: string; // DD/MM/YYYY HH:MM format
  name?: string;
  title?: string;
  description?: string;
  info?: string;
  bio?: string; 
  style?: string;
  color?: string;
  location?: string;
  icon?: string;
  [key: string]: any; // Allow any additional fields
}

// Configuration for data transformation
export interface CalendarTransformConfig {
  titleField: string; // Which field to use as title (e.g., 'name', 'title')
  descriptionFields: string[]; // Priority order for description fields
  categoryName: string; // Category identifier
  defaultColor: string; // Default color if not specified
  colorField?: string; // Field containing color (optional)
  locationField?: string; // Field containing location (optional)
  iconField?: string; // Field containing icon (optional)
}

// Events organized by day
export interface CalendarEventsByDay {
  [dayName: string]: CalendarItem[];
}

/**
 * Extract time from date string (format: "DD/MM/YYYY HH:MM")
 */
export const extractTime = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.trim().split(' ');

  // If seconds are present, remove them
  if (parts[1] && parts[1].length > 5) {
    parts[1] = parts[1].slice(0, 5);
  }
  if (parts[1]) {
    return parts[1];
  }

  return parts[1] ?? '';
};

/**
 * Extract day name from date string
 * Supports custom day names mapping
 */
export const extractDayName = (
  dateString: string,
  dayMapping?: { [dayOfWeek: number]: string }
): string => {
  if (!dateString) return '';
  
  const parts = dateString.trim().split(' ');
  if (parts.length === 0) return '';
  
  const dateParts = parts[0].split('/');
  if (dateParts.length !== 3) return '';
  
  const day = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
  const year = parseInt(dateParts[2]);
  
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();
  
  // Use custom mapping or default French days
  const defaultMapping = { 
    0: 'Dimanche',
    1: 'Lundi',
    2: 'Mardi', 
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi',
  };
  
  const mapping = dayMapping || defaultMapping;
  
  return mapping[dayOfWeek] || '';
};

/**
 * Extract full date object from date string
 */
export const extractDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  const parts = dateString.trim().split(' ');
  if (parts.length === 0) return null;
  
  const dateParts = parts[0].split('/');
  if (dateParts.length !== 3) return null;
  
  const day = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;
  const year = parseInt(dateParts[2]);
  
  const timeParts = parts.length >= 2 ? parts[1].split(':') : ['0', '0'];
  const hours = parseInt(timeParts[0]) || 0;
  const minutes = parseInt(timeParts[1]) || 0;
  
  return new Date(year, month, day, hours, minutes);
};


/**
 * Transform a single data item into a CalendarItem
 */
export const transformToCalendarItem = (
  data: CalendarDataInput,
  config: CalendarTransformConfig
): CalendarItem | null => {
  const startTime = extractTime(data.date_start);
  const endTime = extractTime(data.date_end);
  
  if (!startTime || !endTime) {
    console.warn('Missing start or end time:', data);
    return null;
  }
  
  // Get title from configured field
  const title = data[config.titleField] || '';
  if (!title) {
    console.warn('Missing title field:', config.titleField, data);
    return null;
  }
  
  // Get description from priority list of fields
  let description = '';
  for (const field of config.descriptionFields) {
    if (data[field]) {
      description = data[field];
      break;
    }
  }
  
  // Get color
  const color = config.colorField && data[config.colorField] 
    ? data[config.colorField] 
    : config.defaultColor;
  
  // Get optional fields
  const location = config.locationField ? data[config.locationField] : undefined;
  const icon = config.iconField ? data[config.iconField] : undefined;
  
  return {
    id: `${config.categoryName}-${data.id}`,
    startTime,
    endTime,
    title,
    description,
    bgColor: color,
    category: config.categoryName,
    location,
    icon,
    metadata: { ...data }, // Store original data for reference
  };
};

/**
 * Transform array of data items into CalendarItems organized by day
 */
export const transformToCalendarEvents = (
  dataArray: CalendarDataInput[],
  config: CalendarTransformConfig,
  allowedDays?: string[] // Optional: filter by specific days
): CalendarEventsByDay => {
  const eventsByDay: CalendarEventsByDay = {};
  
  dataArray.forEach((item) => {
    const calendarItem = transformToCalendarItem(item, config);

    if (!calendarItem) return;
    
    const dayName = extractDayName(item.date_start);
    if (!dayName) {
        console.warn('Could not extract day name from date_start:', item);
        return;
    }
    
    // Filter by allowed days if specified
    if (allowedDays && !allowedDays.includes(dayName)) {
    console.warn('Day not allowed, skipping:', dayName, ' for event:', item);
      return;
    }
    
    // Initialize day array if not exists
    if (!eventsByDay[dayName]) { 
      eventsByDay[dayName] = [];
    }
    eventsByDay[dayName].push(calendarItem);
  });

  return eventsByDay;
};

/**
 * Merge multiple event sources into one calendar
 */
export const mergeCalendarEvents = (
  ...eventsByDayArray: CalendarEventsByDay[]
): CalendarEventsByDay => {
  const merged: CalendarEventsByDay = {};
  
  eventsByDayArray.forEach((eventsByDay) => {
    Object.keys(eventsByDay).forEach((day) => {
      if (!merged[day]) {
        merged[day] = [];
      }
      merged[day].push(...eventsByDay[day]);
    });
  });
  
  return merged;
};

/**
 * Sort calendar items by start time
 */
export const sortCalendarItems = (items: CalendarItem[]): CalendarItem[] => {
  return [...items].sort((a, b) => {
    const timeA = timeToMinutes(a.startTime);
    const timeB = timeToMinutes(b.startTime);
    return timeA - timeB;
  });
};

/**
 * Convert time string to minutes for comparison
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  // Handle times after midnight (00:00 - 06:00 considered next day)
  if (hours < 7) return (24 + hours) * 60 + minutes;
  return hours * 60 + minutes;
};

/**
 * Filter calendar items by category
 */
export const filterByCategory = (
  items: CalendarItem[],
  categories: string[]
): CalendarItem[] => {
  return items.filter((item) => categories.includes(item.category));
};

/**
 * Filter calendar items by time range
 */
export const filterByTimeRange = (
  items: CalendarItem[],
  startTime: string,
  endTime: string
): CalendarItem[] => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  return items.filter((item) => {
    const itemStart = timeToMinutes(item.startTime);
    const itemEnd = timeToMinutes(item.endTime);
    
    // Item overlaps with range
    return itemStart < endMinutes && itemEnd > startMinutes;
  });
};

/**
 * Get all unique categories from calendar items
 */
export const getCategories = (items: CalendarItem[]): string[] => {
  const categories = new Set<string>();
  items.forEach((item) => categories.add(item.category));
  return Array.from(categories);
};

/**
 * Get date range for calendar items
 */
export const getDateRange = (
  eventsByDay: CalendarEventsByDay
): { earliest: Date | null; latest: Date | null } => {
  let earliest: Date | null = null;
  let latest: Date | null = null;
  
  Object.values(eventsByDay).flat().forEach((item) => {
    if (item.metadata?.date_start) {
      const date = extractDate(item.metadata.date_start);
      if (date) {
        if (!earliest || date < earliest) earliest = date;
        if (!latest || date > latest) latest = date;
      }
    }
  });
  
  return { earliest, latest };
};

