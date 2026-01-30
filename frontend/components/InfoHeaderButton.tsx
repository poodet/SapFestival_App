import React from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@/constants/theme';

const BUTTON_SIZE = 40;

export default function InfoHeaderButton() {
  const router = useRouter();
  // TODO - delete, replace by pratique / info and account buttons
  return (<></>)
  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.button} 
        onPress={() => router.push('/info')}
      >
        {/* <Ionicons name="information-circle" size={28} color={theme.interactive.primary} /> */}
        <Image 
            source={require('@/assets/images/Pins.png')} 
            style={{
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
            }}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 1000,
  },
  button: {
    backgroundColor: theme.ui.white,
    borderRadius: 25,
    width: BUTTON_SIZE +2,
    height: BUTTON_SIZE + 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.ui.black,
    // shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
