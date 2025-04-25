'use client';

import { useEffect, useState } from 'react';
import { alertState } from './alertState';

export function useAlertState() {
  const [isOpen, setIsOpen] = useState(alertState.isOpen);

  useEffect(() => {
    // Subscribe to changes in the alert state
    const unsubscribe = alertState.subscribe((newIsOpen) => {
      console.log('Alert state changed:', newIsOpen);
      setIsOpen(newIsOpen);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const toggle = () => {
    return alertState.toggle();
  };
  const open = () => {
    return alertState.open();
  };
  const close = () => {
    return alertState.close();
  };

  return { isOpen, toggle, open, close };
}
