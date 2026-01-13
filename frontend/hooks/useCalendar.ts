/**
 * useCalendar Hook
 * 
 * React hook for using calendar service in components.
 * Provides calendar-ready data with filtering and organization.
 */

import { useMemo } from 'react';
import {
  CalendarItem,
  CalendarEventsByDay,
  CalendarDataInput,
  CalendarTransformConfig,
  transformToCalendarEvents,
  mergeCalendarEvents,
  sortCalendarItems,
  filterByCategory,
  filterByTimeRange,
  CALENDAR_CONFIGS,
} from '@/services/calendar.service';

export interface UseCalendarOptions {
  allowedDays?: string[]; // Filter events to specific days
  sortByTime?: boolean; // Sort events within each day
  categories?: string[]; // Filter by categories
  timeRange?: { start: string; end: string }; // Filter by time range
}

/**
 * Hook to transform and organize calendar data
 */
export function useCalendar(
  dataArray: CalendarDataInput[],
  config: CalendarTransformConfig,
  options: UseCalendarOptions = {}
): CalendarEventsByDay {
  return useMemo(() => {
    // Transform data to calendar events
    let eventsByDay = transformToCalendarEvents(
      dataArray,
      config,
      options.allowedDays
    );

    // Apply filters and sorting to each day
    Object.keys(eventsByDay).forEach((day) => {
      let dayEvents = eventsByDay[day];

      // Filter by categories if specified
      if (options.categories && options.categories.length > 0) {
        dayEvents = filterByCategory(dayEvents, options.categories);
      }

      // Filter by time range if specified
      if (options.timeRange) {
        dayEvents = filterByTimeRange(
          dayEvents,
          options.timeRange.start,
          options.timeRange.end
        );
      }

      // Sort by time if requested
      if (options.sortByTime) {
        dayEvents = sortCalendarItems(dayEvents);
      }

      eventsByDay[day] = dayEvents;
    });

    return eventsByDay;
  }, [dataArray, config, options.allowedDays, options.sortByTime, options.categories, options.timeRange]);
}

/**
 * Hook to merge multiple data sources into a single calendar
 */
export function useMergedCalendar(
  sources: Array<{
    data: CalendarDataInput[];
    config: CalendarTransformConfig;
  }>,
  options: UseCalendarOptions = {}
): CalendarEventsByDay {
  return useMemo(() => {
    // Transform each source
    const allEventsByDay = sources.map((source) =>
      transformToCalendarEvents(source.data, source.config, options.allowedDays)
    );

    // Merge all sources
    let merged = mergeCalendarEvents(...allEventsByDay);

    // Apply filters and sorting
    Object.keys(merged).forEach((day) => {
      let dayEvents = merged[day];

      if (options.categories && options.categories.length > 0) {
        dayEvents = filterByCategory(dayEvents, options.categories);
      }

      if (options.timeRange) { 
        dayEvents = filterByTimeRange(
          dayEvents,
          options.timeRange.start,
          options.timeRange.end
        );
      }

      if (options.sortByTime) {
        dayEvents = sortCalendarItems(dayEvents);
      }

      merged[day] = dayEvents;
    });

    return merged;
  }, [sources, options]);
}

/**
 * Hook for festival calendar with artists, activities, and meals
 */
export function useFestivalCalendar(
  artists: any[],
  activities: any[],
  menuItems: any[],
  options: UseCalendarOptions = {}
): CalendarEventsByDay {
  return useMergedCalendar(
    [
      { data: artists, config: CALENDAR_CONFIGS.artists },
      { data: activities, config: CALENDAR_CONFIGS.activities },
      { data: menuItems, config: CALENDAR_CONFIGS.meals },
    ],
    { ...options, sortByTime: true }
  );
}

export function usePermCalendar(
  perms: any[],
  options: UseCalendarOptions = {}
): CalendarEventsByDay {
  return useMergedCalendar(
    [
      { data: perms, config: CALENDAR_CONFIGS.perms }
    ],
    { ...options, sortByTime: true }
  );
}

/**
 * Hook to get events for a specific day
 */
export function useDayEvents(
  eventsByDay: CalendarEventsByDay,
  day: string
): CalendarItem[] {
  return useMemo(() => {
    return eventsByDay[day] || [];
  }, [eventsByDay, day]);
}
