import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Approver {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  isProjectParticipant?: boolean;
}

interface UseApproverDialogProps {
  moduleId: string;
  moduleDetails: {
    name: string;
    version: number;
    updatedAt: string;
    fileType?: string;
  };
}

export function useApproverDialog({ moduleId, moduleDetails }: UseApproverDialogProps) {
  console.log('🚀 moduleDetails:', moduleDetails);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedApprovers, setSelectedApprovers] = useState<Approver[]>([]);
  const [manualEmail, setManualEmail] = useState('');
  const [message, setMessage] = useState(
    `Hi there, I have completed the latest version of ${moduleDetails?.name}. Please review it at your convenience and let me know if you'd like any changes.

Best regards,
Your Name`,
  );
  const [sendReminder, setSendReminder] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setMessage(`Hi there,

I've completed the latest version of ${moduleDetails.name}. Please review it at your convenience and let me know if you'd like any changes.

Best regards,
Your Name`);
      setSendReminder(true);
      setAllowComments(true);
      setIsDropdownOpen(false);
      setSearchTerm('');
    }
  }, [isOpen, moduleDetails.name]);

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

  // Request approval mutation
  const requestApprovalMutation = useMutation({
    mutationFn: async () => {
      if (selectedApprovers.length === 0) {
        throw new Error('Please select at least one approver');
      }

      const { data } = await newRequest.post(`/approvals/modules/${moduleId}/request`, {
        approvers: selectedApprovers,
        message,
        sendReminder,
        allowComments,
        moduleDetails,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      queryClient.invalidateQueries({ queryKey: ['module-approvals', moduleId] });
      setIsOpen(false);
      setSelectedApprovers([]);
      toast.success('Approval requested successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to request approval');
    },
  });

  // Handle adding custom email
  const handleAddCustomEmail = () => {
    if (isValidEmail(searchTerm)) {
      setSelectedApprovers((prev) => {
        return [
          ...prev,
          {
            name: searchTerm.split('@')[0],
            email: searchTerm,
            isProjectParticipant: false,
          },
        ];
      });
      setSearchTerm('');
      setIsDropdownOpen(false);
    }
  };

  // Handle removing approver
  const handleRemoveApprover = (email: string) => {
    setSelectedApprovers((prev) => {
      return prev.filter((a) => {
        return a.email !== email;
      });
    });
  };

  // Helper functions
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isPartialEmail = (email: string) => {
    return email.includes('@') && !isValidEmail(email);
  };

  return {
    isOpen,
    setIsOpen,
    selectedApprovers,
    setSelectedApprovers,
    manualEmail,
    setManualEmail,
    message,
    setMessage,
    sendReminder,
    setSendReminder,
    allowComments,
    setAllowComments,
    isDropdownOpen,
    setIsDropdownOpen,
    searchTerm,
    setSearchTerm,
    dropdownRef,
    requestApprovalMutation,
    handleAddCustomEmail,
    handleRemoveApprover,
    isValidEmail,
    isPartialEmail,
  };
}
