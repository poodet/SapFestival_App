import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import theme from '@/constants/theme';

interface PermModalProps {
  visible: boolean;
  selectedEvent: any;
  onClose: () => void;
}

export const PermModal: React.FC<PermModalProps> = ({ visible, selectedEvent, onClose }) => {
  if (!selectedEvent || selectedEvent.category !== 'perm') {
    return null;
  }

  return (
    <Modal animationType="none" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Pressable onPress={onClose} style={styles.closeIconButton}>
            <Ionicons name="close" size={28} color={theme.text.secondary} />
          </Pressable>
          <View style={{ alignItems: 'end', marginBottom: 15, flexDirection: 'row' }}>
            <Ionicons 
              name={selectedEvent.icon || 'help-circle-outline'} 
              size={48} 
              color={selectedEvent.bgColor} 
            />
            <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
          </View>
          <View style={styles.modalSection}>
            <Text style={{fontWeight: 'bold'}} > {selectedEvent.metadata?.perm || selectedEvent.metadata?.pole} - </Text>
            <Text>
              {selectedEvent.startTime} - {selectedEvent.endTime}
            </Text>
            <Text>, {selectedEvent.metadata?.organizer || 'Orga non spécifié'}</Text>
          </View>
        </View>
      </View>
    </Modal>
  ); 
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: theme.ui.white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeIconButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 5,
  },
  modalSection: {
    width: '100%',
    marginBottom: 15,
    flexDirection: 'row', 
    display: 'flow',
  },
});
