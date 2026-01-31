import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
import theme, { addOpacity, layout } from '@/constants/theme';
import ScreenTitle from '@/components/screenTitle';
import InfoHeaderButton from '@/components/InfoHeaderButton';
import { useAuth } from '@/contexts/AuthContext';
import { useHighlight } from '@/contexts/HighlightContext';
// Import existing components
import CovoiturageList from '@/components/CovoiturageList';
import ContactList from '@/components/ContactList';
import ThemedText from '@/components/ThemedText';
import InfosSection from '@/components/InfosSection';

type SectionType = 'covoit' | 'contact' | 'infos';

const PratiqueScreen = () => {
  const router = useRouter();
  const { user, logout, isGuest } = useAuth();
  const { highlightId } = useHighlight();
  const windowLayout = useWindowDimensions();

  // TabView state
  const TABS: SectionType[] = ['covoit', 'contact', 'infos'];
  const [index, setIndex] = useState(0);
  const [routes] = useState(TABS.map((t) => ({ key: t, title: t })));

  // Auto-switch to contact tab when there's a highlight
  useEffect(() => {
    if (highlightId) {
      const contactIndex = TABS.indexOf('contact');
      if (contactIndex >= 0) setIndex(contactIndex);
    }
  }, [highlightId]);

  // Fonts for info section
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });


  const renderCustomTabBar = (props: any) => (
    <TabBar
      {...props}
      style={{ backgroundColor: 'transparent', elevation: 0 }}
      indicatorStyle={{ 
        backgroundColor: theme.interactive.primary, 
        height: 3 ,
        width: windowLayout.width / 6,
        left: windowLayout.width / 12,
      }}

    />
  );

  return(
      <SafeAreaView style={styles.safeAreaViewContainer}>
        {/* <ScreenTitle>PRATIQUE</ScreenTitle> */}

      <TabView
        navigationState={{ index, routes }}
        renderTabBar={renderCustomTabBar}
        renderScene={({ route }) => {
          if (route.key === 'covoit') return <CovoiturageList />;
          if (route.key === 'contact') return <ContactList />;
          if (route.key === 'infos') return  <InfosSection />;
          return null;
        }}
        onIndexChange={setIndex}
        initialLayout={{ width: windowLayout.width }}
        // lazy={true}
        // lazyPreloadDistance={0}
        // renderLazyPlaceholder={() => null}
        commonOptions={{
        label: ({ route, labelText, focused, color }) => {
            const iconName = route.key === 'covoit' ? 'car' : route.key === 'contact' ? 'people' : 'information-circle';
            return (
            <View style={{ alignItems: 'center', justifyContent: 'center',  gap: 10, flexDirection: 'row' }}>
                <Ionicons name={iconName} size={20} color={focused ? theme.text.primary : theme.text.secondary} />
                <ThemedText style={{
                    fontSize: 14, 
                    color: focused ? theme.text.primary : theme.text.secondary
                }}>
                {labelText}
                </ThemedText>
            </View>
        )}
                }}
      />
    </SafeAreaView>
  );
};

export default PratiqueScreen;

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },


  // Section selector
  sectionSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: addOpacity(theme.background.secondary, 0.5),
    alignSelf: 'center',
    borderRadius: 20,
  },
  sectionButton: {
    flexDirection: 'row',
    marginHorizontal: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
    alignItems: 'center',
  },
  sectionButtonActive: {
    backgroundColor: theme.interactive.primary,
  },
  sectionButtonText: {
    fontSize: 14,
    // fontWeight: '600',
    color: theme.text.secondary,
  },
  sectionButtonTextActive: {
    color: theme.text.primary,
  },

  // Infos section
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  logoutText: {
    color: theme.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.interactive.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  loginText: {
    color: theme.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: theme.background.secondary,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d1d1d',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: theme.background.dark,
    lineHeight: 24,
  },
  mapImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
});
