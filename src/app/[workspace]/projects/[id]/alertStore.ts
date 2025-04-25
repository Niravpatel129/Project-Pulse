'use client';

import { create } from 'zustand';

interface AlertState {
  isOpen: boolean;
  toggleAlert: () => void;
  openAlert: () => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => {
  return {
    isOpen: false,
    toggleAlert: () => {
      return set((state) => {
        console.log('Toggling alert, current state:', state.isOpen);
        return { isOpen: !state.isOpen };
      });
    },
    openAlert: () => {
      return set({ isOpen: true });
    },
    closeAlert: () => {
      return set({ isOpen: false });
    },
  };
});
