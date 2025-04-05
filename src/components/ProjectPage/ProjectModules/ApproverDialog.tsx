'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, FileText, Mail, MessageSquare, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Approver {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  isProjectParticipant?: boolean;
}

interface ApproverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  potentialApprovers: Approver[];
  selectedApprovers: Approver[];
  onSelectApprover: (approver: Approver) => void;
  onRemoveApprover: (email: string) => void;
  manualEmail: string;
  onManualEmailChange: (email: string) => void;
  onAddManualEmail: () => void;
  onRequestApproval: () => void;
  isLoading: boolean;
  moduleDetails?: {
    name: string;
    version: number;
    updatedAt: string;
    fileType?: string;
  };
}

export function ApproverDialog({
  isOpen,
  onClose,
  potentialApprovers,
  selectedApprovers,
  onSelectApprover,
  onRemoveApprover,
  manualEmail,
  onManualEmailChange,
  onAddManualEmail,
  onRequestApproval,
  isLoading,
  moduleDetails = {
    name: 'Untitled',
    version: 1,
    updatedAt: '5 min ago',
  },
}: ApproverDialogProps) {
  const [message, setMessage] = useState(
    `Hi there,

I've completed the latest version of ${moduleDetails.name}. Please review it at your convenience and let me know if you'd like any changes.

Best regards,
Your Name`,
  );
  const [sendReminder, setSendReminder] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter participants based on search term
  const filteredParticipants = potentialApprovers.filter((approver) => {
    return (
      approver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approver.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Check if search term is a valid email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Check if search term is a partial email (contains @ but not complete)
  const isPartialEmail = (email: string) => {
    return email.includes('@') && !isValidEmail(email);
  };

  const isSearchTermValidEmail = isValidEmail(searchTerm);
  const isSearchTermPartialEmail = isPartialEmail(searchTerm);
  const isCustomEmail =
    isSearchTermValidEmail &&
    !filteredParticipants.some((p) => {
      return p.email === searchTerm;
    });

  // Handle adding custom email
  const handleAddCustomEmail = () => {
    if (isSearchTermValidEmail) {
      onSelectApprover({
        name: searchTerm.split('@')[0],
        email: searchTerm,
        isProjectParticipant: false,
      });
      setSearchTerm('');
      setIsDropdownOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side='bottom' className='p-0 m-0 max-w-full h-[90vh] w-screen rounded-t-lg'>
        <VisuallyHidden>
          <SheetTitle>Send for Client Approval</SheetTitle>
        </VisuallyHidden>
        <motion.div
          className='flex flex-col h-full'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className='flex justify-between items-center px-6 py-4 border-b'>
            <h2 className='text-xl font-semibold'>Send for Client Approval</h2>
            <motion.button
              onClick={onClose}
              className='text-gray-500 hover:text-gray-700'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className='h-5 w-5' />
            </motion.button>
          </div>

          {/* Content */}
          <div className='flex h-full overflow-auto'>
            {/* Left Column - Designer Input Form */}
            <motion.div
              className='w-1/2 p-6 border-r overflow-y-auto'
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* File Information */}
              <motion.div
                className='mb-8'
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-10 h-10 bg-primary/10 rounded flex items-center justify-center'>
                    <FileText className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <h3 className='font-medium'>{moduleDetails.name}</h3>
                    <p className='text-sm text-gray-500'>
                      Version {moduleDetails.version} · Last updated {moduleDetails.updatedAt}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Select Recipients */}
              <motion.div
                className='mb-6'
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <label className='block text-sm font-medium mb-2'>Select Recipients</label>
                <div className='relative mb-3' ref={dropdownRef}>
                  <div
                    className='flex items-center justify-between w-full border rounded-md px-3 py-2 bg-white cursor-pointer hover:bg-gray-50'
                    onClick={() => {
                      return setIsDropdownOpen(!isDropdownOpen);
                    }}
                  >
                    <input
                      type='text'
                      placeholder='Search participants or enter email'
                      className='flex-1 text-sm border-none outline-none bg-transparent'
                      value={searchTerm}
                      onChange={(e) => {
                        return setSearchTerm(e.target.value);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDropdownOpen(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && isSearchTermValidEmail) {
                          e.preventDefault();
                          handleAddCustomEmail();
                        }
                      }}
                    />
                    <ChevronDown className='h-4 w-4 text-gray-500' />
                  </div>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        className='absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto'
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {isSearchTermPartialEmail && (
                          <div className='p-2 text-sm text-gray-500 border-b'>
                            Continue typing to complete the email address
                          </div>
                        )}

                        {filteredParticipants.length > 0
                          ? filteredParticipants.map((approver) => {
                              return (
                                <motion.div
                                  key={approver.email}
                                  className='flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer'
                                  onClick={() => {
                                    onSelectApprover(approver);
                                    setSearchTerm('');
                                    setIsDropdownOpen(false);
                                  }}
                                  whileHover={{ backgroundColor: 'rgba(243, 244, 246, 1)' }}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Avatar className='h-6 w-6'>
                                    <AvatarImage
                                      src={approver.avatar || '/placeholder.svg'}
                                      alt={approver.name}
                                    />
                                    <AvatarFallback>{approver.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className='text-sm font-medium'>{approver.name}</div>
                                    <div className='text-xs text-gray-500'>{approver.email}</div>
                                  </div>
                                </motion.div>
                              );
                            })
                          : !isSearchTermPartialEmail && (
                              <div className='p-2 text-sm text-gray-500'>
                                {searchTerm
                                  ? 'No participants found'
                                  : 'Type to search or enter an email'}
                              </div>
                            )}

                        {isCustomEmail && (
                          <motion.div
                            className='flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer border-t'
                            onClick={handleAddCustomEmail}
                            whileHover={{ backgroundColor: 'rgba(243, 244, 246, 1)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className='h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center'>
                              <Mail className='h-3 w-3 text-primary' />
                            </div>
                            <div>
                              <div className='text-sm font-medium'>Add custom email</div>
                              <div className='text-xs text-gray-500'>{searchTerm}</div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected Recipients */}
                <div className='mb-3 min-h-[40px] flex flex-row flex-wrap gap-2'>
                  <AnimatePresence>
                    {selectedApprovers.map((approver) => {
                      return (
                        <motion.div
                          key={approver.email}
                          className='flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 w-fit'
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          layout
                        >
                          <Avatar className='h-6 w-6'>
                            <AvatarImage
                              src={approver.avatar || '/placeholder.svg'}
                              alt={approver.name}
                            />
                            <AvatarFallback>{approver.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className='text-sm'>{approver.name}</span>
                          <motion.button
                            className='text-gray-500 hover:text-gray-700'
                            onClick={() => {
                              return onRemoveApprover(approver.email);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className='h-3.5 w-3.5' />
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Add a Message */}
              <motion.div
                className='mb-6'
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <label className='block text-sm font-medium mb-2'>Add a Message</label>
                <Textarea
                  className='min-h-[100px] rounded-md'
                  placeholder="Hey! Here's the latest version. Let me know what you think!"
                  value={message}
                  rows={7}
                  onChange={(e) => {
                    return setMessage(e.target.value);
                  }}
                />
              </motion.div>

              {/* Options (Toggles) */}
              <motion.div
                className='space-y-4'
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <div className='flex items-start gap-3'>
                  <Switch
                    checked={sendReminder}
                    onCheckedChange={setSendReminder}
                    className='mt-0.5'
                  />
                  <div>
                    <label className='flex items-center gap-2 text-sm font-medium'>
                      <Bell className='h-4 w-4 text-gray-500' />
                      Send a reminder email if no response in 2 days
                    </label>
                    <p className='text-xs text-gray-500 mt-1'>
                      Helps nudge the client to respond if they miss your initial request
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3'>
                  <Switch
                    checked={allowComments}
                    onCheckedChange={setAllowComments}
                    className='mt-0.5'
                  />
                  <div>
                    <label className='flex items-center gap-2 text-sm font-medium'>
                      <MessageSquare className='h-4 w-4 text-gray-500' />
                      Allow comments
                    </label>
                    <p className='text-xs text-gray-500 mt-1'>
                      Enables client to leave notes directly on the review page
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Email Preview */}
            <motion.div
              className='w-1/2 bg-gray-50 dark:bg-gray-900 overflow-y-auto flex flex-col'
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className='p-6 flex-1 flex flex-col'>
                <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center mb-4'>
                  <FileText className='h-4 w-4 mr-2' />
                  Email Preview
                </h3>
                <motion.div
                  className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 flex-1 flex flex-col'
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  layout
                >
                  <div className='mb-4'>
                    <div className='flex items-center gap-3 mb-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src='/placeholder.svg' alt='Your avatar' />
                        <AvatarFallback>YN</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className='text-sm font-medium'>Your Name</div>
                        <div className='text-xs text-gray-500 dark:text-gray-400'>
                          your.email@company.com
                        </div>
                      </div>
                    </div>
                    <div className='text-base font-medium'>
                      Request for approval: {moduleDetails?.name || 'Untitled Module'}
                    </div>
                  </div>

                  <motion.div
                    className='border-t border-b py-4 my-4 border-gray-200 dark:border-gray-700 flex-1 max-h-[216px] overflow-y-auto'
                    layout
                  >
                    <p className='text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap'>
                      {message || 'No message provided'}
                    </p>
                  </motion.div>

                  <div className='mb-4'>
                    <div className='border rounded-lg p-3 mb-4 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded flex items-center justify-center'>
                          <FileText className='h-5 w-5 text-primary dark:text-primary' />
                        </div>
                        <div>
                          <h3 className='text-sm font-medium'>
                            {moduleDetails?.name || 'Untitled Module'}
                          </h3>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>
                            Version {moduleDetails?.version || '1'} •{' '}
                            {moduleDetails?.fileType || 'Document'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className='w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 text-sm'>
                        Review and Approve
                      </Button>
                    </motion.div>

                    {/* Fixed height container to prevent layout shift */}
                    <div className='h-6 mt-2'>
                      <AnimatePresence>
                        {allowComments && (
                          <motion.div
                            className='text-xs text-center text-gray-500'
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <MessageSquare className='h-3 w-3 inline mr-1' />
                            Comments are enabled for this review
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className='text-xs text-gray-500 dark:text-gray-400 text-center'>
                    This request was sent via automated email. If you have any questions, please
                    contact support.
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            className='flex justify-end gap-3 p-4 border-t'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant='outline' onClick={onClose}>
                Cancel
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className='bg-primary hover:bg-primary/90 text-primary-foreground'
                onClick={onRequestApproval}
                disabled={selectedApprovers.length === 0 || isLoading}
              >
                {isLoading ? 'Sending...' : 'Send for Approval'}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
