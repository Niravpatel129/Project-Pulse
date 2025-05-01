import { Participant } from '@/types/project';
import { newRequest } from '@/utils/newRequest';

interface Contact {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  comments?: string;
  customFields?: Record<string, string>;
}

export const participantService = {
  fetchParticipants: async () => {
    const response = await newRequest.get('/participants');
    return response.data.data.map((contact: Contact) => {
      return {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        dateAdded: new Date(contact.createdAt).toISOString().split('T')[0],
        notes: contact.comments,
        customFields: Object.entries(contact.customFields || {}).map(([key, value]) => {
          return {
            key,
            value: value as string,
          };
        }),
      };
    });
  },

  addNewParticipant: async (projectId: string, participant: Participant) => {
    return await newRequest.post(`/projects/${projectId}/participants`, {
      participant,
    });
  },

  addExistingParticipant: async (projectId: string, participantId: string) => {
    return await newRequest.post('/participants/existing', {
      participantId,
      projectId,
    });
  },

  updateParticipant: async (
    projectId: string,
    participantId: string,
    updates: Partial<Participant>,
  ) => {
    return await newRequest.put(`/projects/${projectId}/participants/${participantId}`, {
      updates,
    });
  },
};
