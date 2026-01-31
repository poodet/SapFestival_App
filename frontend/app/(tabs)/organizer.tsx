import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, useWindowDimensions } from 'react-native';
import * as Font from 'expo-font';
import { TabView, TabBar } from 'react-native-tab-view';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenTitle from '@/components/screenTitle';
import InfoHeaderButton from '@/components/InfoHeaderButton';
import { PermsView } from '@/components/calendar/PermsView';
import { LogistiqueView } from '@/components/calendar/LogistiqueView';
import { PermModal } from '@/components/calendar/PermModal';
import { useFestivalData } from '@/contexts/DataContext';
import { usePermCalendar, useDayEvents } from '@/hooks/useCalendar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import theme, { addOpacity } from '@/constants/theme';
import { ThemedText } from '@/components/ThemedText';

const DAYS = ['Vendredi', 'Samedi'];

type TabType = 'Perms' | 'Logistique';

export default function OrganizerScreen() {
  const [loaded, error] = Font.useFonts({
    'Oliver-Regular': require('../../assets/fonts/Oliver-Regular.otf'),
  });

  const { perms, isLoading } = useFestivalData();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'organisateur') {
      router.replace('/(tabs)/calendar');
    }
  }, [user]);

  const [selectedDay, setSelectedDay] = useState('Vendredi');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Use the centralized calendar service to transform perms data
  const permsByDay = usePermCalendar(perms, {
    allowedDays: DAYS,
    sortByTime: true,
  });

  const eventsPerms = useDayEvents(permsByDay, selectedDay);

  const minHour = selectedDay === 'Vendredi' ? 17 : 10;
  const maxHour = 30;
  const timeSlots = [];
  for (let hour = minHour; hour < maxHour; hour++) {
    const displayHour = hour % 24;
    timeSlots.push(`${displayHour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${displayHour.toString().padStart(2, '0')}:30`);
  }
  timeSlots.push(`${(6).toString().padStart(2, '0')}:00`);

  const userName = user ? `${user.firstName} ${user.lastName}` : '';

  const openPermDetails = (permEvent: any) => {
    setSelectedEvent(permEvent);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  const TABS: TabType[] = ['Perms', 'Logistique'];
  const windowLayout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState(TABS.map((t) => ({ key: t, title: t })));
  const [allowTabSwipe, setAllowTabSwipe] = useState(true);

  const renderCustomTabBar = (props: any) => {
    // const totalWidth = Dimensions.get("screen").width;
    // Get if props is selected
    
    return (
      <TabBar
        {...props}
        style={{ 
            backgroundColor: 'transparent', 
            elevation: 0 ,
            // backgroundColor: addOpacity(theme.background.secondary, 0.5),
        }}
        indicatorStyle={{ 
            backgroundColor: theme.interactive.primary, 
            height: 3 ,
            width: windowLayout.width / 4,
            left: windowLayout.width / 8,
        }}
      />
    );
  };

  if (!loaded) {
    return (
      <SafeAreaView style={styles.safeAreaViewContainer}>
        <InfoHeaderButton />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText style={{ fontFamily: theme.fonts.themed, color: theme.text.primary }}>
            Chargement des polices...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      {/* <ScreenTitle>ORGA</ScreenTitle> */}
      <InfoHeaderButton />

      <TabView
        navigationState={{ index, routes }}
        renderTabBar={renderCustomTabBar}
        renderScene={({ route }) => {
          const option = route.key as TabType;
          if (option === 'Perms') {
            return (
              <PermsView
                eventsPerms={eventsPerms}
                selectedDay={selectedDay}
                days={DAYS}
                minHour={minHour}
                timeSlots={timeSlots}
                userName={userName}
                onDaySelect={setSelectedDay}
                onPermPress={openPermDetails}
                onCalendarScrollEnabledChange={setAllowTabSwipe}
              />
            );
          }
          if (option === 'Logistique') {
            return <LogistiqueView />;
          }
          return null;
        }}
        onIndexChange={setIndex}
        initialLayout={{ width: windowLayout.width }}
        swipeEnabled={allowTabSwipe}
        commonOptions={{
        label: ({ route, labelText, focused, color }) => {
            const iconName = route.key === 'Perms' ? 'people' : 'hammer';
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

      {/* Perm Details Modal */}
      <PermModal visible={modalVisible} selectedEvent={selectedEvent} onClose={closeModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
});
