import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notification';
import theme, { addOpacity } from '@/constants/theme';
import { ThemedText } from '@/components/ThemedText';
import ScreenTitle from '@/components/screenTitle';
import InfoHeaderButton from '@/components/InfoHeaderButton';

type ViewType = 'notifications' | 'contact';

const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeView, setActiveView] = useState<ViewType>('notifications');
  const [refreshing, setRefreshing] = useState(false);
  
  // Use notification context
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

//   } = useNotifications();

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  // Mark notification as read when tapped
  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'perm_starting':
      case 'perm_reminder':
        return 'time-outline';
      case 'artist_starting':
        return 'musical-notes';
      case 'activity_starting':
        return 'trophy';
      case 'schedule_change':
        return 'calendar';
      case 'emergency':
        return 'alert-circle';
      default:
        return 'notifications';
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <Pressable
      onPress={() => handleNotificationPress(item)}
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
      ]}
    >
      <View style={styles.notificationIcon}>
        <Ionicons
          name={getNotificationIcon(item.type) as any}
          size={24}
          color={item.read ? theme.text.secondary : theme.interactive.primary}
        />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <ThemedText style={styles.notificationTitle}>
            {item.title}
          </ThemedText>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{formatTimestamp(item.timestamp)}</Text>
      </View>
    </Pressable>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off-outline" size={64} color={theme.text.secondary} />
      <ThemedText style={styles.emptyText}>Aucune notification</ThemedText>
      <Text style={styles.emptySubtext}>
        Vous recevrez ici les notifications du festival
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <InfoHeaderButton />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* View switcher */}
        <View style={styles.tabContainer}>
          <Pressable
            onPress={() => setActiveView('notifications')}
            style={[
              styles.tabButton,
              {
                backgroundColor:
                  activeView === 'notifications' ? theme.interactive.primary : 'transparent',
              },
            ]}
          >
            <ThemedText
              style={{
                color:
                  activeView === 'notifications' ? theme.ui.white : theme.text.secondary,
                fontSize: 16,
              }}
            >
              Notifications
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveView('contact')}
            style={[
              styles.tabButton,
              {
                backgroundColor:
                  activeView === 'contact' ? theme.interactive.primary : 'transparent',
              },
            ]}
          >
            <ThemedText
              style={{
                color: activeView === 'contact' ? theme.ui.white : theme.text.secondary,
                fontSize: 16,
              }}
            >
              Contact
            </ThemedText>
          </Pressable>
        </View>

        {/* Notifications View */}
        {activeView === 'notifications' && (
          <>
            <View style={styles.header}>
              <ScreenTitle>Notifications</ScreenTitle>
              {notifications.some(n => !n.read) && (
                <Pressable onPress={handleMarkAllAsRead} style={styles.markAllButton}>
                  <Text style={styles.markAllText}>Tout marquer comme lu</Text>
                </Pressable>
              )}
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.interactive.primary} />
              </View>
            ) : (
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyState}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            )}
          </>
        )}

        {/* Contact View */}
        {activeView === 'contact' && (
          <View style={styles.contactContainer}>
            <ScreenTitle style={{ marginBottom: 20 }}>Contact</ScreenTitle>
            <View style={styles.contactCard}>
              <Ionicons name="mail-outline" size={32} color={theme.interactive.primary} />
              <ThemedText style={styles.contactTitle}>Email</ThemedText>
              <Text style={styles.contactInfo}>contact@sapfestival.fr</Text>
            </View>
            <View style={styles.contactCard}>
              <Ionicons name="call-outline" size={32} color={theme.interactive.primary} />
              <ThemedText style={styles.contactTitle}>Téléphone</ThemedText>
              <Text style={styles.contactInfo}>+33 6 XX XX XX XX</Text>
            </View>
            <View style={styles.contactCard}>
              <Ionicons name="people-outline" size={32} color={theme.interactive.primary} />
              <ThemedText style={styles.contactTitle}>Équipe</ThemedText>
              <Text style={styles.contactInfo}>
                Pour toute question, contactez l'équipe d'organisation
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: addOpacity(theme.background.secondary, 0.5),
    alignSelf: 'center',
    borderRadius: 20,
  },
  tabButton: {
    marginHorizontal: 2,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: addOpacity(theme.interactive.primary, 0.1),
    borderRadius: 8,
  },
  markAllText: {
    color: theme.interactive.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: theme.ui.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: addOpacity(theme.text.secondary, 0.1),
  },
  unreadNotification: {
    backgroundColor: addOpacity(theme.interactive.primary, 0.05),
    borderColor: addOpacity(theme.interactive.primary, 0.2),
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: addOpacity(theme.background.secondary, 0.3),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.interactive.primary,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: addOpacity(theme.text.secondary, 0.6),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  contactContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  contactCard: {
    backgroundColor: theme.ui.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: addOpacity(theme.text.secondary, 0.1),
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
