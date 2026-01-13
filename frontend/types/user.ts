export type UserRole = 'participant' | 'benevole' | 'organisateur';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  ticketId: string;
  role: UserRole;
  createdAt: Date;
  ticketVerified: boolean;
  phone?: string;
  oneSignalPlayerId?: string; // OneSignal device ID for push notifications
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  ticketId?: string;
  phone?: string;
  role?: UserRole;
}

export interface Ticket {
  id: string;
  used: boolean;
  userId?: string;
  purchaseDate: Date;
  type: 'early' | 'standard' | 'vip';
}
