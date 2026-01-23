import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { theme } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

type PickerMode = 'date' | 'time';

interface CustomDateTimePickerProps {
  mode: PickerMode;
  value: Date;
  onChange: (event: any, date?: Date) => void;
  onClose: () => void;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

export default function CustomDateTimePicker({
  mode,
  value,
  onChange,
  onClose,
}: CustomDateTimePickerProps) {
  const currentYear = new Date().getFullYear();
  
  // Generate arrays for pickers
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 0, label: 'Janvier' },
    { value: 1, label: 'Février' },
    { value: 2, label: 'Mars' },
    { value: 3, label: 'Avril' },
    { value: 4, label: 'Mai' },
    { value: 5, label: 'Juin' },
    { value: 6, label: 'Juillet' },
    { value: 7, label: 'Août' },
    { value: 8, label: 'Septembre' },
    { value: 9, label: 'Octobre' },
    { value: 10, label: 'Novembre' },
    { value: 11, label: 'Décembre' },
  ];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const [selectedDay, setSelectedDay] = useState(value.getDate());
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth());
  const [selectedHour, setSelectedHour] = useState(value.getHours());
  const [selectedMinute, setSelectedMinute] = useState(value.getMinutes());

  const dayScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to initial values on mount
  useEffect(() => {
    setTimeout(() => {
      if (mode === 'date') {
        dayScrollRef.current?.scrollTo({ y: (selectedDay - 1) * ITEM_HEIGHT, animated: false });
        monthScrollRef.current?.scrollTo({ y: selectedMonth * ITEM_HEIGHT, animated: false });
      } else {
        hourScrollRef.current?.scrollTo({ y: selectedHour * ITEM_HEIGHT, animated: false });
        minuteScrollRef.current?.scrollTo({ y: selectedMinute * ITEM_HEIGHT, animated: false });
      }
    }, 100);
    
    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const snapToCenter = (
    scrollRef: React.RefObject<ScrollView>,
    data: any[],
    yOffset: number
  ) => {
    const index = Math.round(yOffset / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    scrollRef.current?.scrollTo({ y: clampedIndex * ITEM_HEIGHT, animated: true });
  };

  const handleScrollUpdate = (
    scrollRef: React.RefObject<ScrollView>,
    data: any[],
    setter: (val: number) => void
  ) => {
    return (event: any) => {
      const yOffset = event.nativeEvent.contentOffset.y;
      const index = Math.round(yOffset / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
      const value = typeof data[clampedIndex] === 'object' ? data[clampedIndex].value : data[clampedIndex];
      setter(value);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set new timeout to snap when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        snapToCenter(scrollRef, data, yOffset);
      }, 100);
    };
  };

  const handleConfirm = () => {
    const newDate = new Date(value);
    if (mode === 'date') {
      newDate.setDate(selectedDay);
      newDate.setMonth(selectedMonth);
    } else {
      newDate.setHours(selectedHour);
      newDate.setMinutes(selectedMinute);
    }
    // Call onChange first to update the parent state
    onChange({}, newDate);
    // Small delay to ensure state is updated before closing
    setTimeout(() => {
      onClose();
    }, 50);
  };

  const renderPickerColumn = (
    data: any[],
    selectedValue: number,
    scrollRef: React.RefObject<ScrollView>,
    setter: (val: number) => void,
    renderLabel?: (item: any) => string
  ) => {
    const scrollHandler = handleScrollUpdate(scrollRef, data, setter);
    
    return (
      <View style={styles.pickerColumn}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="center"
          decelerationRate="fast"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
          }}
        >
          {data.map((item, index) => {
            const value = typeof item === 'object' ? item.value : item;
            const label = renderLabel ? renderLabel(item) : String(item).padStart(2, '0');
            const isSelected = value === selectedValue;
            
            return (
              <Pressable
                key={index}
                style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                onPress={() => {
                  scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
                  setter(value);
                }}
              >
                <Text style={[styles.pickerText, isSelected && styles.pickerTextSelected]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay} 
        onPress={onClose}
        onStartShouldSetResponder={() => true}
      >
        <Pressable style={styles.pickerContainer} onPress={(e: any) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.headerButton}>
              <Text style={styles.cancelText}>Annuler</Text>
            </Pressable>
            <Text style={styles.headerTitle}>
              {mode === 'date' ? 'Sélectionner une date' : 'Sélectionner l\'heure'}
            </Text>
            <Pressable onPress={handleConfirm} style={styles.headerButton}>
              <Text style={styles.confirmText}>OK</Text>
            </Pressable>
          </View>

          {/* Selection Indicator */}
          <View style={styles.selectionIndicator} />

          {/* Picker Wheels */}
          <View style={styles.pickersRow}>
            {mode === 'date' ? (
              <>
                {renderPickerColumn(
                  days,
                  selectedDay,
                  dayScrollRef,
                  setSelectedDay
                )}
                {renderPickerColumn(
                  months,
                  selectedMonth,
                  monthScrollRef,
                  setSelectedMonth,
                  (item) => item.label
                )}
              </>
            ) : (
              <>
                {renderPickerColumn(
                  hours,
                  selectedHour,
                  hourScrollRef,
                  setSelectedHour
                )}
                <Text style={styles.separator}>:</Text>
                {renderPickerColumn(
                  minutes,
                  selectedMinute,
                  minuteScrollRef,
                  setSelectedMinute
                )}
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: theme.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.interactive.inactive,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  cancelText: {
    fontSize: 16,
    color: theme.text.secondary,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.interactive.primary,
    textAlign: 'right',
  },
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    paddingHorizontal: 20,
  },
  pickerColumn: {
    flex: 1,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemSelected: {
    // Selected item styling handled by overlay
  },
  pickerText: {
    fontSize: 18,
    color: theme.text.secondary,
  },
  pickerTextSelected: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
  },
  separator: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.text.primary,
    marginHorizontal: 10,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 72 + ITEM_HEIGHT * 2,
    left: 20,
    right: 20,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.interactive.inactive,
  },
});
