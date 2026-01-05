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
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  ticketId: string;
  phone?: string;
}

export interface Ticket {
  id: string;
  used: boolean;
  userId?: string;
  purchaseDate: Date;
  type: 'early' | 'standard' | 'vip';
}
