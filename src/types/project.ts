export interface Role {
  id: string;
  name: string;
  permissions: string[];
  color: string;
  description?: string;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateAdded: string;
  notes?: string;
  customFields?: { key: string; value: string }[];
}

export interface CustomField {
  key: string;
  value: string;
}

export interface APIError {
  response?: {
    data?: {
      status?: string;
      message?: string;
    };
  };
  message?: string;
}

export interface SharingSettings {
  accessType: 'signup_required' | 'email_restricted' | 'public';
  requirePassword: boolean;
  password: string;
  customMessage: string;
  expirationDays: string;
  allowedEmails: string[];
}
