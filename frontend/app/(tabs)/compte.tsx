import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  useWindowDimensions,
  Image
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import theme, { layout } from '@/constants/theme';
import InfoHeaderButton from '@/components/InfoHeaderButton';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/ThemedText';

type TabType = 'Profil' | 'Notifications';

const CompteScreen = () => {
  const router = useRouter();
  const { user, logout, isGuest } = useAuth();
  const windowLayout = useWindowDimensions();

  // TabView state
  const TABS: TabType[] = ['Profil', 'Notifications'];
  const [index, setIndex] = useState(0);
  const [routes] = useState(TABS.map((t) => ({ key: t, title: t })));

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  // Handle login
  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const renderCustomTabBar = (props: any) => (
    <TabBar
      {...props}
      style={{ backgroundColor: 'transparent', elevation: 0 }}
      indicatorStyle={{ 
        backgroundColor: theme.interactive.primary, 
        height: 3,
        width: windowLayout.width / 4,
        left: windowLayout.width / 8,
      }}
    />
  );

  // Render Profil section
  const renderProfilSection = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: layout.tabBar.contentPadding }}
    >
      {/* User Info */}
      {user ? (
        <>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
                <Image 
                source={require('@/assets/images/Pins.png')}
                style={{width: 80, height: 80}}
                resizeMode="contain"
                />
            </View>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userRole}>
              {user.role === 'organisateur' && '👑 Organisateur'}
              {user.role === 'benevole' && '🤝 Bénévole'}
              {user.role === 'participant' && '🎉 Participant'}
            </Text>
          </View>

          {/* Account Actions */}
          <View style={styles.actionsContainer}>
            <Pressable style={styles.actionButton}>
              <Ionicons name="settings-outline" size={24} color={theme.text.secondary} />
              <Text style={styles.actionText}>Paramètres</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.text.secondary} />
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Ionicons name="shield-checkmark-outline" size={24} color={theme.text.secondary} />
              <Text style={styles.actionText}>Confidentialité</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.text.secondary} />
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Ionicons name="help-circle-outline" size={24} color={theme.text.secondary} />
              <Text style={styles.actionText}>Aide</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.text.secondary} />
            </Pressable>
          </View>

          {/* Logout Button */}
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </Pressable>
        </>
      ) : isGuest ? (
        <View style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={100} color={theme.text.secondary} />
          <Text style={styles.guestTitle}>Mode Invité</Text>
          <Text style={styles.guestMessage}>
            Connectez-vous pour accéder à toutes les fonctionnalités
          </Text>
          <Pressable style={styles.loginButton} onPress={handleLogin}>
            <Ionicons name="log-in-outline" size={24} color="#fff" />
            <Text style={styles.loginText}>Se connecter</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );

  // Render Notifications section
  const renderNotificationsSection = () => (
    <View style={styles.placeholderContainer}>
      <Ionicons name="notifications-outline" size={80} color={theme.text.secondary} />
      <Text style={styles.placeholderText}>Section en cours de développement</Text>
      <Text style={styles.placeholderSubtext}>
        Vous pourrez bientôt consulter toutes vos notifications ici
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <InfoHeaderButton />

      <TabView
        navigationState={{ index, routes }}
        renderTabBar={renderCustomTabBar}
        renderScene={({ route }) => {
          if (route.key === 'Profil') return renderProfilSection();
          if (route.key === 'Notifications') return renderNotificationsSection();
          return null;
        }}
        onIndexChange={setIndex}
        initialLayout={{ width: windowLayout.width }}
        commonOptions={{
            label: ({ route, labelText, focused, color }) =>  {
            const iconName = route.key === 'Profil' ? 'person' : 'notifications';
            return (
                <View style={{ alignItems: 'center', justifyContent: 'center',   gap: 10, flexDirection: 'row'  }}>
                <Ionicons name={iconName} size={20} color={focused ? theme.text.primary : theme.text.secondary} />
                <ThemedText style={{
                    fontSize: 14, 
                    color: focused ? theme.text.primary : theme.text.secondary
                }}>
                    {labelText}
                </ThemedText>
                </View>
            )
            }
        }}
      />
    </SafeAreaView>
  );
};

export default CompteScreen;

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },

  // Profile section
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: theme.text.secondary,
    marginBottom: 8,
  },
  userRole: {
    fontSize: 16,
    color: theme.interactive.primary,
    fontWeight: '600',
  },

  // Actions
  actionsContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
    // Hide for now because not implemented
    display: 'none',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.interactive.inactive,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: theme.text.secondary,
    fontWeight: '500',
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginHorizontal: 16,
    marginTop: 32,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Guest mode
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  guestMessage: {
    fontSize: 16,
    color: theme.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.interactive.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Notifications placeholder
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    paddingBottom: layout.tabBar.contentPadding,

  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 16,
    color: theme.text.secondary,
    textAlign: 'center',
  },
});
