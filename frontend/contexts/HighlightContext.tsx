/**
 * HighlightContext
 * 
 * Provides a global state for managing item highlighting across tabs.
 * This avoids URL parameter pollution when navigating from calendar to other tabs.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface HighlightContextType {
  /**
   * Current highlighted item ID
   */
  highlightId: string | null;
  
  /**
   * Current highlighted item category (artist, activity, meal, etc.)
   */
  highlightCategory: string | null;
  
  /**
   * Set the highlighted item ID and optional category
   */
  setHighlightId: (id: string | null, category?: string | null) => void;
  
  /**
   * Clear the highlighted item ID
   */
  clearHighlight: () => void;
}

const HighlightContext = createContext<HighlightContextType | undefined>(undefined);

export function HighlightProvider({ children }: { children: React.ReactNode }) {
  const [highlightId, setHighlightIdState] = useState<string | null>(null);
  const [highlightCategory, setHighlightCategoryState] = useState<string | null>(null);

  const setHighlightId = useCallback((id: string | null, category?: string | null) => {
    setHighlightIdState(id);
    setHighlightCategoryState(category || null);
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightIdState(null);
    setHighlightCategoryState(null);
  }, []);

  return (
    <HighlightContext.Provider value={{ highlightId, highlightCategory, setHighlightId, clearHighlight }}>
      {children}
    </HighlightContext.Provider>
  );
}

export function useHighlight() {
  const context = useContext(HighlightContext);
  if (context === undefined) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context;
}
