import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { CreateUserData, User } from '../types/user';

export class AuthService {
  /**
   * Register new user with ticket validation
   */
  static async register(data: CreateUserData): Promise<User> {
    if (!auth || !db) {
      throw new Error('Firebase not initialized');
    }

    // 1. Check if ticket ID exists and is not used
    const ticketRef = doc(db, 'tickets', data.ticketId);
    const ticketDoc = await getDoc(ticketRef);

    if (!ticketDoc.exists()) {
      throw new Error('Code billet invalide');
    }

    const ticketData = ticketDoc.data();
    if (ticketData.used) {
      throw new Error('Ce billet a déjà été utilisé');
    }

    // 2. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    // 3. Create user document in Firestore
    const userData: Omit<User, 'id'> = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      ticketId: data.ticketId,
      role: 'participant', // Default role
      createdAt: new Date(),
      ticketVerified: false, // Admin must verify
      phone: data.phone
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    // 4. Mark ticket as used
    await setDoc(ticketRef, { 
      used: true, 
      userId: userCredential.user.uid 
    }, { merge: true });

    return { id: userCredential.user.uid, ...userData };
  }

  /**
   * Sign in existing user
   */
  static async login(email: string, password: string): Promise<User> {
    if (!auth || !db) {
      throw new Error('Firebase not initialized');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      throw new Error('Utilisateur introuvable');
    }

    return { 
      id: userDoc.id, 
      ...userDoc.data(),
      createdAt: userDoc.data().createdAt?.toDate() || new Date()
    } as User;
  }

  /**
   * Sign out current user
   */
  static async logout(): Promise<void> {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }
    await firebaseSignOut(auth);
  }

  /**
   * Get current user data from Firestore
   */
  static async getCurrentUser(firebaseUser: FirebaseUser): Promise<User | null> {
    if (!db) {
      return null;
    }

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    return { 
      id: userDoc.id, 
      ...userDoc.data(),
      createdAt: userDoc.data().createdAt?.toDate() || new Date()
    } as User;
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    if (!auth) {
      return () => {}; // Return empty cleanup function
    }
    return onAuthStateChanged(auth, callback);
  }
}
