import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, StyleSheet, LayoutChangeEvent } from 'react-native';
import theme from '@/constants/theme';
import ThemedText from './ThemedText';

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export default function DayTabView({ options, value, onChange }: Props) {
  const index = Math.max(0, options.indexOf(value));
  const anim = useRef(new Animated.Value(index)).current;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    Animated.spring(anim, { toValue: index, useNativeDriver: true }).start();
  }, [index, anim]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 6,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -50 && index < options.length - 1) {
            onChange(options[index + 1]);
        }
        else if (gs.dx > 50 && index > 0){
            onChange(options[index - 1]);
        } 
      },
    })
  ).current;

  const tabWidth = width / Math.max(1, options.length);
  const translateX = anim.interpolate({ inputRange: [0, options.length - 1], outputRange: [0, tabWidth * (options.length - 1)] });

  return (
    <View onLayout={onLayout} style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.row}>
        {options.map((opt, i) => (
          <TouchableOpacity key={opt} style={styles.tabButton} onPress={() => onChange(opt)} activeOpacity={0.8}>
            <ThemedText style={[styles.tabText, i === index && styles.tabTextActive]}>{opt}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.underlineContainer} pointerEvents="none">
        <Animated.View style={[styles.underline, { width: tabWidth || 0, transform: [{ translateX: translateX }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 2,
  },
  tabText: {
    fontSize: 14,
    color: theme.text.primary,
  },
  tabTextActive: {
    color: theme.interactive.primary,
    fontWeight: '700',
  },
  underlineContainer: {
    height: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  underline: {
    height: 4,
    backgroundColor: theme.interactive.primary,
    borderRadius: 4,
  },
});
