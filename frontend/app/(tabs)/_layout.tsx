import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text, StyleSheet } from 'react-native';
import {theme, addOpacity, layout} from '@/constants/theme';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Tab bar appearance
        tabBarActiveTintColor: theme.interactive.primary,
        tabBarInactiveTintColor: theme.interactive.inactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderRadius: 20,
          height: layout.tabBar.height,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: theme.ui.black,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          marginHorizontal: layout.tabBar.marginHorizontal,
          marginBottom: layout.tabBar.marginBottom,
          position: 'absolute',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={60}
            tint="white"
            style={{
              flex: 1,
              backgroundColor: addOpacity(theme.background.secondary, 0.7),
              borderRadius: 20,
              overflow: 'hidden',
            }}
          />
        ),
        tabBarItemStyle: {
          paddingVertical: 10,
        },
        
        // Screen appearance
        headerShown: false,
        headerShadowVisible: false,
        sceneContainerStyle: {
          backgroundColor: theme.background.primary,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null, // 👈 Cache l'onglet
        }}
      />
      <Tabs.Screen
        name="b2b"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <>
              <Ionicons 
              name={ 'fast-food-sharp'} 
              color={focused ? theme.interactive.primary : color} 
              size={30} 
              />
              <Text style= {styles.badgeText}>Menu</Text>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="artists"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <>
              <Ionicons name={'musical-notes'} color={focused ? theme.interactive.primary : color} size={30}/>
              <Text style= {styles.badgeText}>Artistes</Text>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <>
              <Ionicons name={'trophy'} color={focused ? theme.interactive.primary : color} size={30}  />
            <Text style= {styles.badgeText}>Activités</Text>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <>
            <Ionicons name={'calendar'} color={focused ? theme.interactive.primary : color} size={30} fontWeight="bold"/>
              <Text style= {styles.badgeText}>Calendrier</Text>
            </>

          ),
        }}
      />

      <Tabs.Screen
        name="contacts"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <>
              <Ionicons name={'people'} color={focused ? theme.interactive.primary : color} size={30} />
              <Text style= {styles.badgeText}>Contact</Text>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="cars"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <>
              <Ionicons name={'car'} color={focused ? theme.interactive.primary : color} size={30} />
              <Text style= {styles.badgeText}>Covoit</Text>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          href: null, // Hidden - now accessible via header button
        }}
      />
    </Tabs>
  );
}

 

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.ui.white,
  },
  badgeText: {
    color: theme.ui.grey,
    fontSize: 11,
    // fontWeight: '700',
  },
});     
