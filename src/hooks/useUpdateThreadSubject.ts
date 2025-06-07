import { newRequest } from '@/utils/newRequest';
import { useMutation } from '@tanstack/react-query';

interface UpdateThreadSubjectPayload {
  subject: string;
}

interface UpdateThreadSubjectResponse {
  success: boolean;
  data: {
    _id: string;
    threadId: string;
    subject: string;
    cleanSubject: string;
    title: string;
    workspaceId: string;
  };
}

export const useUpdateThreadSubject = (threadId: string) => {
  return useMutation<UpdateThreadSubjectResponse, Error, UpdateThreadSubjectPayload>({
    mutationFn: async ({ subject }) => {
      const { data } = await newRequest.patch<UpdateThreadSubjectResponse>(
        `/inbox/threads/${threadId}/subject`,
        { subject },
      );
      return data;
    },
  });
};
