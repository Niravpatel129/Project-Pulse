import { SharingSettings } from '@/types/project';

export async function updateProjectSharingSettings(projectId: string, settings: SharingSettings) {
  const response = await fetch(`/api/projects/${projectId}/sharing/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error('Failed to update sharing settings');
  }

  return response.json();
}
