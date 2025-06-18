export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  status: 'published' | 'draft' | 'archived';
  publishedAt?: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: CMSMedia;
  template?: 'default' | 'landing' | 'about' | 'contact';
}

export interface CMSPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  status: 'published' | 'draft' | 'archived';
  publishedAt?: string;
  updatedAt: string;
  author?: CMSAuthor;
  categories?: CMSCategory[];
  tags?: string[];
  featuredImage?: CMSMedia;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CMSMedia {
  id: string;
  url: string;
  alt?: string;
  title?: string;
  caption?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

export interface CMSAuthor {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  avatar?: CMSMedia;
}

export interface CMSCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string;
}

export interface CMSNavigation {
  id: string;
  label: string;
  url: string;
  order: number;
  parent?: string;
  children?: CMSNavigation[];
  target?: '_self' | '_blank';
}

export interface CMSSection {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'cta' | 'content' | 'gallery' | 'contact';
  title?: string;
  subtitle?: string;
  content?: string;
  order: number;
  settings?: Record<string, any>;
  items?: CMSSectionItem[];
}

export interface CMSSectionItem {
  id: string;
  title?: string;
  description?: string;
  image?: CMSMedia;
  link?: string;
  order: number;
  settings?: Record<string, any>;
}

export interface CMSSettings {
  siteName: string;
  siteDescription?: string;
  logo?: CMSMedia;
  favicon?: CMSMedia;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
  theme?: {
    content?: {
      primary?: string;
      secondary?: string;
    };
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  // Extended SEO and metadata fields
  seo?: {
    keywords?: string[];
    author?: string;
    robots?: string;
    canonical?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: CMSMedia;
    ogUrl?: string;
    ogSiteName?: string;
    ogType?: string;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: CMSMedia;
    twitterCreator?: string;
    twitterSite?: string;
    applicationName?: string;
    themeColor?: string;
    msapplicationTileColor?: string;
    manifestPath?: string;
  };
  favicons?: {
    icon16?: string;
    icon32?: string;
    appleTouchIcon?: string;
    safariPinnedTab?: string;
    msapplicationTileImage?: string;
  };
}

export interface CMSContent {
  pages: CMSPage[];
  posts: CMSPost[];
  navigation: CMSNavigation[];
  sections: CMSSection[];
  settings: CMSSettings;
  media: CMSMedia[];
}

export interface CMSApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CMSQuery {
  page?: number;
  limit?: number;
  status?: 'published' | 'draft' | 'archived';
  category?: string;
  tag?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
