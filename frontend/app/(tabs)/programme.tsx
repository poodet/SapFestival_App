import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, SafeAreaView, View, FlatList, Dimensions } from 'react-native';
import * as Font from 'expo-font';
import ScreenTitle from '@/components/screenTitle';
import InfoHeaderButton from '@/components/InfoHeaderButton';
import SectionPager from '@/components/SectionPager';
import ArtistsList from '@/components/ArtistsList';
import MenuList from '@/components/MenuList';
import ActivitiesList from '@/components/ActivitiesList';
import { theme } from '@/constants/theme';
import { useHighlight } from '@/contexts/HighlightContext';
import { useArtists, useActivities, useMenuItems } from '@/contexts/DataContext';

type SectionType = 'Menu' | 'Artistes' | 'Activités';

export default function ProgrammeScreen() {
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });

  const [activeSection, setActiveSection] = useState<SectionType>('Artistes');
  const { highlightId, highlightCategory } = useHighlight();
  
  // Get data to determine which section a highlighted item belongs to
  const { artists } = useArtists();
  const { activities } = useActivities();
  const { menuItems } = useMenuItems();

  // Ref to track current section for swipe gesture
  const activeSectionRef = useRef(activeSection);
  useEffect(() => { activeSectionRef.current = activeSection; }, [activeSection]);

  // Auto-switch to the correct section when an item is highlighted
  useEffect(() => {
    if (highlightId && highlightCategory) {
      // Use category to determine which section to show
      if (highlightCategory === 'artist') {
        setActiveSection('Artistes');
      } else if (highlightCategory === 'activity') {
        setActiveSection('Activités');
      } else if (highlightCategory === 'meal' || highlightCategory === 'drink') {
        setActiveSection('Menu');
      }
    }
  }, [highlightId, highlightCategory]);

  const SECTIONS: SectionType[] = ['Menu', 'Artistes', 'Activités'];

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScreenTitle>PROGRAMME</ScreenTitle>
      <InfoHeaderButton />
      
      <SectionPager
        options={SECTIONS}
        selectedIndex={SECTIONS.indexOf(activeSection)}
        onIndexChange={(idx) => setActiveSection(SECTIONS[idx])}
        renderSection={(option) => {
          if (option === 'Menu') return <MenuList />;
          if (option === 'Artistes') return <ArtistsList />;
          if (option === 'Activités') return <ActivitiesList />;
          return null;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contentContainer: {
    flex: 1,
  },
});
