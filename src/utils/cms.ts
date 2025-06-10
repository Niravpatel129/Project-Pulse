import {
  CMSContent,
  CMSNavigation,
  CMSPage,
  CMSPost,
  CMSQuery,
  CMSSection,
  CMSSettings,
} from '@/types/cms';
import { newRequest } from './newRequest';

/**
 * Base CMS API client using the existing newRequest axios instance
 */
class CMSClient {
  private workspaceSlug: string;

  constructor(workspaceSlug: string) {
    this.workspaceSlug = workspaceSlug;
  }

  private async request<T>(
    endpoint: string,
    options?: { method?: string; data?: any },
  ): Promise<T | null> {
    try {
      const { method = 'GET', data } = options || {};

      const response = await newRequest({
        method: method as any,
        url: `/cms${endpoint}`,
        data,
        headers: {
          workspace: this.workspaceSlug,
        },
      });

      // Assuming your backend returns data in response.data format
      if (response.data?.success === false) {
        console.warn(`CMS API error:`, response.data.error);
        return null;
      }

      return response.data?.data || response.data || null;
    } catch (error: any) {
      console.error(`CMS API request error:`, error.response?.data || error.message);
      return null;
    }
  }

  // Fetch all CMS content for a workspace
  async getContent(): Promise<CMSContent | null> {
    return this.request<CMSContent>('/content');
  }

  // Fetch workspace settings
  async getSettings(): Promise<CMSSettings | null> {
    return this.request<CMSSettings>('/settings');
  }

  // Fetch pages
  async getPages(query?: CMSQuery): Promise<CMSPage[] | null> {
    return this.request<CMSPage[]>('/pages', {
      method: 'GET',
      data: query,
    });
  }

  // Fetch a specific page by slug
  async getPage(slug: string): Promise<CMSPage | null> {
    return this.request<CMSPage>(`/pages/${slug}`);
  }

  // Fetch posts/blog content
  async getPosts(query?: CMSQuery): Promise<CMSPost[] | null> {
    return this.request<CMSPost[]>('/posts', {
      method: 'GET',
      data: query,
    });
  }

  // Fetch a specific post by slug
  async getPost(slug: string): Promise<CMSPost | null> {
    return this.request<CMSPost>(`/posts/${slug}`);
  }

  // Fetch navigation items
  async getNavigation(): Promise<CMSNavigation[] | null> {
    return this.request<CMSNavigation[]>('/navigation');
  }

  // Fetch sections for dynamic page building
  async getSections(): Promise<CMSSection[] | null> {
    return this.request<CMSSection[]>('/sections');
  }

  // Update settings
  async updateSettings(settings: Partial<CMSSettings>): Promise<CMSSettings | null> {
    return this.request<CMSSettings>('/settings', {
      method: 'PUT',
      data: settings,
    });
  }
}

/**
 * Fetch complete CMS content for a workspace
 */
export async function fetchCMSContent(workspaceSlug: string): Promise<CMSContent | null> {
  const client = new CMSClient(workspaceSlug);
  return client.getContent();
}

/**
 * Fetch CMS settings for a workspace
 */
export async function fetchCMSSettings(workspaceSlug: string): Promise<CMSSettings | null> {
  const client = new CMSClient(workspaceSlug);
  return client.getSettings();
}

/**
 * Fetch a specific page by slug
 */
export async function fetchPage(workspaceSlug: string, slug: string): Promise<CMSPage | null> {
  const client = new CMSClient(workspaceSlug);
  return client.getPage(slug);
}

/**
 * Fetch published pages
 */
export async function fetchPages(workspaceSlug: string, query?: CMSQuery): Promise<CMSPage[]> {
  const client = new CMSClient(workspaceSlug);
  const pages = await client.getPages({ status: 'published', ...query });
  return pages || [];
}

/**
 * Fetch published posts
 */
export async function fetchPosts(workspaceSlug: string, query?: CMSQuery): Promise<CMSPost[]> {
  const client = new CMSClient(workspaceSlug);
  const posts = await client.getPosts({ status: 'published', ...query });
  return posts || [];
}

/**
 * Fetch navigation items
 */
export async function fetchNavigation(workspaceSlug: string): Promise<CMSNavigation[]> {
  const client = new CMSClient(workspaceSlug);
  const navigation = await client.getNavigation();
  return navigation || [];
}

/**
 * Fetch sections for dynamic page building
 */
export async function fetchSections(workspaceSlug: string): Promise<CMSSection[]> {
  const client = new CMSClient(workspaceSlug);
  const sections = await client.getSections();
  return sections || [];
}

/**
 * Get CMS client instance for a workspace
 */
export function getCMSClient(workspaceSlug: string): CMSClient {
  return new CMSClient(workspaceSlug);
}

/**
 * Build navigation tree from flat navigation items
 */
export function buildNavigationTree(items: CMSNavigation[]): CMSNavigation[] {
  const tree: CMSNavigation[] = [];
  const itemMap = new Map<string, CMSNavigation>();

  // Create a map of all items
  items.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Build the tree
  items.forEach((item) => {
    const nodeItem = itemMap.get(item.id)!;

    if (item.parent) {
      const parent = itemMap.get(item.parent);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(nodeItem);
      }
    } else {
      tree.push(nodeItem);
    }
  });

  // Sort by order
  const sortByOrder = (items: CMSNavigation[]) => {
    items.sort((a, b) => {
      return a.order - b.order;
    });
    items.forEach((item) => {
      if (item.children) {
        sortByOrder(item.children);
      }
    });
  };

  sortByOrder(tree);
  return tree;
}
