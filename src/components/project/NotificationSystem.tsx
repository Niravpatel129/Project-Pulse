'use client';

import { AlertCircle, Check, X } from 'lucide-react';
import { Notification } from './types';

type NotificationSystemProps = {
  notification: Notification;
  showUndoNotification: boolean;
  setShowUndoNotification: (show: boolean) => void;
  handleUndoDelete: () => void;
};

export default function NotificationSystem({
  notification,
  showUndoNotification,
  setShowUndoNotification,
  handleUndoDelete,
}: NotificationSystemProps) {
  return (
    <>
      {/* Regular Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-md flex items-center space-x-2 transition-all duration-300 ease-in-out ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : notification.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {notification.type === 'success' && <Check size={16} className='text-green-500' />}
          {notification.type === 'error' && <AlertCircle size={16} className='text-red-500' />}
          {notification.type === 'info' && <AlertCircle size={16} className='text-blue-500' />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Undo notification */}
      {showUndoNotification && (
        <div className='fixed bottom-4 right-4 z-50 px-4 py-3 bg-gray-800 text-white rounded-md shadow-lg flex items-center space-x-3'>
          <span>Item removed</span>
          <button
            onClick={handleUndoDelete}
            className='text-blue-300 hover:text-blue-200 font-medium'
          >
            Undo
          </button>
          <button
            onClick={() => {
              return setShowUndoNotification(false);
            }}
            className='ml-2 text-gray-400 hover:text-gray-300'
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
