import React, { useState } from 'react';
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface FullScreenImageModalProps {
  buttonText: string; // Texte du bouton
  imageSource: any; // Source de l'image
}

export default function FullScreenImageModal({ buttonText, imageSource }: FullScreenImageModalProps) {  
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleMenuPress = () => {
    setIsModalVisible(true); 
  };

  const handleCloseModal = () => {
    setIsModalVisible(false); 
  };

  return (
    <View>
      <TouchableOpacity style={styles.cardButton} onPress={handleMenuPress}>
        <Text style={styles.cardButtonText}>{buttonText}</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal} // For Android
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>

          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardButton: {
    backgroundColor: '#F2784B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Background half-transparent
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  image: {
    width: '90%',
    height: '80%',
  },
});
