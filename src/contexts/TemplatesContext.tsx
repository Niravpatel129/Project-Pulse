'use client';

import { Template, TemplateItemVersion } from '@/api/models';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useApi } from './ApiContext';

interface TemplatesContextState {
  // State
  templates: Template[];
  currentTemplate: Template | null;
  templateItemVersions: TemplateItemVersion[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  loadTemplates: (params?: Record<string, unknown>) => Promise<void>;
  loadTemplate: (id: string) => Promise<Template | null>;
  createTemplate: (template: Partial<Template>) => Promise<Template | null>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<Template | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  searchTemplates: (query: string) => Promise<void>;
  getTemplateItemVersions: (templateId: string, itemId: string) => Promise<TemplateItemVersion[]>;
  restoreTemplateItemVersion: (
    templateId: string,
    itemId: string,
    versionId: string,
  ) => Promise<boolean>;
}

const TemplatesContext = createContext<TemplatesContextState | undefined>(undefined);

interface TemplatesProviderProps {
  children: ReactNode;
}

export const TemplatesProvider: React.FC<TemplatesProviderProps> = ({ children }) => {
  const { services } = useApi();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [templateItemVersions, setTemplateItemVersions] = useState<TemplateItemVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load all templates
  const loadTemplates = async (params: Record<string, unknown> = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await services.templates.getAll(params);
      if (response) {
        setTemplates(response.items);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load templates'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load a single template by ID
  const loadTemplate = async (id: string): Promise<Template | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const template = await services.templates.getById(id);
      setCurrentTemplate(template);
      return template;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to load template ${id}`));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new template
  const createTemplate = async (template: Partial<Template>): Promise<Template | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const newTemplate = await services.templates.create(
        template as Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
      );
      if (newTemplate) {
        setTemplates((prevTemplates) => [newTemplate, ...prevTemplates]);
        return newTemplate;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create template'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing template
  const updateTemplate = async (
    id: string,
    updates: Partial<Template>,
  ): Promise<Template | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedTemplate = await services.templates.update(id, updates);
      if (updatedTemplate) {
        setTemplates((prevTemplates) =>
          prevTemplates.map((template) => (template.id === id ? updatedTemplate : template)),
        );

        if (currentTemplate?.id === id) {
          setCurrentTemplate(updatedTemplate);
        }

        return updatedTemplate;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update template ${id}`));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a template
  const deleteTemplate = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await services.templates.delete(id);
      if (result) {
        setTemplates((prevTemplates) => prevTemplates.filter((template) => template.id !== id));

        if (currentTemplate?.id === id) {
          setCurrentTemplate(null);
        }

        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete template ${id}`));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Search templates
  const searchTemplates = async (query: string) => {
    await loadTemplates({ search: query });
  };

  // Get template item versions
  const getTemplateItemVersions = async (
    templateId: string,
    itemId: string,
  ): Promise<TemplateItemVersion[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const versions = await services.projectFiles.getTemplateItemVersions(templateId, itemId);
      if (versions) {
        setTemplateItemVersions(versions);
        return versions;
      }
      return [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load template item versions'));
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Restore template item version
  const restoreTemplateItemVersion = async (
    templateId: string,
    itemId: string,
    versionId: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await services.projectFiles.restoreTemplateItemVersion(
        templateId,
        itemId,
        versionId,
      );
      return !!result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to restore template item version'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Context value
  const value: TemplatesContextState = {
    templates,
    currentTemplate,
    templateItemVersions,
    isLoading,
    error,
    loadTemplates,
    loadTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    searchTemplates,
    getTemplateItemVersions,
    restoreTemplateItemVersion,
  };

  return <TemplatesContext.Provider value={value}>{children}</TemplatesContext.Provider>;
};

// Custom hook to use the templates context
export const useTemplates = (): TemplatesContextState => {
  const context = useContext(TemplatesContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplatesProvider');
  }
  return context;
};
