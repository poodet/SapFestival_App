import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  RefreshControl,
  useWindowDimensions,
  Image,
  Linking,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import theme, { addOpacity, layout } from '@/constants/theme';
import { ThemedText } from '@/components/ThemedText';
import { useOrgas } from '@/contexts/DataContext';
import { useHighlightItem } from '@/hooks/useHighlightItem';
import { getOrganizerImage } from '@/components/organizerImageMapper';

const ORGA_SIZE = 150;
const ORGA_GAP = 15;

interface ContactListProps {
  hideHeader?: boolean;
}

export default function ContactList({ hideHeader = false }: ContactListProps) {
  const { orgas, isLoading: orgasLoading, refetch: refetchOrgas } = useOrgas();
  const window = useWindowDimensions();
  const numColumns = Math.max(1, Math.floor((window.width - 32) / (ORGA_SIZE + ORGA_GAP)));
  
  const {
    currentHighlightId,
    animatedStyle,
    isItemHighlighted,
    flatListRef,
  } = useHighlightItem({
    items: orgas,
    pulseCount: 2,
    numColumns,
  });

  const [selectedOrga, setSelectedOrga] = useState<any>(null);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={orgas}
        keyExtractor={(item) => item.id.toString()}
        bounces={false}
        overScrollMode="never"
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { justifyContent: 'flex-start' } : undefined}
        contentContainerStyle={styles.listContainer}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            const target = numColumns > 1 ? Math.floor(info.index / numColumns) : info.index;
            flatListRef.current?.scrollToIndex({
              index: target,
              animated: true,
              viewPosition: 0.2,
            });
          });
        }}
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
                  style={[
                    styles.orgaBox,
                    isHighlighted && styles.highlightedOrgaBox,
                  ]}
                  android_ripple={{ color: addOpacity(theme.background.secondary, 0.12) }}
                  accessibilityRole="button"
                >
                  <Image
                    source={getOrganizerImage(organizerName)}
                    style={styles.orgaImage}
                    resizeMode="cover"
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    {item.contact ? (
                      <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="call" size={14} color={theme.interactive.primary} />
                      </View>
                    ) : null}
                    <ThemedText style={{ marginTop: 6, textAlign: 'center' }}>
                      {' '}{item.firstName} {item.lastName}
                    </ThemedText>
                  </View>
                </Pressable>
              </View>
            </Animated.View>
          );
        }}
      />

      {/* Orga Detail Modal */}
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
                <ThemedText style={styles.modalTitle}>
                  {selectedOrga ? `${selectedOrga.firstName} ${selectedOrga.lastName}` : ''}
                </ThemedText>
                {selectedOrga && selectedOrga.contact ? (
                  <Text style={styles.modalContact}>{selectedOrga.contact}</Text>
                ) : (
                  <Text style={styles.modalContact}>Contact non disponible</Text>
                )}
                <View style={styles.modalActions}>
                  <Pressable
                    style={
                      selectedOrga?.contact
                        ? styles.modalButton
                        : [styles.modalButton, styles.modalButtonDisabled]
                    }
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  // TODO - remove unused styles
  // tabContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   padding: 8,
  //   marginTop: 10,
  //   marginBottom: 10,
  //   backgroundColor: addOpacity(theme.background.secondary, 0.5),
  //   alignSelf: 'center',
  //   borderRadius: 20,
  // },
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
    marginTop: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  highlightedOrgaBox: {
    borderWidth: 3,
    borderColor: theme.interactive.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  orgaName: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 12,
    flexShrink: 1,
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


