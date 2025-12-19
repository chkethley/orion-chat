export interface SmitheryServer {
  id: string;
  name: string;
  description: string;
  author: string;
  repository?: string;
  homepage?: string;
  version?: string;
  featured?: boolean;

  // Installation details
  runtime: 'node' | 'python' | 'docker' | 'binary';
  command: string;
  args: string[];
  env?: Record<string, string>;

  // Metadata
  tags?: string[];
  downloads?: number;
  stars?: number;
  lastUpdated?: string;

  // Requirements
  requirements?: {
    node?: string;
    python?: string;
    packages?: string[];
  };
}

export interface SmitheryCategory {
  name: string;
  description: string;
  servers: string[]; // Server IDs
}

export interface SmitherySearchResult {
  servers: SmitheryServer[];
  total: number;
  categories?: SmitheryCategory[];
}
