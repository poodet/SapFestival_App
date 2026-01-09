import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { CalendarPermEventCard, CalendarPermEventHorizontalCard } from '@/components/CalendarEventCard';
import { NormalText, ThemedText } from '@/components/ThemedText';
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

// Standard column assignment - distributes all perms equally without user prioritization
// TODO - use this function in assignColumnsPerms to avoid code duplication
const assignColumnsStandard = (events: any[]) => {
  const sortByTime = (a: any, b: any) => {
    const timeDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    return timeDiff !== 0 ? timeDiff : 0;
  };

  const sortedEvents = [...events].sort(sortByTime);
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
  const [searchText, setSearchText] = useState('');
  const [selectedPoles, setSelectedPoles] = useState<string[]>([]);
  const [showPoleDropdown, setShowPoleDropdown] = useState(false);
  const [showMyPermsOnly, setShowMyPermsOnly] = useState(false);
  const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([]);
  const [showOrganizerDropdown, setShowOrganizerDropdown] = useState(false);

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

  // Apply perm-specific colors and column assignment
  const permsWithColors = filteredPerms.map(perm => ({
    ...perm,
    bgColor: getPermColor(perm.metadata?.pole || perm.title),
    icon: getPermIcon(perm.metadata?.pole || perm.title),
  }));

  // Use standard column assignment when showing only user's perms for better readability
  const { positionedEvents: positionedPerms, columnCount: columnCountPerms } = 
    showMyPermsOnly 
      ? assignColumnsStandard(permsWithColors)
      : assignColumnsPerms(permsWithColors, userName);

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
      {/* Search and Filter Bar */}
      <View style={{ paddingHorizontal: 8, paddingVertical: 8, gap: 8, zIndex: 1000 }}>
        {/* Search Input */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          backgroundColor: theme.ui.white,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: theme.interactive.inactive,
        }}>
          <Ionicons name="search-outline" size={20} color={theme.text.secondary} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 16,
              paddingVertical: 4,
            }}
            placeholder="Rechercher une perm..."
            placeholderTextColor={theme.text.secondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={theme.text.secondary} />
            </Pressable>
          )}
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
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: showMyPermsOnly ? theme.interactive.primary : theme.interactive.inactive,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons 
              name={showMyPermsOnly ? "person" : "person-outline"} 
              size={24} 
              color={showMyPermsOnly ? theme.ui.white : theme.interactive.primary} 
            />
          </Pressable>

          {/* Pole Filter Dropdown */}
          <View style={{ flex: 1, position: 'relative', zIndex: 1001 }}>
            <Pressable
              onPress={() => setShowPoleDropdown(!showPoleDropdown)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: selectedPoles.length > 0 ? theme.interactive.primary : theme.ui.white,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: selectedPoles.length > 0 ? theme.interactive.primary : theme.interactive.inactive,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons 
                  name="filter-outline" 
                  size={20} 
                  color={selectedPoles.length > 0 ? theme.text.primary : theme.text.secondary} 
                />
                <NormalText style={{ 
                  marginLeft: 8, 
                  color: selectedPoles.length > 0 ? theme.text.primary : theme.text.secondary,
                  fontSize: 16,
              }}>
                {selectedPoles.length > 0 
                  ? `Pôles (${selectedPoles.length})` 
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
              right: 0,
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
            }}>
              <ScrollView>
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
                      Effacer tous les filtres
                    </ThemedText>
                  </Pressable>
                )}
                
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
            </View>
          )}
          </View>

          {/* Organizer Filter Dropdown */}
          <View style={{ flex: 1, position: 'relative', zIndex: 1001 }}>
            <Pressable
              onPress={() => setShowOrganizerDropdown(!showOrganizerDropdown)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: selectedOrganizers.length > 0 ? theme.interactive.primary : theme.ui.white,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: selectedOrganizers.length > 0 ? theme.interactive.primary : theme.interactive.inactive,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons 
                  name="people-outline" 
                  size={20} 
                  color={selectedOrganizers.length > 0 ? theme.text.primary : theme.text.secondary} 
                />
                <NormalText style={{ 
                  marginLeft: 8, 
                  color: selectedOrganizers.length > 0 ? theme.text.primary : theme.text.secondary,
                  fontSize: 16,
              }}>
                {selectedOrganizers.length > 0 
                  ? `Orga (${selectedOrganizers.length})` 
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
              right: 0,
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
            }}>
              <ScrollView>
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
                      Effacer tous les filtres
                    </ThemedText>
                  </Pressable>
                )}
                
                {availableOrganizers.map((organizer) => {
                  const isSelected = selectedOrganizers.includes(organizer);
                  
                  return (
                    <Pressable
                      key={organizer}
                      onPress={() => toggleOrganizer(organizer)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.interactive.inactive,
                        backgroundColor: isSelected ? `${theme.interactive.primary}20` : 'transparent',
                      }}
                    >
                      <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: theme.interactive.primary,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}>
                        <ThemedText style={{ color: theme.ui.white, fontSize: 14, fontWeight: '600' }}>
                          {organizer.charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>
                      <NormalText style={{ 
                        flex: 1, 
                        fontSize: 16,
                      }}>
                        {organizer}
                      </NormalText>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color={theme.interactive.primary} />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
          </View>
        </View>
      </View>

      {/* Day selector and view toggle */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingTop: 8 }}>
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
