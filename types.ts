
export interface LeadSource {
  title: string;
  url: string;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  rating?: number;
  source: 'Google Maps' | 'Web Search';
  category?: string;
  searchKeyword: string;
  searchLocation: string;
  sources?: LeadSource[];
}

export type ExtractionStatus = 'idle' | 'searching' | 'extracting' | 'completed' | 'error';

export interface SearchParams {
  keyword: string;
  location: string;
  sourceType: 'maps' | 'web';
}
