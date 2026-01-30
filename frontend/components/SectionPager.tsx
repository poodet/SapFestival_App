import React, { useEffect, useRef } from 'react';
import { View, FlatList, Dimensions } from 'react-native';
import DayTabView from './DayTabView';

interface Props {
  options: string[];
  // index of selected tab (controlled). If omitted, component is uncontrolled.
  selectedIndex?: number;
  // Called when the page changes (index)
  onIndexChange?: (index: number) => void;
  // Render the content for a given option
  renderSection: (option: string, index: number) => React.ReactElement | null;
  // Disable internal swipe of DayTabView (default true)
  swipeEnabled?: boolean;
}

export default function SectionPager({ options, selectedIndex, onIndexChange, renderSection, swipeEnabled = true }: Props) {
  const { width } = Dimensions.get('window');
  const flatListRef = useRef<FlatList>(null);

  // When parent changes selectedIndex, scroll FlatList
  useEffect(() => {
    if (typeof selectedIndex === 'number' && selectedIndex >= 0 && selectedIndex < options.length) {
      // Jump immediately to the requested index to avoid intermediate view events
      flatListRef.current?.scrollToOffset({ offset: selectedIndex * width, animated: false });
    }
  }, [selectedIndex, width, options.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index ?? 0;
      if (onIndexChange) onIndexChange(idx);
    }
  });

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <View style={{ flex: 1 }}>
      <DayTabView
        options={options}
        value={options[selectedIndex ?? 0]}
        onChange={(v) => {
          const idx = options.indexOf(v);
          if (idx >= 0) {
            // Perform immediate jump to avoid triggering intermediate pages
            flatListRef.current?.scrollToOffset({ offset: idx * width, animated: false });
            if (onIndexChange) onIndexChange(idx);
          }
        }}
        swipeEnabled={false}
        selectedIndex={selectedIndex}
      />

      <FlatList
        ref={flatListRef}
        data={options}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => (
          <View style={{ width, flex: 1 }}>
            {renderSection(item, index)}
          </View>
        )}
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialScrollIndex={selectedIndex ?? 0}
      />
    </View>
  );
}
