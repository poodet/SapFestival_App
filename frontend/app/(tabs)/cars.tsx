import React, { useState, useMemo } from 'react';
import { 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity, 
  Pressable,
  TextInput,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Dimensions,
  Platform,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import Animated from 'react-native-reanimated';
import ScreenTitle from '@/components/screenTitle';
import InfoHeaderButton from '@/components/InfoHeaderButton';
import { useCovoiturage } from '@/contexts/DataContext';
import { useCovoiturageActions } from '@/contexts/CovoiturageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Covoiturage } from '@/types/data';
import { theme, layout } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type TripType = 'aller' | 'retour';

export default function CarsScreen() {
  const { covoiturage, isLoading, isRefreshing, refetch } = useCovoiturage();
  const { createCovoiturage, updateCovoiturage, deleteCovoiturage } = useCovoiturageActions();
  const { user } = useAuth();
  const [selectedTripType, setSelectedTripType] = useState<TripType>('aller');
  const [searchText, setSearchText] = useState('');
  
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCovoiturage, setEditingCovoiturage] = useState<Covoiturage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [formTripType, setFormTripType] = useState<TripType>('aller');
  const [conductorName, setConductorName] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [departureLocation, setDepartureLocation] = useState('');
  const [arrivalLocation, setArrivalLocation] = useState('');
  const [departureDay, setDepartureDay] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  // Format date from Date object to DD/MM format
  const formatDate = (date: Date | string | any): string => {
    try {
      let dateObj: Date;
      if (date instanceof Date) {
        dateObj = date;
      } else if (date?.toDate && typeof date.toDate === 'function') {
        // Handle Firestore Timestamp
        dateObj = date.toDate();
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        return String(date);
      }
      const day = ('0' + dateObj.getDate()).slice(-2);
      const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
      return `${day}/${month}`;
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return String(date);
    }
  };

  // Format time from Date object to HH:mm format
  const formatTime = (date: Date | string | any): string => {
    try {
      let dateObj: Date;
      if (date instanceof Date) {
        dateObj = date;
      } else if (date?.toDate && typeof date.toDate === 'function') {
        // Handle Firestore Timestamp
        dateObj = date.toDate();
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        return String(date);
      }
      const hours = ('0' + dateObj.getHours()).slice(-2);
      const minutes = ('0' + dateObj.getMinutes()).slice(-2);
      return `${hours}h${minutes}`;
    } catch (error) {
      console.error('Error formatting time:', error, date);
      return String(date);
    }
  };

  // Filter trips based on trip type and search text
  const filteredTrips = useMemo(() => {
    //handle case where covoiturage is undefined
    if (!covoiturage) return [];
    let filtered = covoiturage.filter((trip: Covoiturage) => trip.tripType === selectedTripType);

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((trip: Covoiturage) => {
        const searchableText = [
          trip.conductorName,
          trip.departureLocation,
          trip.arrivalLocation,
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(searchLower);
      });
    }

    return filtered;
  }, [covoiturage, selectedTripType, searchText]);

  // Reset form
  const resetForm = () => {
    setFormTripType('aller');
    setConductorName('');
    setTotalSeats('');
    setDepartureLocation('');
    setArrivalLocation('');
    setDepartureDay('');
    setDepartureTime('');
    setContactInfo('');
    setIsEditMode(false);
    setEditingCovoiturage(null);
  };

  // Open edit modal with pre-filled data
  const handleOpenEdit = (covoiturage: Covoiturage) => {
    let dateObj: Date;
    const date = covoiturage.departureDate;
    
    // Handle different date types
    if (date instanceof Date) {
      dateObj = date;
    } else if (date?.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      dateObj = new Date();
    }
    
    setIsEditMode(true);
    setEditingCovoiturage(covoiturage);
    setFormTripType(covoiturage.tripType);
    setConductorName(covoiturage.conductorName);
    setTotalSeats(String(covoiturage.totalSeats));
    setDepartureLocation(covoiturage.departureLocation);
    setArrivalLocation(covoiturage.arrivalLocation);
    
    // Format date as DD/MM/YYYY
    const day = ('0' + dateObj.getDate()).slice(-2);
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const year = dateObj.getFullYear();
    setDepartureDay(`${day}/${month}/${year}`);
    
    // Format time as HH:MM
    const hours = ('0' + dateObj.getHours()).slice(-2);
    const minutes = ('0' + dateObj.getMinutes()).slice(-2);
    setDepartureTime(`${hours}:${minutes}`);
    
    setContactInfo(covoiturage.contactInfo);
    setIsModalVisible(true);
  };

  // Handle create covoiturage
  const handleCreate = async () => {
    // Validation
    if (!conductorName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le nom du conducteur');
      return;
    }
    if (!totalSeats || parseInt(totalSeats) <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un nombre de places valide');
      return;
    }
    if (!departureLocation.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le lieu de départ');
      return;
    }
    if (!arrivalLocation.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le lieu d\'arrivée');
      return;
    }
    if (!departureDay.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir la date de départ');
      return;
    }
    if (!departureTime.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir l\'heure de départ');
      return;
    }

    setIsCreating(true);
    try {
      // Parse date and time to create Date object
      const [day, month, year] = departureDay.split('/');
      const [hours, minutes] = departureTime.split(':');
      const departureDate = new Date(
        parseInt(year || new Date().getFullYear().toString()),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );
      
      await createCovoiturage({
        conductorName: conductorName.trim(),
        totalSeats: parseInt(totalSeats),
        reservedSeats: 0,
        departureDate,
        departureLocation: departureLocation.trim(),
        arrivalLocation: arrivalLocation.trim(),
        tripType: formTripType,
        contactInfo: contactInfo.trim(),
      });

      Alert.alert('Succès', 'Covoiturage créé avec succès');
      setIsModalVisible(false);
      resetForm();
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Error creating covoiturage:', error);
      Alert.alert('Erreur', 'Impossible de créer le covoiturage');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle update covoiturage
  const handleUpdate = async () => {
    if (!editingCovoiturage) return;

    // Validation
    if (!conductorName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le nom du conducteur');
      return;
    }
    if (!totalSeats || parseInt(totalSeats) <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un nombre de places valide');
      return;
    }
    if (!departureLocation.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le lieu de départ');
      return;
    }
    if (!arrivalLocation.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le lieu d\'arrivée');
      return;
    }
    if (!departureDay.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir la date de départ');
      return;
    }
    if (!departureTime.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir l\'heure de départ');
      return;
    }

    setIsCreating(true);
    try {
      // Parse date and time to create Date object
      const [day, month, year] = departureDay.split('/');
      const [hours, minutes] = departureTime.split(':');
      const departureDate = new Date(
        parseInt(year || new Date().getFullYear().toString()),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );
      
      await updateCovoiturage(editingCovoiturage.id, {
        conductorName: conductorName.trim(),
        totalSeats: parseInt(totalSeats),
        reservedSeats: editingCovoiturage.reservedSeats, // Keep existing reservations
        departureDate,
        departureLocation: departureLocation.trim(),
        arrivalLocation: arrivalLocation.trim(),
        tripType: formTripType,
        contactInfo: contactInfo.trim(),
      });

      Alert.alert('Succès', 'Covoiturage modifié avec succès');
      setIsModalVisible(false);
      resetForm();
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Error updating covoiturage:', error);
      Alert.alert('Erreur', 'Impossible de modifier le covoiturage');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle delete covoiturage
  const handleDelete = async () => {
    if (!editingCovoiturage) return;

    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce covoiturage ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsCreating(true);
            try {
              await deleteCovoiturage(editingCovoiturage.id);
              Alert.alert('Succès', 'Covoiturage supprimé avec succès');
              setIsModalVisible(false);
              resetForm();
              refetch();
            } catch (error) {
              console.error('Error deleting covoiturage:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le covoiturage');
            } finally {
              setIsCreating(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaViewContainer}>
        <ScreenTitle>COVOIT</ScreenTitle>
        <InfoHeaderButton />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={theme.background.secondary} />
          <Text style={{ color: theme.background.secondary, marginTop: 20 }}>
            Chargement des covoiturages...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScreenTitle>COVOIT</ScreenTitle>
      <InfoHeaderButton />
      <View style={styles.container}>
        {/* Filter Bar */}
        <View style={styles.filterBar}>
          {/* Trip Type Buttons */}
          <View style={styles.tripTypeButtons}>
            <Pressable
              onPress={() => setSelectedTripType('aller')}
              style={[
                styles.tripButton,
                selectedTripType === 'aller' && styles.tripButtonActive,
              ]}
            >
              <ThemedText
                style={[
                  styles.tripButtonText,
                  selectedTripType === 'aller' && styles.tripButtonTextActive,
                ]}
              >
                Aller
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setSelectedTripType('retour')}
              style={[
                styles.tripButton,
                selectedTripType === 'retour' && styles.tripButtonActive,
              ]}
            >
              <ThemedText
                style={[
                  styles.tripButtonText,
                  selectedTripType === 'retour' && styles.tripButtonTextActive,
                ]}
              >
                Retour
              </ThemedText>
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={theme.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor="grey"
              value={searchText}
              onChangeText={setSearchText}
              numberOfLines={1}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color={theme.text.secondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Trip List */}
        <FlatList
          data={filteredTrips}
          keyExtractor={(item: Covoiturage) => item.id.toString()}
          bounces={false}
          overScrollMode="never"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refetch}
              tintColor={theme.background.secondary}
              title="Actualisation..."
              titleColor={theme.background.secondary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={64} color={theme.text.secondary} />
              <ThemedText style={styles.emptyText}>
                Aucun covoiturage disponible
              </ThemedText>
            </View>
          }
          renderItem={({ item }: { item: Covoiturage }) => {
            const availableSeats = item.totalSeats - item.reservedSeats;
            const displayLocation = selectedTripType === 'aller' 
              ? item.departureLocation 
              : item.arrivalLocation;
            const isUserCovoiturage = user && item.userId === user.id;

            return (
              <View style={styles.card}>
                {/* Conductor Name with Edit Button */}
                <View style={[styles.cardRow, { justifyContent: 'space-between' }]}>
                  <View style={[styles.cardRow, { flex: 1 }]}>
                    <Ionicons name="person" size={20} color={theme.interactive.primary} />
                    <ThemedText style={styles.conductorName}>
                      {item.conductorName}
                    </ThemedText>
                  </View>
                  {isUserCovoiturage && (
                    <TouchableOpacity
                      onPress={() => handleOpenEdit(item)}
                      style={styles.editButton}
                    >
                      <Ionicons name="pencil" size={18} color={theme.interactive.primary} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Trip Details */}
                <View style={styles.detailsRow}>
                  {/* Available Seats */}
                  <View style={styles.detailItem}>
                    <Ionicons 
                      name="people" 
                      size={18} 
                      color={availableSeats > 0 ? theme.interactive.secondary : theme.interactive.inactive} 
                    />
                    <Text style={[
                      styles.detailText,
                      availableSeats === 0 && styles.detailTextInactive
                    ]}>
                      {availableSeats} place{availableSeats !== 1 ? 's' : ''}
                    </Text>
                  </View>

                  {/* Date and Time */}
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={18} color={theme.text.secondary} />
                    <Text style={styles.detailText}>
                      {formatDate(item.departureDate)}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={18} color={theme.text.secondary} />
                    <Text style={styles.detailText}>
                      {formatTime(item.departureDate)}
                    </Text>
                  </View>
                </View>

                {/* Location */}
                <View style={styles.cardRow}>
                  <Ionicons 
                    name={selectedTripType === 'aller' ? "location-outline" : "flag-outline"} 
                    size={18} 
                    color={theme.text.secondary} 
                  />
                  <Text style={styles.locationText}>
                    {displayLocation}
                  </Text>
                </View>

                {/* Contact Info */}
                {item.contactInfo && (
                  <View style={styles.contactContainer}>
                    <Ionicons name="information-circle-outline" size={18} color={theme.text.secondary} />
                    <Text style={styles.contactText}>
                      {item.contactInfo}
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
          contentContainerStyle={styles.list}
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={theme.ui.white} />
        </TouchableOpacity>

        {/* Create Covoiturage Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Title */}
                <ThemedText style={styles.modalTitle}>
                  {isEditMode ? 'Modifier le trajet' : 'Ajouter un trajet'}
                </ThemedText>

                {/* Trip Type Switch */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Type de trajet</Text>
                  <View style={styles.tripTypeButtons}>
                    <Pressable
                      onPress={() => setFormTripType('aller')}
                      style={[
                        styles.tripButton,
                        formTripType === 'aller' && styles.tripButtonActive,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.tripButtonText,
                          formTripType === 'aller' && styles.tripButtonTextActive,
                        ]}
                      >
                        Aller
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={() => setFormTripType('retour')}
                      style={[
                        styles.tripButton,
                        formTripType === 'retour' && styles.tripButtonActive,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.tripButtonText,
                          formTripType === 'retour' && styles.tripButtonTextActive,
                        ]}
                      >
                        Retour
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>

                {/* Conductor Name and Seats */}
                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 2 }]}>
                    <Text style={styles.label}>Conducteur</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nom du conducteur"
                      value={conductorName}
                      onChangeText={setConductorName}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Places</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Nb"
                      value={totalSeats}
                      onChangeText={setTotalSeats}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                {/* Departure Location */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Lieu de départ</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Lieu de départ"
                    value={departureLocation}
                    onChangeText={setDepartureLocation}
                  />
                </View>

                {/* Arrival Location */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Lieu d'arrivée</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Lieu d'arrivée"
                    value={arrivalLocation}
                    onChangeText={setArrivalLocation}
                  />
                </View>

                {/* Departure Day and Time */}
                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Jour</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="JJ/MM/AAAA"
                      value={departureDay}
                      onChangeText={setDepartureDay}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Heure</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="HH:MM"
                      value={departureTime}
                      onChangeText={setDepartureTime}
                    />
                  </View>
                </View>

                {/* Contact Info */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Contact</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Comment me contacter"
                    value={contactInfo}
                    onChangeText={setContactInfo}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Buttons */}
                <View style={styles.modalButtons}>
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => {
                      setIsModalVisible(false);
                      resetForm();
                    }}
                  >
                    <Text style={styles.modalButtonTextCancel}>Annuler</Text>
                  </Pressable>
                  
                  {isEditMode && (
                    <Pressable
                      style={[styles.modalButton, styles.modalButtonDelete]}
                      onPress={handleDelete}
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <ActivityIndicator size="small" color={theme.ui.white} />
                      ) : (
                        <Text style={styles.modalButtonTextDelete}>Supprimer</Text>
                      )}
                    </Pressable>
                  )}
                  
                  <Pressable
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={isEditMode ? handleUpdate : handleCreate}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <ActivityIndicator size="small" color={theme.ui.white} />
                    ) : (
                      <Text style={styles.modalButtonTextConfirm}>
                        {isEditMode ? 'Enregistrer' : 'Confirmer'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tripTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  tripButton: {
    flex: 1,
    backgroundColor: theme.ui.white,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tripButtonActive: {
    backgroundColor: theme.interactive.primary,
    borderColor: theme.interactive.primary,
  },
  tripButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  tripButtonTextActive: {
    color: theme.ui.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.ui.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minWidth: 0,
  },
  list: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'stretch',
    paddingBottom: layout.tabBar.contentPadding,
  },
  card: {
    backgroundColor: theme.background.secondary,
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.03,
    marginBottom: 16,
    borderRadius: 15,
    shadowColor: theme.ui.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 5 : 0,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conductorName: {
    fontSize: width < 350 ? 16 : 18,
    fontWeight: '700',
    color: theme.background.dark,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.background.primary,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: width < 350 ? 13 : 15,
    fontWeight: '500',
    color: '#545454',
  },
  detailTextInactive: {
    color: theme.interactive.inactive,
  },
  locationText: {
    fontSize: width < 350 ? 13 : 15,
    fontWeight: '500',
    color: '#545454',
    flex: 1,
  },
  contactContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: theme.background.primary,
    padding: 10,
    borderRadius: 8,
  },
  contactText: {
    fontSize: width < 350 ? 12 : 14,
    color: theme.text.secondary,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: theme.text.secondary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: layout.tabBar.height + layout.tabBar.marginBottom + 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.interactive.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.ui.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.background.dark,
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.ui.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.interactive.inactive,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: theme.ui.white,
    borderWidth: 1,
    borderColor: theme.interactive.inactive,
  },
  modalButtonConfirm: {
    backgroundColor: theme.interactive.primary,
  },
  modalButtonDelete: {
    backgroundColor: '#E74C3C',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.ui.white,
  },
  modalButtonTextDelete: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.ui.white,
  },
});
