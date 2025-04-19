import { Button } from '@/components/ui/button';
import { Edit2, Eye, Home, Layout, Settings, X } from 'lucide-react';
import React from 'react';

interface MobileMenuProps {
  showMobileMenu: boolean;
  isMobile: boolean;
  previewMode: boolean;
  setShowMobileMenu: (show: boolean) => void;
  setPreviewMode: (mode: boolean) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  showMobileMenu,
  isMobile,
  previewMode,
  setShowMobileMenu,
  setPreviewMode,
}) => {
  if (!showMobileMenu || !isMobile) return null;

  return (
    <div
      className='fixed inset-0 bg-black/50 z-50'
      onClick={() => {
        return setShowMobileMenu(false);
      }}
    >
      <div
        className='absolute top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg p-4'
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <div className='flex items-center justify-between mb-6'>
          <h2 className='font-medium text-xl'>Form Builder</h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              return setShowMobileMenu(false);
            }}
          >
            <X className='h-5 w-5' />
          </Button>
        </div>
        <div className='space-y-6'>
          <div>
            <h3 className='text-sm font-medium text-gray-500 mb-3'>ACTIONS</h3>
            <div className='space-y-2'>
              <Button variant='ghost' className='w-full justify-start text-base'>
                <Home className='h-5 w-5 mr-3' />
                Dashboard
              </Button>
              <Button variant='ghost' className='w-full justify-start text-base'>
                <Layout className='h-5 w-5 mr-3' />
                Forms
              </Button>
              <Button variant='ghost' className='w-full justify-start text-base'>
                <Settings className='h-5 w-5 mr-3' />
                Settings
              </Button>
            </div>
          </div>
          <div>
            <h3 className='text-sm font-medium text-gray-500 mb-3'>CURRENT FORM</h3>
            <Button
              variant={!previewMode ? 'default' : 'outline'}
              className='w-full justify-start text-base mb-2'
              onClick={() => {
                setPreviewMode(false);
                setShowMobileMenu(false);
              }}
            >
              <Edit2 className='h-5 w-5 mr-3' />
              Edit Form
            </Button>
            <Button
              variant={previewMode ? 'default' : 'outline'}
              className='w-full justify-start text-base'
              onClick={() => {
                setPreviewMode(true);
                setShowMobileMenu(false);
              }}
            >
              <Eye className='h-5 w-5 mr-3' />
              Preview Form
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
