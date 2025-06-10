'use client';

import { useState } from 'react';
import { DEV_WORKSPACES } from './index';

interface DevPanelProps {
  currentWorkspace?: string;
  onWorkspaceChange?: (workspace: string) => void;
}

export function DevPanel({ currentWorkspace, onWorkspaceChange }: DevPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      {/* Toggle Button */}
      <button
        onClick={() => {
          return setIsOpen(!isOpen);
        }}
        className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors mb-2'
      >
        🛠️ Dev Panel
      </button>

      {/* Panel */}
      {isOpen && (
        <div className='bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-semibold text-gray-900'>Development Panel</h3>
            <button
              onClick={() => {
                return setIsOpen(false);
              }}
              className='text-gray-400 hover:text-gray-600'
            >
              ✕
            </button>
          </div>

          <div className='space-y-4'>
            {/* Current Workspace */}
            <div className='text-sm text-gray-600'>
              <strong>Current:</strong> {currentWorkspace || 'None'}
            </div>

            {/* Workspace Switcher */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Switch Workspace:
              </label>
              <div className='space-y-2'>
                {DEV_WORKSPACES.map((workspace) => {
                  return (
                    <div
                      key={workspace.slug}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        currentWorkspace === workspace.slug
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (onWorkspaceChange) {
                          onWorkspaceChange(workspace.slug);
                        } else {
                          // Default: redirect to workspace URL
                          window.location.href = `/?workspace=${workspace.slug}`;
                        }
                      }}
                    >
                      <div className='font-medium text-sm'>{workspace.name}</div>
                      <div className='text-xs text-gray-500'>{workspace.description}</div>
                      <div className='flex items-center justify-between mt-1'>
                        <span className='text-xs bg-gray-100 px-2 py-1 rounded'>
                          {workspace.industry}
                        </span>
                        {workspace.hasLocations && (
                          <span className='text-xs text-blue-600'>
                            {workspace.locations.length} location
                            {workspace.locations.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className='border-t pt-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Quick Actions:</label>
              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={() => {
                    return window.location.reload();
                  }}
                  className='text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors'
                >
                  🔄 Reload
                </button>
                <button
                  onClick={() => {
                    return localStorage.clear();
                  }}
                  className='text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors'
                >
                  🗑️ Clear Storage
                </button>
                <button
                  onClick={() => {
                    return console.log('Current workspace data:', currentWorkspace);
                  }}
                  className='text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors'
                >
                  📝 Log Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
