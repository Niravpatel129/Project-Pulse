import { api } from '../client';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface EmailHistoryItem {
  id: string;
  date: string;
  subject: string;
  recipients: string[];
  snippet: string;
}

export interface SendEmailRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  projectId: string;
  attachments?: File[];
}

/**
 * Service for email-related API calls
 */
export const emails = {
  /**
   * Send an email
   * @param data Email data including recipients, subject, body, and attachments
   */
  sendEmail: async (data: SendEmailRequest): Promise<{ success: boolean; message: string }> => {
    const formData = new FormData();
    formData.append('to', JSON.stringify(data.to));
    formData.append('cc', JSON.stringify(data.cc || []));
    formData.append('bcc', JSON.stringify(data.bcc || []));
    formData.append('subject', data.subject);
    formData.append('body', data.body);
    formData.append('projectId', data.projectId);

    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    return api.post('/emails/send', formData);
  },

  /**
   * Get email templates
   */
  getTemplates: async (): Promise<EmailTemplate[]> => {
    return api.get('/emails/templates');
  },

  /**
   * Save a new email template
   * @param template Template data to save
   */
  saveTemplate: async (template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> => {
    return api.post('/emails/templates', template);
  },

  /**
   * Get email history for a project
   * @param projectId Project ID
   */
  getHistory: async (projectId: string): Promise<EmailHistoryItem[]> => {
    return api.get(`/emails/history/${projectId}`);
  },
};
