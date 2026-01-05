import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

// import { useNavigation } from '@react-navigation/native';

export default function TabLayout() {

  // const navigation = useNavigation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#5a9adb',
        tabBarShowLabel: false,
        headerStyle: {
          // backgroundColor: '#5a9adb',
        },
        headerShown: false,
        headerShadowVisible: false,
        headerTintColor: '#F2784B',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#F9F2EA',  // ou la couleur de ton thème
          borderRadius: 20,
          height: 70,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderTopWidth: 0, // supprimer la ligne de séparation par défaut
        },
        tabBarItemStyle: {
          // flex: 1,
          justifyContent: 'center', // Centre verticalement
          alignItems: 'center', // Centre horizontalement
          paddingTop: 5, // Décale l'icône vers le haut pour éviter le rognage en bas
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
