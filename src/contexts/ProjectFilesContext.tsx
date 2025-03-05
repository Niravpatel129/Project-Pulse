'use client';

import { Comment, FileStatus, FileType, ProjectFile } from '@/api/models';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useApi } from './ApiContext';

// Type definitions for the context
interface ProjectFilesContextState {
  // State
  files: ProjectFile[];
  currentFile: ProjectFile | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  loadFiles: (params?: Record<string, unknown>) => Promise<void>;
  loadFile: (id: string) => Promise<void>;
  createFile: (file: Partial<ProjectFile>) => Promise<ProjectFile | null>;
  updateFile: (id: string, updates: Partial<ProjectFile>) => Promise<ProjectFile | null>;
  deleteFile: (id: string) => Promise<boolean>;
  updateStatus: (id: string, status: FileStatus) => Promise<ProjectFile | null>;
  addComment: (
    id: string,
    comment: Omit<Comment, 'id' | 'createdAt'>,
  ) => Promise<ProjectFile | null>;
  searchFiles: (query: string) => Promise<void>;
  filterFilesByStatus: (status: FileStatus) => Promise<void>;
  filterFilesByType: (type: FileType) => Promise<void>;
  clearFilters: () => Promise<void>;
}

// Create the context
const ProjectFilesContext = createContext<ProjectFilesContextState | undefined>(undefined);

interface ProjectFilesProviderProps {
  children: ReactNode;
}

export const ProjectFilesProvider: React.FC<ProjectFilesProviderProps> = ({ children }) => {
  const { services } = useApi();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [currentFile, setCurrentFile] = useState<ProjectFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FileStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<FileType | ''>('');

  // Load files with optional params
  const loadFiles = async (params: Record<string, unknown> = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = {
        ...params,
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      } as Record<string, string | number | boolean | null | undefined>;

      const response = await services.projectFiles.getAll(queryParams);
      if (response) {
        setFiles(response.items);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load project files'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load a single file by ID
  const loadFile = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const file = await services.projectFiles.getById(id);
      setCurrentFile(file);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load project file ${id}`));
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new file
  const createFile = async (file: Partial<ProjectFile>): Promise<ProjectFile | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const newFile = await services.projectFiles.create(
        file as Omit<ProjectFile, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
      );
      if (newFile) {
        setFiles((prevFiles) => {return [newFile, ...prevFiles]});
        return newFile;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create project file'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing file
  const updateFile = async (
    id: string,
    updates: Partial<ProjectFile>,
  ): Promise<ProjectFile | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedFile = await services.projectFiles.update(id, updates);
      if (updatedFile) {
        setFiles((prevFiles) => {return prevFiles.map((file) => {return (file.id === id ? updatedFile : file)})});

        if (currentFile?.id === id) {
          setCurrentFile(updatedFile);
        }

        return updatedFile;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update project file ${id}`));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a file
  const deleteFile = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await services.projectFiles.delete(id);
      if (result) {
        setFiles((prevFiles) => {return prevFiles.filter((file) => {return file.id !== id})});

        if (currentFile?.id === id) {
          setCurrentFile(null);
        }

        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete project file ${id}`));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update file status
  const updateStatus = async (id: string, status: FileStatus): Promise<ProjectFile | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedFile = await services.projectFiles.updateStatus(id, status);
      if (updatedFile) {
        setFiles((prevFiles) => {return prevFiles.map((file) => {return (file.id === id ? updatedFile : file)})});

        if (currentFile?.id === id) {
          setCurrentFile(updatedFile);
        }

        return updatedFile;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update status for file ${id}`));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a comment to a file
  const addComment = async (
    id: string,
    comment: Omit<Comment, 'id' | 'createdAt'>,
  ): Promise<ProjectFile | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedFile = await services.projectFiles.addComment(id, comment);
      if (updatedFile) {
        setFiles((prevFiles) => {return prevFiles.map((file) => {return (file.id === id ? updatedFile : file)})});

        if (currentFile?.id === id) {
          setCurrentFile(updatedFile);
        }

        return updatedFile;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to add comment to file ${id}`));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Search files by query
  const searchFiles = async (query: string) => {
    setSearchQuery(query);
    await loadFiles({ search: query });
  };

  // Filter files by status
  const filterFilesByStatus = async (status: FileStatus) => {
    setStatusFilter(status);
    await loadFiles({ status });
  };

  // Filter files by type
  const filterFilesByType = async (type: FileType) => {
    setTypeFilter(type);
    await loadFiles({ type });
  };

  // Clear all filters
  const clearFilters = async () => {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
    await loadFiles();
  };

  // Load initial data
  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Context value
  const value: ProjectFilesContextState = {
    files,
    currentFile,
    isLoading,
    error,
    loadFiles,
    loadFile,
    createFile,
    updateFile,
    deleteFile,
    updateStatus,
    addComment,
    searchFiles,
    filterFilesByStatus,
    filterFilesByType,
    clearFilters,
  };

  return <ProjectFilesContext.Provider value={value}>{children}</ProjectFilesContext.Provider>;
};

// Custom hook to use the project files context
export const useProjectFiles = (): ProjectFilesContextState => {
  const context = useContext(ProjectFilesContext);
  if (context === undefined) {
    throw new Error('useProjectFiles must be used within a ProjectFilesProvider');
  }
  return context;
};
