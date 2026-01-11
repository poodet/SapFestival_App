import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {theme, addOpacity, layout} from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Tab bar appearance
        tabBarActiveTintColor: theme.interactive.primary,
        tabBarInactiveTintColor: theme.interactive.inactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: addOpacity(theme.background.secondary, 0.3),
          borderRadius: 20,
          height: layout.tabBar.height,
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: theme.ui.black,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          marginHorizontal: layout.tabBar.marginHorizontal,
          marginBottom: layout.tabBar.marginBottom,
          position: 'absolute',
          backdropFilter: 'blur(10px)',
        },
        tabBarItemStyle: {
          paddingTop: 5,
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
            <Ionicons name={focused ? 'fast-food-sharp' : 'fast-food-outline'} color={color} size={30} />
          ),
        }}
      />
      <Tabs.Screen
        name="artists"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'mic' : 'mic-outline'} color={color} size={30}/>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} color={color} size={30}/>
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'trophy' : 'trophy-outline'} color={color} size={30}/>
          ),
        }}
      />
      {/*<Tabs.Screen
        name="food"
        options={{
          title: 'Menu',
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'fast-food' : 'fast-food-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Plan',
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} color={color} size={24}/>
          ),
        }}
      />
      */}
      <Tabs.Screen
        name="about"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={30} />
          ),
        }}
      />
    </Tabs>
  );
}
