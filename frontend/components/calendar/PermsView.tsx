import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, ScrollView, Pressable, TextInput, Dimensions, Image } from 'react-native';
import { CalendarPermEventCard, CARD_HEIGHT, CARD_WIDTH, getInitials, getSmallerName } from '@/components/CalendarEventCard';
import { NormalText, ThemedText } from '@/components/ThemedText';
import { timeToMinutes } from '@/services/calendar.service';
import {theme, layout} from '@/constants/theme'; 
import Ionicons from '@expo/vector-icons/Ionicons';
import { getOrganizerImage } from '../organizerImageMapper';

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

/**
 * Unified column/row assignment for perms - organized by pole with sub-columns for overlaps
 * Works for both vertical (columns) and horizontal (rows) views
 * - Each pole gets its own column/row
 * - Overlapping perms within a pole are placed in sub-columns side by side
 * - Pole columns expand based on sub-column count for consistent card sizing
 */
const assignPositions = (events: any[]) => {
  // Group events by pole
  const poleGroups = new Map<string, any[]>();
  
  events.forEach(event => {
    const poleName = event.metadata?.pole || event.title || 'Unknown';
    if (!poleGroups.has(poleName)) {
      poleGroups.set(poleName, []);
    }
    poleGroups.get(poleName)!.push(event);
  });

  // Sort poles alphabetically for consistent ordering
  const sortedPoles = Array.from(poleGroups.keys()).sort();

  // Process each pole to detect overlaps and assign sub-columns
  const positionedEvents: any[] = [];
  const poleSubColumnCounts = new Map<number, number>(); // Track sub-columns per pole
  const poleColumnOffsets = new Map<number, number>(); // Track starting position of each pole

  let cumulativeOffset = 0;

  sortedPoles.forEach((pole, poleIndex) => {
    const poleEvents = poleGroups.get(pole)!;
    
    // Sort events within pole by time
    poleEvents.sort((a, b) => {
      const timeDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
      return timeDiff !== 0 ? timeDiff : 0;
    });

    // Assign sub-columns within this pole for overlapping events
    const subColumns: any[][] = [];
    
    for (const event of poleEvents) {
      let placed = false;
      
      // Try to place in existing sub-column
      for (let subCol = 0; subCol < subColumns.length; subCol++) {
        const hasOverlap = subColumns[subCol].some(
          e =>
            timeToMinutes(e.endTime) > timeToMinutes(event.startTime) &&
            timeToMinutes(e.startTime) < timeToMinutes(event.endTime)
        );
        
        if (!hasOverlap) {
          subColumns[subCol].push(event);
          event.subColumn = subCol;
          placed = true;
          break;
        }
      }
      
      // If not placed, create new sub-column
      if (!placed) {
        event.subColumn = subColumns.length;
        subColumns.push([event]);
      }
    }

    // Store the number of sub-columns and offset for this pole
    poleSubColumnCounts.set(poleIndex, subColumns.length);
    poleColumnOffsets.set(poleIndex, cumulativeOffset);
    
    // Update cumulative offset for next pole
    cumulativeOffset += subColumns.length;

    // Assign pole column and sub-column count to all events in this pole
    poleEvents.forEach(event => {
      positionedEvents.push({
        ...event,
        column: poleIndex,
        subColumnCount: subColumns.length,
        columnOffset: poleColumnOffsets.get(poleIndex)!,
      });
    });
  });

  // Total number of unit columns across all poles
  const totalUnitColumns = cumulativeOffset;

  return { 
    positionedEvents, 
    columnCount: sortedPoles.length, 
    poles: sortedPoles,
    poleSubColumnCounts,
    poleColumnOffsets,
    totalUnitColumns,
  };
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
  const [containerWidth, setContainerWidth] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedPoles, setSelectedPoles] = useState<string[]>([]);
  const [showPoleDropdown, setShowPoleDropdown] = useState(false);
  const [showMyPermsOnly, setShowMyPermsOnly] = useState(false);
  const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([]);
  const [showOrganizerDropdown, setShowOrganizerDropdown] = useState(false);

  // Refs to reset scroll position when switching modes
  const verticalModeHorizontalScrollRef = useRef<ScrollView>(null);
  const verticalModeHeaderScrollRef = useRef<ScrollView>(null);
  const horizontalModeOuterScrollRef = useRef<ScrollView>(null);
  const horizontalModeHeaderScrollRef = useRef<ScrollView>(null);

  // Detect orientation changes and update view mode automatically
  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      const newIsHorizontal = width > height;
      
      if (newIsHorizontal !== isHorizontal) {
        if (!newIsHorizontal) {
          // Switching to vertical - reset the horizontal scroll in vertical mode
          setTimeout(() => {
            verticalModeHorizontalScrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
            verticalModeHeaderScrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
          }, 0);
        }
        setIsHorizontal(newIsHorizontal);
      }
    };

    // Initial check
    updateOrientation();

    // Listen for dimension changes
    const subscription = Dimensions.addEventListener('change', updateOrientation);

    return () => {
      subscription?.remove();
    };
  }, [isHorizontal]);

  // Sync horizontal scroll between header and calendar in vertical mode
  const handleVerticalModeScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    verticalModeHeaderScrollRef.current?.scrollTo({ x: scrollX, y: 0, animated: false });
  };

  // Sync vertical scroll between header and calendar in horizontal mode
  const handleHorizontalModeScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    horizontalModeHeaderScrollRef.current?.scrollTo({ x: 0, y: scrollY, animated: false });
  };

  // Get all available poles from permStyle
  const availablePoles = Object.keys(permStyle);

  // Get all unique organizers from perms
  const availableOrganizers = useMemo(() => {
    const organizers = new Set<string>();
    eventsPerms.forEach(perm => {
      if (perm.metadata?.organizer) {
        organizers.add(perm.metadata.organizer);
      }
    });
    return Array.from(organizers).sort();
  }, [eventsPerms]);

  // Toggle pole selection
  const togglePole = (pole: string) => {
    setSelectedPoles(prev => 
      prev.includes(pole) 
        ? prev.filter(p => p !== pole)
        : [...prev, pole]
    );
  };

  // Toggle organizer selection
  const toggleOrganizer = (organizer: string) => {
    setSelectedOrganizers(prev => 
      prev.includes(organizer) 
        ? prev.filter(o => o !== organizer)
        : [...prev, organizer]
    );
  };

  // Filter perms based on search, selected poles, and user filter
  const filteredPerms = useMemo(() => {
    let filtered = eventsPerms;

    // Apply user filter
    if (showMyPermsOnly) {
      filtered = filtered.filter(perm => perm.metadata?.organizer === userName);
    }

    // Apply search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(perm => {
        // Search in all relevant fields
        const searchableText = [
          perm.title,
          perm.startTime,
          perm.endTime,
          perm.metadata?.organizer,
          perm.metadata?.pole,
          perm.metadata?.perm,
          perm.metadata?.description,
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(searchLower);
      });
    }

    // Apply pole filter
    if (selectedPoles.length > 0) {
      filtered = filtered.filter(perm => {
        const permPole = perm.metadata?.pole || perm.title;
        return selectedPoles.some(selectedPole => 
          selectedPole.toLowerCase() === permPole.toLowerCase()
        );
      });
    }

    // Apply organizer filter
    if (selectedOrganizers.length > 0) {
      filtered = filtered.filter(perm => {
        return selectedOrganizers.includes(perm.metadata?.organizer || '');
      });
    }

    return filtered;
  }, [eventsPerms, searchText, selectedPoles, selectedOrganizers, showMyPermsOnly, userName]);

  // Apply perm-specific colors and unified positioning
  const permsWithColors = filteredPerms.map(perm => ({
    ...perm,
    bgColor: getPermColor(perm.metadata?.pole || perm.title),
    icon: getPermIcon(perm.metadata?.pole || perm.title),
  }));

  // Use unified positioning - group by pole with sub-column detection
  const { 
    positionedEvents: positionedPerms, 
    columnCount, 
    poles, 
    poleSubColumnCounts,
    poleColumnOffsets,
    totalUnitColumns,
  } = assignPositions(permsWithColors);

  // All cards have consistent size - no span expansion
  const permsWithSpan = positionedPerms.map((perm) => ({
    ...perm,
    span: 1, // All cards have same width/height
    totalUnitColumns,
  }));

  const TIME_LABEL_WIDTH = 60; // fixed left column width for time labels
  const availableCalendarWidth = Math.max(
    totalUnitColumns * CARD_WIDTH,
    Math.max(0, containerWidth - TIME_LABEL_WIDTH - 20) // 20 for paddings/margins
  );

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{ flex: 1, paddingHorizontal: 10 }}
    >
      {(showPoleDropdown || showOrganizerDropdown) && (
        <Pressable
          onPress={() => {
            setShowPoleDropdown(false);
            setShowOrganizerDropdown(false);
          }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }}
        />
      )}
      {/* Search and Filter Bar */}
      <View style={{  paddingBottom: 8, gap: 8, zIndex: 1000 }}>
        <View style={{ flexDirection: 'row',  justifyContent: 'space-between', gap : 8 }}>
          {/* Search Input */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            backgroundColor: theme.ui.white,
            borderRadius: 8,
            paddingHorizontal: 12,
            flex: 1,
            overflow: 'hidden',
            display: 'none',
          }}>
            <Ionicons name="search-outline" size={20} color={theme.text.secondary} />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 16,
                minWidth: 0,
              }}
              placeholder="Rechercher..."
              placeholderTextColor='grey'
              value={searchText}
              onChangeText={setSearchText}
              numberOfLines={1}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color={theme.text.secondary} />
              </Pressable>
            )}

          </View>




        </View>

        {/* Filter Row: My Perms Toggle + Pole Filter Dropdown */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {/* My Perms Only Toggle */}
          <Pressable
            onPress={() => setShowMyPermsOnly(!showMyPermsOnly)}
            style={{
              backgroundColor: showMyPermsOnly ? theme.interactive.primary : theme.ui.white,
              borderRadius: 8,
              paddingHorizontal: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons 
              name={showMyPermsOnly ? "person" : "person-outline"} 
              size={16} 
              color={showMyPermsOnly ? theme.ui.white : theme.text.secondary} 
            />
          </Pressable>

          {/* Pole Filter Dropdown */}
          <View style={{  position: 'relative', zIndex: 1001 }}>
            <Pressable
              onPress={() => {
                setShowPoleDropdown(!showPoleDropdown);
                if (!showPoleDropdown) setShowOrganizerDropdown(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: selectedPoles.length > 0 ? theme.interactive.primary : theme.ui.white,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>

                <NormalText style={{ 
                  color: selectedPoles.length > 0 ? theme.text.primary : theme.text.secondary,
                  fontSize: 16,
              }}>
                {selectedPoles.length > 0 
                  ? `Pôles` 
                  + ': '+(selectedPoles.length)
                  : 'Pôle'}
              </NormalText>
            </View>
            <Ionicons 
              name={showPoleDropdown ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={selectedPoles.length > 0 ? theme.text.primary : theme.text.secondary} 
            />
          </Pressable>

          {/* Dropdown Menu */}
          {showPoleDropdown && (
            <View style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: theme.ui.white,
              borderRadius: 8,
              marginTop: 4,
              borderWidth: 1,
              borderColor: theme.interactive.inactive,
              maxHeight: 300,
              // minWidth: 200,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              zIndex: 1002,
            }}>
              <ScrollView>
               
                {availablePoles.map((pole) => {
                  const isSelected = selectedPoles.includes(pole);
                  const poleColor = permStyle[pole].color;
                  const poleIcon = permStyle[pole].icon;
                  
                  return (
                    <Pressable
                      key={pole}
                      onPress={() => togglePole(pole)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.interactive.inactive,
                        backgroundColor: isSelected ? `${poleColor}20` : 'transparent',
                      }}
                    >
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        backgroundColor: poleColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}>
                        <Ionicons name={poleIcon as any} size={16} color={theme.ui.white} />
                      </View>
                      <NormalText style={{ 
                        flex: 1, 
                        fontSize: 16,
                      }}>
                        {pole}
                      </NormalText>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color={poleColor} />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
              {/* Clear all button */}
              {selectedPoles.length > 0 && (
                <Pressable
                  onPress={() => {
                      setSelectedPoles([]);
                      setShowPoleDropdown(false);
                  }}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.interactive.inactive,
                    backgroundColor: theme.background.secondary,
                  }}
                >
                  <ThemedText style={{ color: theme.interactive.primary, fontSize: 14, fontWeight: '600' }}>
                    Reinitialiser
                  </ThemedText>
                </Pressable>
              )}
            </View>
          )}
          </View>

          {/* Organizer Filter Dropdown */}
          <View style={{  position: 'relative', zIndex: 1001 }}>
            <Pressable
              onPress={() => {
                setShowOrganizerDropdown(!showOrganizerDropdown)
                if (!showOrganizerDropdown) setShowPoleDropdown(false)
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: selectedOrganizers.length > 0 ? theme.interactive.primary : theme.ui.white,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <NormalText style={{ 
                  color: selectedOrganizers.length > 0 ? theme.text.primary : theme.text.secondary,
                  fontSize: 16,
              }}>
                {selectedOrganizers.length > 0 
                  ? `Orgas` 
                  + ': '+(selectedOrganizers.length)
                  : 'Orga'}
              </NormalText>
            </View>
            <Ionicons 
              name={showOrganizerDropdown ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={selectedOrganizers.length > 0 ? theme.text.primary : theme.text.secondary} 
            />
          </Pressable>

          {/* Dropdown Menu */}
          {showOrganizerDropdown && (
            <View style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: theme.ui.white,
              borderRadius: 8,
              marginTop: 4,
              borderWidth: 1,
              borderColor: theme.interactive.inactive,
              maxHeight: 300,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              zIndex: 1002,
              minWidth: 150,
            }}>
              <ScrollView>
                {availableOrganizers.map((organizer) => {
                  const isSelected = selectedOrganizers.includes(organizer);
                  
                  return (
                    <Pressable
                      key={organizer}
                      onPress={() => toggleOrganizer(organizer)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                        gap: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.interactive.inactive,
                        backgroundColor: isSelected ? `${theme.interactive.primary}20` : 'transparent',
                      }}
                    >
                      <Image
                        source={getOrganizerImage(organizer)}
                        style={{
                              width: 24,
                              height: 24,
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: theme.text.primary,
                        }}
                        resizeMode="cover"
                      />

                      <NormalText style={{ 
                        flex: 1, 
                        fontSize: 16,
                      }}>
                        {getSmallerName(organizer)}
                      </NormalText>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color={theme.interactive.primary} />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
                {/* Clear all button */}
                {selectedOrganizers.length > 0 && (
                  <Pressable
                    onPress={() => {
                        setSelectedOrganizers([]);
                        setShowOrganizerDropdown(false);
                    }}
                    style={{
                      padding: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.interactive.inactive,
                      backgroundColor: theme.background.secondary,
                    }}
                  >
              <ThemedText style={{ color: theme.interactive.primary, fontSize: 14, fontWeight: '600' }}>
                Reinitialiser
              </ThemedText>
                  </Pressable>
                )}
            </View>
          )}
          </View>

                  {/* Day selector - compact version above calendar */}
        <View style={{ flexDirection: 'row', justifyContent: 'end', flex: 1 }}>
          {days.map((day) => (
            <Pressable
              key={day}
              onPress={() => onDaySelect(day)}
              style={{
                backgroundColor: theme.ui.white,
                padding: 5,
                borderRadius: 8,
                borderWidth: 5,
                borderColor: selectedDay === day ? theme.interactive.primary : theme.background.primary,
                alignSelf: 'center',
              }}
            >
              <ThemedText
                style={{
                  color: selectedDay === day ? theme.interactive.primary : theme.interactive.inactive,
                  fontSize: 16,
                }}
              >
                {day.slice(0, 3)}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        </View>
      </View>


      {!isHorizontal ? (
        // Vertical View - Pole headers fixed vertically, scroll horizontally in sync with calendar
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          {/* Fixed pole headers row - synced horizontal scroll */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <View style={{ width: 60 }} />
            
            {/* Pole headers - scroll horizontally, fixed vertically */}
            <ScrollView
              ref={verticalModeHeaderScrollRef}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              style={{ flex: 1 }}
            >
                <View style={{ flexDirection: 'row', width: availableCalendarWidth }}>
                {poles.map((pole, idx) => {
                  const subColCount = poleSubColumnCounts.get(idx) || 1;
                  const poleWidth = CARD_WIDTH * subColCount;
                  
                  return (
                    <View 
                      key={pole} 
                      style={{ 
                        width: poleWidth,
                        height: 40,
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: getPermColor(pole),
                        borderRadius: 4,
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <Ionicons name={getPermIcon(pole) as any} size={16} color={theme.ui.white} />
                      <ThemedText style={{ fontSize: 14, fontWeight: 'bold', color: theme.ui.white }}>
                        {pole.substring(0, 3)}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
          
          {/* Scrollable content area */}
          <ScrollView style={{ flex: 1,  paddingBottom: layout.tabBar.contentPadding }}>
            <View style={{ flexDirection: 'row' }}>
              {/* Fixed time labels */}
              <View style={{ width: 60 }}>
                {timeSlots.map((time, idx) => (
                  <View key={idx} style={{ height: SLOT_HEIGHT, justifyContent: 'center' }}>
                    <ThemedText style={{ fontSize: 16, color: theme.text.primary }}>{time}</ThemedText>
                  </View>
                ))}
              </View>
              
              {/* Horizontally scrollable calendar */}
              <ScrollView
                ref={verticalModeHorizontalScrollRef}
                horizontal={true}
                showsHorizontalScrollIndicator={true}
                scrollEventThrottle={16}
                onScroll={handleVerticalModeScroll}
                style={{ flex: 1 }}
              >
                <View style={{ position: 'relative', width: availableCalendarWidth }}>
                  {/* Time slot lines */}
                  {timeSlots.map((time, idx) => (
                    <View
                      key={`line-${idx}`}
                      style={{
                        position: 'absolute',
                        top: idx * SLOT_HEIGHT + SLOT_HEIGHT / 2,
                        left: 0,
                        right: 0,
                        height: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      }}
                    />
                  ))}
                  
                  {/* Perm cards */}
                  {permsWithSpan.map((event) => (
                    <CalendarPermEventCard
                      key={event.id}
                      event={event}
                      columnCount={columnCount}
                      minHour={minHour}
                      slotHeight={SLOT_HEIGHT}
                      onPress={onPermPress}
                      fieldToDisplay={['organizer']}
                      isHorizontal={false}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      ) : (
        // Horizontal View - Pole labels fixed horizontally, scroll vertically in sync with calendar
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Fixed pole labels column */}
          <View style={{ width: 60 }}>
            {/* Spacer for time header */}
            <View style={{ height: 40 }} />
            
            {/* Pole labels - synced vertical scroll */}
            <View style={{ flex: 1 }}>
              <ScrollView 
                ref={horizontalModeHeaderScrollRef}
                scrollEnabled={false} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: layout.tabBar.contentPadding }}
                
              >
                <View style={{ paddingHorizontal: 5 }}>
                  {poles.map((pole, rowIdx) => {
                    const subColCount = poleSubColumnCounts.get(rowIdx) || 1;
                    const poleHeight = CARD_HEIGHT * subColCount;

                    return (
                      <View
                        key={pole}
                        style={{
                          height: poleHeight,
                          width: 50,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: getPermColor(pole),
                          marginVertical: 2,
                          borderRadius: 4,
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        <Ionicons name={getPermIcon(pole) as any} size={16} color={theme.ui.white} />
                        <ThemedText style={{ 
                          fontSize: 12, 
                          fontWeight: 'bold', 
                          color: theme.ui.white,
                          textAlign: 'center',
                        }}>
                          {pole}
                        </ThemedText>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
          
          {/* Scrollable content area */}
          <ScrollView ref={horizontalModeOuterScrollRef} horizontal={true} style={{ flex: 1 }}>
            <View>
              {/* Fixed time header */}
              <View style={{ flexDirection: 'row', height: 40, paddingHorizontal: 10 }}>
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
              </View>

              {/* Vertically scrollable content area */}
              <ScrollView 
                style={{ flex: 1 }}
                scrollEventThrottle={16}
                onScroll={handleHorizontalModeScroll}
                contentContainerStyle={{ paddingBottom: layout.tabBar.contentPadding }}
              >
                <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
                  {/* Perm rows with background */}
                  <View style={{ position: 'relative' }}>
                    {/* Time slot vertical lines */}
                    {timeSlots.map((time, idx) => (
                      <View
                        key={`vline-${idx}`}
                        style={{
                          position: 'absolute',
                          left: idx * SLOT_HEIGHT,
                          top: 0,
                          bottom: 0,
                          width: 1,
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        }}
                      />
                    ))}
                    
                    {poles.map((pole, rowIdx) => {
                      const rowPerms = permsWithSpan.filter(p => p.column === rowIdx);
                      const subColCount = poleSubColumnCounts.get(rowIdx) || 1;
                      const poleHeight = CARD_HEIGHT * subColCount;

                      return (
                        <View
                          key={pole}
                          style={{
                            height: poleHeight,
                            position: 'relative',
                            marginVertical: 2,
                          }}
                        >
                          {rowPerms.map((perm) => (
                            <CalendarPermEventCard
                              key={perm.id}
                              event={perm}
                              columnCount={1}
                              minHour={minHour}
                              slotHeight={SLOT_HEIGHT}
                              onPress={onPermPress}
                              fieldToDisplay={['organizer']}
                              isHorizontal={true}
                            />
                          ))}
                        </View>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};
