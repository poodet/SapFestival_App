import React, { createContext, useContext, ReactNode } from 'react';
import { CovoiturageService } from '@/services/covoiturage.service';
import { Covoiturage } from '@/types/data';
import { useAuth } from './AuthContext';

interface CovoiturageContextType {
  createCovoiturage: (data: Omit<Covoiturage, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCovoiturage: (covoiturageId: string, updates: Partial<Omit<Covoiturage, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteCovoiturage: (covoiturageId: string) => Promise<void>;
  canUserEdit: (covoiturageId: string) => Promise<boolean>;
  reserveSeat: (covoiturageId: string) => Promise<void>;
  cancelReservation: (covoiturageId: string) => Promise<void>;
}

const CovoiturageContext = createContext<CovoiturageContextType | undefined>(undefined);

export const CovoiturageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const createCovoiturage = async (data: Omit<Covoiturage, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      throw new Error('User must be authenticated to create a covoiturage');
    }
    
    try {
      const id = await CovoiturageService.createCovoiturage(user.id, data);
      return id;
    } catch (error) {
      console.error('Error creating covoiturage:', error);
      throw error;
    }
  };

  const updateCovoiturage = async (
    covoiturageId: string, 
    updates: Partial<Omit<Covoiturage, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) => {
    if (!user) {
      throw new Error('User must be authenticated to update a covoiturage');
    }
    
    try {
      await CovoiturageService.updateCovoiturage(covoiturageId, user.id, updates);
    } catch (error) {
      console.error('Error updating covoiturage:', error);
      throw error;
    }
  };

  const deleteCovoiturage = async (covoiturageId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to delete a covoiturage');
    }
    
    try {
      await CovoiturageService.deleteCovoiturage(covoiturageId, user.id);
    } catch (error) {
      console.error('Error deleting covoiturage:', error);
      throw error;
    }
  };

  const canUserEdit = async (covoiturageId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    try {
      return await CovoiturageService.canUserEdit(covoiturageId, user.id);
    } catch (error) {
      console.error('Error checking edit permission:', error);
      return false;
    }
  };

  const reserveSeat = async (covoiturageId: string) => {
    try {
      await CovoiturageService.reserveSeat(covoiturageId);
    } catch (error) {
      console.error('Error reserving seat:', error);
      throw error;
    }
  };

  const cancelReservation = async (covoiturageId: string) => {
    try {
      await CovoiturageService.cancelReservation(covoiturageId);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }
  };

  return (
    <CovoiturageContext.Provider
      value={{
        createCovoiturage,
        updateCovoiturage,
        deleteCovoiturage,
        canUserEdit,
        reserveSeat,
        cancelReservation,
      }}
    >
      {children}
    </CovoiturageContext.Provider>
  );
};

export const useCovoiturageActions = () => {
  const context = useContext(CovoiturageContext);
  if (context === undefined) {
    throw new Error('useCovoiturageActions must be used within a CovoiturageProvider');
  }
  return context;
};
