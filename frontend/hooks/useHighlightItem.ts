/**
 * useHighlightItem Hook
 * 
 * Reusable hook for highlighting and animating items when navigating from calendar.
 * Handles:
 * - Reading highlight ID from URL parameters
 * - Managing local highlight state
 * - Scroll-to-item functionality
 * - Scale animation on highlighted item
 * - Cleanup when screen loses focus
 */

import { useEffect, useRef, useCallback } from 'react';
import { FlatList } from 'react-native';
import { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useHighlight } from '@/contexts/HighlightContext';

export interface UseHighlightItemOptions {
  /**
   * Array of items to search through
   */
  items: any[];
  
  /**
   * Delay before scrolling (ms)
   * @default 300
   */
  scrollDelay?: number;
  
  /**
   * Delay before animation (ms)
   * @default 300
   */
  animationDelay?: number;
  
  /**
   * Position of the item in viewport (0-1)
   * @default 0.2
   */
  viewPosition?: number;
  
  /**
   * Scale animation peak value
   * @default 1.05
   */
  scaleValue?: number;
  
  /**
   * Duration of each animation phase (ms)
   * @default 200
   */
  animationDuration?: number;
  
  /**
   * Number of animation pulses
   * @default 2
   */
  pulseCount?: number;
}

export interface UseHighlightItemReturn {
  /**
   * Current highlighted item ID
   */
  currentHighlightId: string | null;
  
  /**
   * Animated style to apply to highlighted item
   */
  animatedStyle: any;
  
  /**
   * Check if an item is currently highlighted
   */
  isItemHighlighted: (itemId: number | string) => boolean;
  
  /**
   * Ref for FlatList (if using FlatList)
   */
  flatListRef: React.RefObject<FlatList>;
  
  /**
   * Manually trigger scroll to item
   */
  scrollToItem: (itemId: string) => void;
}

/**
 * Hook for managing item highlight and animation
 */
export function useHighlightItem(
  options: UseHighlightItemOptions
): UseHighlightItemReturn {
  const {
    items,
    scrollDelay = 300,
    animationDelay = 300,
    viewPosition = 0.2,
    scaleValue = 1.05,
    animationDuration = 200,
    pulseCount = 2,
  } = options;
  // const { /* keep backwards compatible */ } = options as any;
  const numColumns = (options as any).numColumns || 1;

  const { highlightId, clearHighlight } = useHighlight();
  const flatListRef = useRef<FlatList>(null);
  const hasProcessedHighlight = useRef(false);
  
  // Animation value for highlighted card using Reanimated
  const scale = useSharedValue(1);

  // Reset the flag when highlightId changes
  useEffect(() => {
    if (highlightId) {
      hasProcessedHighlight.current = false;
    }
  }, [highlightId]);

  // Clear highlight when screen loses focus (but not during initial navigation)
  useFocusEffect(
    useCallback(() => {
      // Don't clear on focus - only on blur
      return () => {
        // Only clear if we've actually processed a highlight on this screen
        if (hasProcessedHighlight.current) {
          clearHighlight();
          scale.value = 1; // Reset animation
        }
      };
    }, [clearHighlight, scale])
  );

  // Animated style for the card
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Function to scroll to a specific item
  const scrollToItem = useCallback(
    (itemId: string) => {
      if (items.length > 0 && flatListRef.current) {
        const index = items.findIndex(
          (item) => item.id.toString() === itemId
        );
        
        const targetIndex = numColumns > 1 ? Math.floor(index / numColumns) : index;
        // console.log('scrollToItem - itemId:', itemId, 'found index:', index, 'numColumns:', numColumns, 'targetIndex:', targetIndex, 'total items:', items.length);

        if (index !== -1 && index < items.length) {
          // Delay to ensure list is rendered
          setTimeout(() => {
            // When using multiple columns, scrollToIndex expects the row index
            flatListRef.current?.scrollToIndex({
              index: targetIndex,
              animated: true,
              viewPosition,
            });
          }, scrollDelay);

          // Trigger scale animation with Reanimated
          setTimeout(() => {
            // Build animation sequence based on pulse count
            const animationSequence = [];
            for (let i = 0; i < pulseCount; i++) {
              animationSequence.push(
                withTiming(scaleValue, { duration: animationDuration })
              );
              animationSequence.push(
                withTiming(1, { duration: animationDuration })
              );
            }
            scale.value = withSequence(...animationSequence);
            hasProcessedHighlight.current = true;
          }, animationDelay);
        }
      }
    },
    [items, scrollDelay, animationDelay, viewPosition, scaleValue, animationDuration, pulseCount]
  );

  // Auto-scroll when highlightId changes
  useEffect(() => {
    if (highlightId) {
      scrollToItem(highlightId);
    }
  }, [highlightId, scrollToItem]);

  // Check if an item is highlighted
  const isItemHighlighted = useCallback(
    (itemId: number | string) => {
      return highlightId !== null && itemId.toString() === highlightId;
    },
    [highlightId]
  );

  return {
    currentHighlightId: highlightId,
    animatedStyle,
    isItemHighlighted,
    flatListRef,
    scrollToItem,
  };
}
