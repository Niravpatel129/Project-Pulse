import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { usePipelineSettings } from './usePipelineSettings';

// Fallback mock data in case API fails
const MOCK_PROJECTS = [
  {
    id: 1,
    name: 'Enterprise CRM Implementation',
    client: 'Acme Corporation',
    type: 'Software Implementation',
    leadSource: 'Industry Conference',
    stage: 'Proposal',
    startDate: '2023-09-15',
    endDate: '2024-03-30',
    teamSize: 6,
    manager: 'Sarah Johnson',
    lastUpdated: '2 hours ago',
    progress: 65,
    status: 'On Track',
    description:
      'Implementation of enterprise-wide CRM solution with custom integrations to existing ERP system.',
  },
  // ... rest of mock data
];

export function useProjects() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeItem, setActiveItem] = useState<any>(null);

  // Get pipeline settings
  const { stages: pipelineStages, statuses: pipelineStatuses } = usePipelineSettings();

  // Get URL params
  const kanban = (searchParams.get('kanban') as 'stages' | 'status') || 'stages';
  const isKanban = searchParams.get('view') === 'kanban';
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const sort = searchParams.get('sort') || 'name';
  const direction = (searchParams.get('direction') as 'asc' | 'desc') || 'asc';

  // Update URL params
  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`);
  };

  // Toggle between table and kanban views
  const toggleView = () => {
    if (isKanban) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('view');
      params.delete('kanban');
      router.push(`?${params.toString()}`);
    } else {
      updateParams({ view: 'kanban', kanban });
    }
  };

  // Update kanban view type
  const setKanban = (newKanban: 'stages' | 'status') => {
    if (newKanban === 'status') {
      updateParams({ kanban: 'status' });
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('kanban');
      router.push(`?${params.toString()}`);
    }
  };

  // Update search
  const setSearch = (newSearch: string) => {
    updateParams({ search: newSearch });
  };

  // Update status filter
  const setStatus = (newStatus: string) => {
    updateParams({ status: newStatus });
  };

  // Update sorting
  const setSort = (newSort: string) => {
    if (sort === newSort) {
      updateParams({ direction: direction === 'asc' ? 'desc' : 'asc' });
    } else {
      updateParams({ sort: newSort, direction: 'asc' });
    }
  };

  // Fetch projects with React Query
  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await newRequest.get('/projects');
        return response.data.data.map((project: any) => {
          return {
            _id: project._id,
            id: project._id,
            name: project.name,
            stage: project.stage,
            status: project.status,
            projectType: project.projectType,
            manager: project.manager,
            participants: project.participants || [],
            team: project.team || [],
            tasks: project.tasks || [],
            notes: project.notes || [],
            isActive: project.isActive,
            createdBy: project.createdBy,
            workspace: project.workspace,
            leadSource: project.leadSource,
            sharing: project.sharing,
            collaborators: project.collaborators || [],
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          };
        });
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        return MOCK_PROJECTS;
      }
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: number) => {
      return newRequest.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err) => {
      console.error('Failed to delete project:', err);
    },
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previousProjects = queryClient.getQueryData(['projects']);
      queryClient.setQueryData(['projects'], (old: any[]) => {
        return old.filter((project) => {
          return project.id !== projectId;
        });
      });
      return { previousProjects };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update project stage mutation
  const updateStageMutation = useMutation({
    mutationFn: async ({ projectId, newStage }: { projectId: string; newStage: string }) => {
      try {
        const response = await newRequest.put(`/projects/${projectId}`, { stage: newStage });
        return response.data;
      } catch (error) {
        console.error('Failed to update project stage:', error);
        throw error;
      }
    },
    onMutate: async ({ projectId, newStage }) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previousProjects = queryClient.getQueryData(['projects']);
      queryClient.setQueryData(['projects'], (old: any[]) => {
        return old.map((project) => {
          if (project._id === projectId) {
            return { ...project, stage: newStage };
          }
          return project;
        });
      });
      return { previousProjects };
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      console.error('Failed to update project stage:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update project status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ projectId, newStatus }: { projectId: string; newStatus: string }) => {
      try {
        const response = await newRequest.put(`/projects/${projectId}`, { status: newStatus });
        return response.data;
      } catch (error) {
        console.error('Failed to update project status:', error);
        throw error;
      }
    },
    onMutate: async ({ projectId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previousProjects = queryClient.getQueryData(['projects']);
      queryClient.setQueryData(['projects'], (old: any[]) => {
        return old.map((project) => {
          if (project._id === projectId) {
            return { ...project, status: newStatus };
          }
          return project;
        });
      });
      return { previousProjects };
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      console.error('Failed to update project status:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Filter projects based on search query and status filter
  const filteredProjects = projects?.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.type?.toLowerCase().includes(search.toLowerCase()) ||
      project.client?.toLowerCase().includes(search.toLowerCase()) ||
      project.leadSource?.toLowerCase().includes(search.toLowerCase()) ||
      project.manager?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = status === 'all' || project.stage === status;

    return matchesSearch && matchesStatus;
  });

  // Sort the filtered projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let comparison = 0;
    if (sort === 'progress' || sort === 'teamSize') {
      comparison = (a[sort as keyof typeof a] as number) - (b[sort as keyof typeof b] as number);
    } else {
      const aValue = String(a[sort as keyof typeof a] || '').toLowerCase();
      const bValue = String(b[sort as keyof typeof b] || '').toLowerCase();
      comparison = aValue.localeCompare(bValue);
    }
    return direction === 'asc' ? comparison : -comparison;
  });

  // Get items for each stage/status in kanban view
  const getItemsByStage = (stage: string) => {
    return projects.filter((project) => {
      const matchesStage =
        stage === 'No Stage'
          ? !pipelineStages.some((s) => {
              return s.name === project.stage;
            })
          : project.stage === stage;

      return (
        matchesStage &&
        (search === '' ||
          project.name.toLowerCase().includes(search.toLowerCase()) ||
          project.projectType?.toLowerCase().includes(search.toLowerCase()) ||
          project.manager?.name?.toLowerCase().includes(search.toLowerCase()))
      );
    });
  };

  const getItemsByStatus = (status: string) => {
    return projects.filter((project) => {
      const matchesStatus =
        status === 'No Status'
          ? !pipelineStatuses.some((s) => {
              return s.name === project.status;
            })
          : project.status === status;

      return (
        matchesStatus &&
        (search === '' ||
          project.name.toLowerCase().includes(search.toLowerCase()) ||
          project.projectType?.toLowerCase().includes(search.toLowerCase()) ||
          project.manager?.name?.toLowerCase().includes(search.toLowerCase()))
      );
    });
  };

  // Get projects without a defined stage/status
  const noStageProjects = getItemsByStage('No Stage');
  const noStatusProjects = getItemsByStatus('No Status');
  const shouldShowNoStage = noStageProjects.length > 0;
  const shouldShowNoStatus = noStatusProjects.length > 0;

  // Handle drag start
  const handleDragStart = (event: any) => {
    const { active } = event;
    const id = active.id.toString();
    const foundItem = projects.find((project) => {
      return project._id === id;
    });
    if (foundItem) {
      setActiveItem(foundItem);
    }
  };

  // Handle drag over
  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeItemId = active.id.toString();
    const overId = over.id.toString();

    if (activeItemId === overId) return;

    const isStageColumn = pipelineStages.some((s) => {
      return s.name === overId;
    });
    const isStatusColumn = pipelineStatuses.some((s) => {
      return s.name === overId;
    });
    const isNoStageColumn = overId === 'No Stage';
    const isNoStatusColumn = overId === 'No Status';

    if (isStageColumn || isNoStageColumn || isStatusColumn || isNoStatusColumn) {
      const activeItem = projects.find((project) => {
        return project._id === activeItemId;
      });
      if (!activeItem) return;

      if (kanban === 'stages' && (isStageColumn || isNoStageColumn)) {
        if (activeItem.stage !== overId) {
          queryClient.setQueryData(['projects'], (old: any[]) => {
            return old.map((project) => {
              if (project._id === activeItemId) {
                return { ...project, stage: overId };
              }
              return project;
            });
          });
          updateStageMutation.mutate({ projectId: activeItemId, newStage: overId });
        }
      } else if (kanban === 'status' && (isStatusColumn || isNoStatusColumn)) {
        if (activeItem.status !== overId) {
          queryClient.setQueryData(['projects'], (old: any[]) => {
            return old.map((project) => {
              if (project._id === activeItemId) {
                return { ...project, status: overId };
              }
              return project;
            });
          });
          updateStatusMutation.mutate({ projectId: activeItemId, newStatus: overId });
        }
      }
    }
  };

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) {
      setActiveItem(null);
      return;
    }

    const activeItemId = active.id.toString();
    const overId = over.id.toString();

    if (activeItemId === overId) {
      setActiveItem(null);
      return;
    }

    const isStageColumn = pipelineStages.some((s) => {
      return s.name === overId;
    });
    const isStatusColumn = pipelineStatuses.some((s) => {
      return s.name === overId;
    });
    const isNoStageColumn = overId === 'No Stage';
    const isNoStatusColumn = overId === 'No Status';

    if (isStageColumn || isNoStageColumn || isStatusColumn || isNoStatusColumn) {
      const activeItem = projects.find((project) => {
        return project._id === activeItemId;
      });
      if (!activeItem) return;

      if (kanban === 'stages' && (isStageColumn || isNoStageColumn)) {
        if (activeItem.stage !== overId) {
          queryClient.setQueryData(['projects'], (old: any[]) => {
            return old.map((project) => {
              if (project._id === activeItemId) {
                return { ...project, stage: overId };
              }
              return project;
            });
          });
          updateStageMutation.mutate({ projectId: activeItemId, newStage: overId });
        }
      } else if (kanban === 'status' && (isStatusColumn || isNoStatusColumn)) {
        if (activeItem.status !== overId) {
          queryClient.setQueryData(['projects'], (old: any[]) => {
            return old.map((project) => {
              if (project._id === activeItemId) {
                return { ...project, status: overId };
              }
              return project;
            });
          });
          updateStatusMutation.mutate({ projectId: activeItemId, newStatus: overId });
        }
      }
    }

    setActiveItem(null);
  };

  return {
    // State
    projects,
    isLoading,
    error,
    activeItem,
    kanban,
    isKanban,
    search,
    status,
    sort,
    direction,
    sortedProjects,
    shouldShowNoStage,
    shouldShowNoStatus,
    pipelineStages,
    pipelineStatuses,

    // Actions
    toggleView,
    setKanban,
    setSearch,
    setStatus,
    setSort,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getItemsByStage,
    getItemsByStatus,
  };
}
