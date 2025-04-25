'use client';

// A simple event bus for the alert state
class AlertState {
  private listeners: Set<(isOpen: boolean) => void> = new Set();
  private _isOpen: boolean = false;

  get isOpen() {
    return this._isOpen;
  }

  toggle() {
    console.log('Toggling alert, current state:', this._isOpen);
    this._isOpen = !this._isOpen;
    this.notifyListeners();
  }

  open() {
    this._isOpen = true;
    this.notifyListeners();
  }

  close() {
    this._isOpen = false;
    this.notifyListeners();
  }

  subscribe(listener: (isOpen: boolean) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this._isOpen);
    }
  }
}

// Singleton instance
export const alertState = new AlertState();
