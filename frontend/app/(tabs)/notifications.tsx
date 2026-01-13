import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Image,
  Linking,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notification';
import theme, { addOpacity, layout } from '@/constants/theme';
import { ThemedText } from '@/components/ThemedText';
import ScreenTitle from '@/components/screenTitle';
import InfoHeaderButton from '@/components/InfoHeaderButton';
import { useOrgas } from '@/contexts/DataContext';
import { useHighlightItem } from '@/hooks/useHighlightItem';
import {getOrganizerImage} from '@/components/organizerImageMapper';

type ViewType = 'notifications' | 'contact';

const ORGA_SIZE = 150; // square size
const ORGA_GAP = 15; // gap/margin around boxes


const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeView, setActiveView] = useState<ViewType>('contact');
  const [refreshing, setRefreshing] = useState(false);

  const { orgas, isLoading: orgasLoading, refetch: refetchOrgas } = useOrgas();
  
  // Use the highlight hook
  const { 
    currentHighlightId, 
    animatedStyle, 
    isItemHighlighted, 
    flatListRef 
  } = useHighlightItem({ 
    items: orgas,
    pulseCount: 2, // Double pulse animation
  });

  // Selected orga for modal
  const [selectedOrga, setSelectedOrga] = useState<any>(null);

  // Responsive grid calculation for orga boxes
  const window = useWindowDimensions();
  const numColumns = Math.max(1, Math.floor((window.width - 32) / (ORGA_SIZE + ORGA_GAP)));

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
      <Modal
        visible={!!selectedOrga}
        transparent
        animationType="none"
        onRequestClose={() => setSelectedOrga(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedOrga(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContainer}>
                <ThemedText style={styles.modalTitle}>{selectedOrga ? `${selectedOrga.firstName} ${selectedOrga.lastName}` : ''}</ThemedText>
                {selectedOrga && selectedOrga.contact ? (
                  <Text style={styles.modalContact}>{selectedOrga.contact}</Text>
                ) : 
                <Text style={styles.modalContact}>Contact non disponible</Text>
                }
                <View style={styles.modalActions}>
                  <Pressable
                    style={selectedOrga?.contact ? styles.modalButton : [styles.modalButton, styles.modalButtonDisabled]}
                    onPress={async () => {
                      if (!selectedOrga || !selectedOrga.contact) return;
                      try {
                        await Linking.openURL(`tel:${selectedOrga.contact}`);
                      } catch (e) {
                        console.error('Unable to open dialer', e);
                      }
                    }}
                  >
                    <Text style={styles.modalButtonText}>Appeler</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.modalCloseButton]}
                    onPress={() => setSelectedOrga(null)}
                  >
                    <Text style={styles.modalButtonText}>Fermer</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>



      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* View switcher */}
        <View style={styles.tabContainer}>

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
        </View>

        {/* Notifications View */}
        {activeView === 'notifications' && (
          <>
            <View style={styles.contactContainer}>
              <ScreenTitle>Notifications</ScreenTitle>
              {notifications && notifications.some(n => !n.read) && (
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
          <View style={{ flex: 1 }}>
            <ScreenTitle style={{  }}>Orgas</ScreenTitle>
            <View style={{ flex: 1 }}>
              <FlatList
                ref={flatListRef}
                data={orgas}
                keyExtractor={(item) => item.id.toString()}
                bounces={false}
                overScrollMode="never"
                numColumns={numColumns}
                // Only set this if more than 1 column to avoid weird single column centering
                columnWrapperStyle={numColumns > 1 ? { justifyContent: 'flex-start' } : undefined}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                  <RefreshControl
                    refreshing={orgasLoading}
                    onRefresh={refetchOrgas}
                    tintColor={theme.background.secondary}
                    title="Actualisation..."
                    titleColor={theme.background.secondary}
                  />
                }
                renderItem={({ item }) => {
                  const isHighlighted = isItemHighlighted(item.id);
                  const organizerName = item.firstName + ' ' + item.lastName;
                  return (
                    <Animated.View style={isHighlighted ? animatedStyle : undefined}>
                      <View style={styles.orgaItemWrapper}>
                        <Pressable
                          onPress={() => setSelectedOrga(item)}
                          style={styles.orgaBox}
                          android_ripple={{ color: addOpacity(theme.background.secondary, 0.12) }}
                          accessibilityRole="button"
                        >
                          {/* <LinearGradient
                            colors={[addOpacity('#ffffff', 0.9), addOpacity('#ffffff', 0.6)]}
                            start={{ x: 0.1, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.orgaGradient}
                          > */}
                            <Image
                              source={getOrganizerImage(organizerName)}
                              style={styles.orgaImage}
                              resizeMode="cover"
                            />
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
                            {item.contact ? (
                              <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="call" size={14} color={theme.interactive.primary} />
                                {/* <ThemedText style={{ color: theme.interactive.primary, marginLeft: 6 }}>{item.contact}</ThemedText> */}
                              </View>
                            ) : null}
                            <ThemedText style={{ marginTop: 6, textAlign: 'center' }}> {item.firstName} {item.lastName}</ThemedText>

                            </View>

                          {/* </LinearGradient> */}
                        </Pressable>
                      </View>
                    </Animated.View>
                  );
                }}
              />
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
    alignItems: 'center',
    paddingBottom: layout.tabBar.contentPadding,
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
  orgaItemWrapper: {
    padding: ORGA_GAP / 2,
  },
  orgaBox: {
    width: ORGA_SIZE,
    height: ORGA_SIZE,
    borderRadius: 8,
    backgroundColor: theme.ui.white,
    borderWidth: 1,
    borderColor: addOpacity(theme.text.secondary, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
    // drop shadow
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  orgaGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  orgaImage: {
    width: ORGA_SIZE * 0.6,
    height: ORGA_SIZE * 0.6,
    borderRadius: 12,
    borderColor: addOpacity(theme.text.primary, 0.2),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.ui.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalContact: {
    fontSize: 16,
    color: theme.text.secondary,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    backgroundColor: theme.interactive.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: addOpacity(theme.interactive.primary, 0.5),

    disabled: true,
  },
  modalButtonText: {
    color: theme.ui.white,
    fontWeight: '700',
  },
  modalCloseButton: {
    backgroundColor: addOpacity(theme.text.secondary, 0.5),
  },

});

export default NotificationsScreen;
