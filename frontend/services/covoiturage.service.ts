import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Covoiturage } from '@/types/data';

const COVOITURAGE_COLLECTION = 'covoiturages';

/**
 * Covoiturage Service
 * Manages car sharing data in Firestore
 */
export class CovoiturageService {
  /**
   * Get all covoiturage trips
   */
  static async getAllCovoiturage(): Promise<Covoiturage[]> {
    try {
      const q = query(
        collection(db, COVOITURAGE_COLLECTION),
        orderBy('departureDate', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Covoiturage));
    } catch (error) {
      console.error('Error getting covoiturage:', error);
      return [];
    }
  }

  /**
   * Get covoiturage trips by type (aller or retour)
   */
  static async getCovoiturageByType(tripType: 'aller' | 'retour'): Promise<Covoiturage[]> {
    try {
      const q = query(
        collection(db, COVOITURAGE_COLLECTION),
        where('tripType', '==', tripType),
        orderBy('departureDate', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        departureDate: doc.data().departureDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Covoiturage));
    } catch (error) {
      console.error('Error getting covoiturage by type:', error);
      return [];
    }
  }

  /**
   * Get covoiturage trips created by a specific user
   */
  static async getUserCovoiturage(userId: string): Promise<Covoiturage[]> {
    try {
      const q = query(
        collection(db, COVOITURAGE_COLLECTION),
        where('userId', '==', userId),
        orderBy('departureDate', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        departureDate: doc.data().departureDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Covoiturage));
    } catch (error) {
      console.error('Error getting user covoiturage:', error);
      return [];
    }
  }

  /**
   * Get a single covoiturage by ID
   */
  static async getCovoiturageById(covoiturageId: string): Promise<Covoiturage | null> {
    try {
      const docRef = doc(db, COVOITURAGE_COLLECTION, covoiturageId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
        departureDate: docSnap.data().departureDate?.toDate(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as Covoiturage;
    } catch (error) {
      console.error('Error getting covoiturage by ID:', error);
      return null;
    }
  }

  /**
   * Create a new covoiturage trip
   * @param userId - ID of the user creating the covoiturage
   * @param covoiturageData - Covoiturage data (without id, userId, timestamps)
   */
  static async createCovoiturage(
    userId: string, 
    covoiturageData: Omit<Covoiturage, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COVOITURAGE_COLLECTION), {
        ...covoiturageData,
        departureDate: Timestamp.fromDate(covoiturageData.departureDate),
        totalSeats: Number(covoiturageData.totalSeats),
        reservedSeats: Number(covoiturageData.reservedSeats),
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Covoiturage created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating covoiturage:', error);
      throw error;
    }
  }

  /**
   * Update an existing covoiturage trip
   * Only the user who created it can update it
   * @param covoiturageId - ID of the covoiturage to update
   * @param userId - ID of the user attempting the update
   * @param updates - Partial covoiturage data to update
   */
  static async updateCovoiturage(
    covoiturageId: string,
    userId: string,
    updates: Partial<Omit<Covoiturage, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
      // First, check if the user is the creator
      const covoiturage = await this.getCovoiturageById(covoiturageId);
      
      if (!covoiturage) {
        throw new Error('Covoiturage not found');
      }
      
      if (covoiturage.userId !== userId) {
        throw new Error('You are not authorized to update this covoiturage');
      }
      
      // Update the document
      const updateData: any = { ...updates };
      
      // Convert Date to Timestamp if departureDate is being updated
      if (updates.departureDate) {
        updateData.departureDate = Timestamp.fromDate(updates.departureDate);
      }
      
      // Ensure integers for seats
      if (updates.totalSeats !== undefined) {
        updateData.totalSeats = Number(updates.totalSeats);
      }
      if (updates.reservedSeats !== undefined) {
        updateData.reservedSeats = Number(updates.reservedSeats);
      }
      
      updateData.updatedAt = serverTimestamp();
      
      await updateDoc(doc(db, COVOITURAGE_COLLECTION, covoiturageId), updateData);
      
      console.log('✅ Covoiturage updated:', covoiturageId);
    } catch (error) {
      console.error('Error updating covoiturage:', error);
      throw error;
    }
  }

  /**
   * Delete a covoiturage trip
   * Only the user who created it can delete it
   * @param covoiturageId - ID of the covoiturage to delete
   * @param userId - ID of the user attempting the deletion
   */
  static async deleteCovoiturage(covoiturageId: string, userId: string): Promise<void> {
    try {
      // First, check if the user is the creator
      const covoiturage = await this.getCovoiturageById(covoiturageId);
      
      if (!covoiturage) {
        throw new Error('Covoiturage not found');
      }
      
      if (covoiturage.userId !== userId) {
        throw new Error('You are not authorized to delete this covoiturage');
      }
      
      // Delete the document
      await deleteDoc(doc(db, COVOITURAGE_COLLECTION, covoiturageId));
      
      console.log('✅ Covoiturage deleted:', covoiturageId);
    } catch (error) {
      console.error('Error deleting covoiturage:', error);
      throw error;
    }
  }

  /**
   * Check if a user can edit a specific covoiturage
   */
  static async canUserEdit(covoiturageId: string, userId: string): Promise<boolean> {
    try {
      const covoiturage = await this.getCovoiturageById(covoiturageId);
      return covoiturage?.userId === userId;
    } catch (error) {
      console.error('Error checking edit permission:', error);
      return false;
    }
  }

  /**
   * Increment reserved seats for a covoiturage
   */
  static async reserveSeat(covoiturageId: string): Promise<void> {
    try {
      const covoiturage = await this.getCovoiturageById(covoiturageId);
      
      if (!covoiturage) {
        throw new Error('Covoiturage not found');
      }
      
      if (covoiturage.reservedSeats >= covoiturage.totalSeats) {
        throw new Error('No seats available');
      }
      
      await updateDoc(doc(db, COVOITURAGE_COLLECTION, covoiturageId), {
        reservedSeats: covoiturage.reservedSeats + 1,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Seat reserved for covoiturage:', covoiturageId);
    } catch (error) {
      console.error('Error reserving seat:', error);
      throw error;
    }
  }

  /**
   * Decrement reserved seats for a covoiturage
   */
  static async cancelReservation(covoiturageId: string): Promise<void> {
    try {
      const covoiturage = await this.getCovoiturageById(covoiturageId);
      
      if (!covoiturage) {
        throw new Error('Covoiturage not found');
      }
      
      if (covoiturage.reservedSeats <= 0) {
        throw new Error('No reservations to cancel');
      }
      
      await updateDoc(doc(db, COVOITURAGE_COLLECTION, covoiturageId), {
        reservedSeats: covoiturage.reservedSeats - 1,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Reservation cancelled for covoiturage:', covoiturageId);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }
  }
}
