import { CustomField } from '@/types/project';
import { useState } from 'react';
import { toast } from 'sonner';

export const useParticipantForm = () => {
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantPhone, setNewParticipantPhone] = useState('');
  const [newParticipantNotes, setNewParticipantNotes] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    setEmailError('');
    return true;
  };

  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    }

    setNameError('');
    return true;
  };

  const handleAddCustomField = () => {
    if (newFieldName.trim() !== '') {
      setCustomFields([...customFields, { key: newFieldName, value: '' }]);
      setNewFieldName('');
      toast.success('Custom Field Added', {
        description: `New field "${newFieldName}" has been added.`,
      });
    } else {
      toast.warning('Invalid Field Name', {
        description: 'Field name cannot be empty.',
      });
    }
  };

  const handleUpdateCustomField = (index: number, value: string) => {
    const updatedFields = [...customFields];
    updatedFields[index].value = value;
    setCustomFields(updatedFields);
  };

  const handleRemoveCustomField = (index: number) => {
    const fieldName = customFields[index].key;
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
    toast.info('Field Removed', {
      description: `Field "${fieldName}" has been removed.`,
    });
  };

  const resetForm = () => {
    setNewParticipantName('');
    setNewParticipantEmail('');
    setNewParticipantPhone('');
    setNewParticipantNotes('');
    setCustomFields([]);
    setNewFieldName('');
    setNameError('');
    setEmailError('');
  };

  const isFormValid =
    newParticipantName.trim() !== '' &&
    newParticipantEmail.trim() !== '' &&
    !nameError &&
    !emailError;

  return {
    formData: {
      name: newParticipantName,
      email: newParticipantEmail,
      phone: newParticipantPhone,
      notes: newParticipantNotes,
      customFields,
      newFieldName,
    },
    setters: {
      setName: setNewParticipantName,
      setEmail: setNewParticipantEmail,
      setPhone: setNewParticipantPhone,
      setNotes: setNewParticipantNotes,
      setNewFieldName,
    },
    validation: {
      nameError,
      emailError,
      isFormValid,
      validateEmail,
      validateName,
    },
    customFieldHandlers: {
      handleAddCustomField,
      handleUpdateCustomField,
      handleRemoveCustomField,
    },
    resetForm,
  };
};
