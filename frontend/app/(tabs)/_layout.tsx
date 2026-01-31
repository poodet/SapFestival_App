import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import {theme, addOpacity, layout} from '@/constants/theme';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  const { user, loading, isGuest } = useAuth();

  return (
    <Tabs
      screenOptions={{
        // Tab bar appearance
        tabBarActiveTintColor: theme.interactive.primary,
        tabBarInactiveTintColor: theme.interactive.inactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          // borderRadius: 20,
          height: layout.tabBar.height,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: theme.ui.black,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          // marginHorizontal: layout.tabBar.marginHorizontal,
          // marginBottom: layout.tabBar.marginBottom,
          position: 'absolute',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={60}
            tint="white"
            style={{
              flex: 1,
              backgroundColor: addOpacity(theme.background.secondary, 0.7),
              // borderRadius: 20,
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
        name="pratique"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <>
              <Ionicons name={'information-circle'} color={focused ? theme.interactive.primary : color} size={30} />
              <Text style= {styles.badgeText}>Pratique</Text>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="programme"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <>
              <Ionicons 
              name={'list'} 
              color={focused ? theme.interactive.primary : color} 
              size={30} 
              />
              <Text style= {styles.badgeText}>Programme</Text>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="b2b"
        options={{
          href: null, // Hidden - now in programme tab
        }}
      />
      <Tabs.Screen
        name="artists"
        options={{
          href: null, // Hidden - now in programme tab
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          href: null, // Hidden - now in programme tab
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <>
            <Ionicons name={'calendar'} color={focused ? theme.interactive.primary : color} size={30} fontWeight="bold"/>
              <Text style= {styles.badgeText}>Horaires</Text>
            </>

          ),
        }}
      />


      <Tabs.Screen
        name="contacts"
        options={{
          href: null, // Hidden - now in pratique tab
        }}
      />
      <Tabs.Screen
        name="cars"
        options={{
          href: null, // Hidden - now in pratique tab
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          href: null, // Hidden - now in pratique tab (infos section)
        }}
      />
      {/** Organizer route always present but hide its tab button for non-organizers */}
      <Tabs.Screen
        name="organizer"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <>
              <Ionicons name={'star'} color={focused ? theme.interactive.primary : color} size={30} />
              <Text style={styles.badgeText}>Orga</Text>
            </>
          ),
          href: user?.role === 'organisateur' ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="compte"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <>
              <Ionicons name={'person'} color={focused ? theme.interactive.primary : color} size={30} />
              <Text style={styles.badgeText}>Compte</Text>
            </>
          ),
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
