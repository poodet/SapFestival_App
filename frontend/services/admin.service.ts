import { doc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserRole } from '../types/user';

export class AdminService {
  /**
   * Create ticket IDs (run once to populate tickets collection)
   * Returns array of generated ticket codes
   */
  static async createTickets(count: number, type: 'early' | 'standard' | 'vip'): Promise<string[]> {
    const tickets: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const ticketId = `SAP2026-${type.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      await setDoc(doc(db, 'tickets', ticketId), {
        used: false,
        purchaseDate: new Date(),
        type
      });
      
      tickets.push(ticketId);
    }
    
    return tickets;
  }

  /**
   * Update user role (organisateur only)
   */
  static async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole
    });
  }

  /**
   * Verify user ticket (mark as verified)
   */
  static async verifyTicket(userId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ticketVerified: true
    });
  }

  /**
   * Get all users (organisateur only)
   */
  static async getAllUsers() {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  }

  /**
   * Get all tickets
   */
  static async getAllTickets() {
    const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
    return ticketsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      purchaseDate: doc.data().purchaseDate?.toDate() || new Date()
    }));
  }
}
