import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { usePipelineSettings } from './usePipelineSettings';

// Types
interface Project {
  _id: string;
  id: string;
  name: string;
  stage: {
    name: string;
    order: number;
    color: string;
    _id: string;
  };
  status: {
    name: string;
    order: number;
    color: string;
    _id: string;
  };
  projectType: string;
  manager: {
    name: string;
  };
  type?: string;
  client?: string;
  leadSource?: string;
  progress?: number;
  teamSize?: number;
  tasks?: Array<{
    _id: string | number;
    title: string;
    description: string;
    status: string;
    dueDate: string;
  }>;
  clients?: Array<string>;
}

// Fallback mock data in case API fails
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    _id: '1',
    name: 'Enterprise CRM Implementation',
    client: 'Acme Corporation',
    type: 'Software Implementation',
    leadSource: 'Industry Conference',
    stage: { name: 'Proposal', order: 0, color: '', _id: '' },
    projectType: 'Software Implementation',
    manager: { name: 'Sarah Johnson' },
    status: { name: 'On Track', order: 0, color: '', _id: '' },
  },
];

export function useProjects() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeItem, setActiveItem] = useState<Project | null>(null);

  // Get pipeline settings
  const { stages: pipelineStages, statuses: pipelineStatuses } = usePipelineSettings();

  // Get URL params
  const kanban = (searchParams.get('kanban') as 'stages' | 'status') || 'stages';
  const isKanban = searchParams.get('view') === 'kanban';
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const sort = searchParams.get('sort') || 'name';
  const direction = (searchParams.get('direction') as 'asc' | 'desc') || 'asc';

  // Memoize URL params updates
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await newRequest.delete(`/projects/${projectId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Memoize view toggling
  const toggleView = useCallback(() => {
    if (isKanban) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('view');
      params.delete('kanban');
      router.push(`?${params.toString()}`);
    } else {
      updateParams({ view: 'kanban', kanban });
    }
  }, [isKanban, kanban, router, searchParams, updateParams]);

  // Memoize kanban updates
  const setKanban = useCallback(
    (newKanban: 'stages' | 'status') => {
      if (newKanban === 'status') {
        updateParams({ kanban: 'status' });
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('kanban');
        router.push(`?${params.toString()}`);
      }
    },
    [router, searchParams, updateParams],
  );

  // Memoize search updates
  const setSearch = useCallback(
    (newSearch: string) => {
      updateParams({ search: newSearch });
    },
    [updateParams],
  );

  // Memoize status updates
  const setStatus = useCallback(
    (newStatus: string) => {
      updateParams({ status: newStatus });
    },
    [updateParams],
  );

  // Memoize sort updates
  const setSort = useCallback(
    (newSort: string) => {
      if (sort === newSort) {
        updateParams({ direction: direction === 'asc' ? 'desc' : 'asc' });
      } else {
        updateParams({ sort: newSort, direction: 'asc' });
      }
    },
    [direction, sort, updateParams],
  );

  // Fetch projects with React Query
  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await newRequest.get('/projects');
        return (response.data?.data || []).map((project: any) => {
          return {
            _id: project._id,
            id: project._id,
            name: project.name || '',
            stage: project.stage || { name: '', order: 0, color: '', _id: '' },
            status: project.status || { name: '', order: 0, color: '', _id: '' },
            projectType: project.projectType || '',
            manager: project.manager || { name: '' },
            createdAt: project.createdAt || '',
            clients: project.clients || [],
          };
        });
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        return MOCK_PROJECTS;
      }
    },
  });

  // Memoize filtered projects
  const filteredProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];

    const searchLower = search.toLowerCase();
    return projects.filter((project) => {
      if (!project) return false;

      const matchesSearch =
        (project.name?.toLowerCase() || '').includes(searchLower) ||
        (project.type?.toLowerCase() || '').includes(searchLower) ||
        (project.client?.toLowerCase() || '').includes(searchLower) ||
        (project.leadSource?.toLowerCase() || '').includes(searchLower) ||
        (project.manager?.name?.toLowerCase() || '').includes(searchLower);

      const matchesStatus = status === 'all' || project.stage.name === status;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, status]);

  // Memoize sorted projects
  const sortedProjects = useMemo(() => {
    if (!filteredProjects || filteredProjects.length === 0) return [];

    return [...filteredProjects].sort((a, b) => {
      if (!a || !b) return 0;

      let comparison = 0;
      if (sort === 'progress' || sort === 'teamSize') {
        const aValue = (a[sort] as number) || 0;
        const bValue = (b[sort] as number) || 0;
        comparison = aValue - bValue;
      } else {
        const aValue = String(a[sort as keyof Project] || '').toLowerCase();
        const bValue = String(b[sort as keyof Project] || '').toLowerCase();
        comparison = aValue.localeCompare(bValue);
      }
      return direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredProjects, sort, direction]);
  console.log('🚀 sortedProjects:', sortedProjects);

  // Memoize items by stage
  const getItemsByStage = useCallback(
    (stage: string) => {
      if (!projects || projects.length === 0) return [];

      const searchLower = search.toLowerCase();
      return projects.filter((project) => {
        if (!project) return false;

        const matchesStage =
          stage === 'No Stage'
            ? !pipelineStages.some((s) => {
                return s.name === project.stage.name;
              })
            : project.stage.name === stage;

        return (
          matchesStage &&
          (search === '' ||
            (project.name?.toLowerCase() || '').includes(searchLower) ||
            (project.projectType?.toLowerCase() || '').includes(searchLower) ||
            (project.manager?.name?.toLowerCase() || '').includes(searchLower))
        );
      });
    },
    [projects, search, pipelineStages],
  );

  // Memoize items by status
  const getItemsByStatus = useCallback(
    (status: string) => {
      if (!projects || projects.length === 0) return [];

      const searchLower = search.toLowerCase();
      return projects.filter((project) => {
        if (!project) return false;

        const matchesStatus =
          status === 'No Status'
            ? !pipelineStatuses.some((s) => {
                return s.name === project.status.name;
              })
            : project.status.name === status;

        return (
          matchesStatus &&
          (search === '' ||
            (project.name?.toLowerCase() || '').includes(searchLower) ||
            (project.projectType?.toLowerCase() || '').includes(searchLower) ||
            (project.manager?.name?.toLowerCase() || '').includes(searchLower))
        );
      });
    },
    [projects, search, pipelineStatuses],
  );

  // Memoize projects without stage/status
  const { noStageProjects, noStatusProjects, shouldShowNoStage, shouldShowNoStatus } =
    useMemo(() => {
      const noStageProjects = getItemsByStage('No Stage');
      const noStatusProjects = getItemsByStatus('No Status');
      return {
        noStageProjects,
        noStatusProjects,
        shouldShowNoStage: noStageProjects.length > 0,
        shouldShowNoStatus: noStatusProjects.length > 0,
      };
    }, [getItemsByStage, getItemsByStatus]);

  // Memoize drag handlers
  const handleDragStart = useCallback(
    (event: any) => {
      if (!projects || projects.length === 0) return;

      const { active } = event;
      const id = active.id.toString();
      const foundItem = projects.find((project) => {
        return project._id === id;
      });
      if (foundItem) {
        setActiveItem(foundItem);
      }
    },
    [projects],
  );

  const handleDragOver = useCallback(
    (event: any) => {
      if (!projects || projects.length === 0) return;

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
          if (activeItem.stage.name !== overId) {
            queryClient.setQueryData(['projects'], (old: Project[] = []) => {
              return old.map((project) => {
                if (project._id === activeItemId) {
                  const newStage = pipelineStages.find((s) => {
                    return s.name === overId;
                  }) || { name: overId, order: 0, color: '#94a3b8', _id: '' };
                  return { ...project, stage: newStage };
                }
                return project;
              });
            });
          }
        } else if (kanban === 'status' && (isStatusColumn || isNoStatusColumn)) {
          if (activeItem.status.name !== overId) {
            queryClient.setQueryData(['projects'], (old: Project[] = []) => {
              return old.map((project) => {
                if (project._id === activeItemId) {
                  const newStatus = pipelineStatuses.find((s) => {
                    return s.name === overId;
                  }) || { name: overId, order: 0, color: '#94a3b8', _id: '' };
                  return { ...project, status: newStatus };
                }
                return project;
              });
            });
          }
        }
      }
    },
    [kanban, pipelineStages, pipelineStatuses, projects, queryClient],
  );

  const handleDragEnd = useCallback((event: any) => {
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

    setActiveItem(null);
  }, []);

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
    deleteProject,
  };
}
