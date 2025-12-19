import type { SmitheryServer, SmitherySearchResult } from '@/types/smithery';

// Smithery.ai API endpoint
const SMITHERY_API_BASE = 'https://smithery.ai/api';

// Featured MCP servers (curated list)
const FEATURED_SERVERS = [
  '@modelcontextprotocol/server-filesystem',
  '@modelcontextprotocol/server-github',
  '@modelcontextprotocol/server-git',
  '@modelcontextprotocol/server-brave-search',
  '@modelcontextprotocol/server-postgres',
  '@modelcontextprotocol/server-sqlite',
];

/**
 * Fetch all available MCP servers from Smithery.ai registry
 */
export async function fetchSmitheryServers(): Promise<SmitheryServer[]> {
  try {
    const response = await fetch(`${SMITHERY_API_BASE}/servers`);

    if (!response.ok) {
      console.warn('Failed to fetch from Smithery API, using fallback data');
      return getFallbackServers();
    }

    const data = await response.json();

    // Transform API response to our format
    const servers: SmitheryServer[] = data.servers.map((server: any) => ({
      id: server.package || server.name,
      name: server.name || server.package.split('/').pop(),
      description: server.description || 'No description available',
      author: server.author || 'Unknown',
      repository: server.repository,
      homepage: server.homepage,
      version: server.version || 'latest',
      featured: FEATURED_SERVERS.includes(server.package || server.name),
      runtime: detectRuntime(server),
      command: getCommand(server),
      args: getArgs(server),
      env: server.env || {},
      tags: server.tags || [],
      downloads: server.downloads || 0,
      stars: server.stars || 0,
      lastUpdated: server.updated_at,
      requirements: {
        node: server.engines?.node,
        python: server.engines?.python,
        packages: server.dependencies ? Object.keys(server.dependencies) : [],
      },
    }));

    return servers;
  } catch (error) {
    console.error('Error fetching Smithery servers:', error);
    return getFallbackServers();
  }
}

/**
 * Search Smithery servers by query
 */
export async function searchSmitheryServers(query: string): Promise<SmitherySearchResult> {
  const allServers = await fetchSmitheryServers();

  if (!query.trim()) {
    return {
      servers: allServers,
      total: allServers.length,
    };
  }

  const normalizedQuery = query.toLowerCase();
  const filtered = allServers.filter(
    (server) =>
      server.name.toLowerCase().includes(normalizedQuery) ||
      server.description.toLowerCase().includes(normalizedQuery) ||
      server.author.toLowerCase().includes(normalizedQuery) ||
      server.id.toLowerCase().includes(normalizedQuery) ||
      server.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery))
  );

  return {
    servers: filtered,
    total: filtered.length,
  };
}

/**
 * Get server details by ID
 */
export async function getSmitheryServer(id: string): Promise<SmitheryServer | null> {
  const servers = await fetchSmitheryServers();
  return servers.find((s) => s.id === id) || null;
}

// Helper functions

function detectRuntime(server: any): 'node' | 'python' | 'docker' | 'binary' {
  if (server.runtime) return server.runtime;
  if (server.package?.startsWith('@') || server.engines?.node) return 'node';
  if (server.engines?.python) return 'python';
  if (server.docker) return 'docker';
  return 'binary';
}

function getCommand(server: any): string {
  if (server.command) return server.command;

  const runtime = detectRuntime(server);
  switch (runtime) {
    case 'node':
      return 'npx';
    case 'python':
      return 'python';
    case 'docker':
      return 'docker';
    default:
      return server.package || 'unknown';
  }
}

function getArgs(server: any): string[] {
  if (server.args) return server.args;

  const runtime = detectRuntime(server);
  switch (runtime) {
    case 'node':
      return ['-y', server.package || server.name];
    case 'python':
      return ['-m', server.package || server.name];
    case 'docker':
      return ['run', '--rm', '-i', server.image || server.package];
    default:
      return [];
  }
}

/**
 * Fallback servers when API is unavailable
 */
function getFallbackServers(): SmitheryServer[] {
  return [
    {
      id: '@modelcontextprotocol/server-filesystem',
      name: 'Filesystem',
      description: 'Access and manipulate files and directories on the local filesystem',
      author: 'Anthropic',
      repository: 'https://github.com/modelcontextprotocol/servers',
      version: 'latest',
      featured: true,
      runtime: 'node',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem'],
      tags: ['filesystem', 'files', 'directories'],
    },
    {
      id: '@modelcontextprotocol/server-github',
      name: 'GitHub',
      description: 'Interact with GitHub repositories, issues, pull requests, and more',
      author: 'Anthropic',
      repository: 'https://github.com/modelcontextprotocol/servers',
      version: 'latest',
      featured: true,
      runtime: 'node',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: { GITHUB_TOKEN: '' },
      tags: ['github', 'git', 'repositories'],
    },
    {
      id: '@modelcontextprotocol/server-git',
      name: 'Git',
      description: 'Execute git commands and manage repositories',
      author: 'Anthropic',
      repository: 'https://github.com/modelcontextprotocol/servers',
      version: 'latest',
      featured: true,
      runtime: 'node',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-git'],
      tags: ['git', 'version-control'],
    },
    {
      id: '@modelcontextprotocol/server-brave-search',
      name: 'Brave Search',
      description: 'Search the web using Brave Search API',
      author: 'Anthropic',
      repository: 'https://github.com/modelcontextprotocol/servers',
      version: 'latest',
      featured: true,
      runtime: 'node',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-brave-search'],
      env: { BRAVE_API_KEY: '' },
      tags: ['search', 'web', 'brave'],
    },
    {
      id: '@modelcontextprotocol/server-postgres',
      name: 'PostgreSQL',
      description: 'Query and manage PostgreSQL databases',
      author: 'Anthropic',
      repository: 'https://github.com/modelcontextprotocol/servers',
      version: 'latest',
      featured: true,
      runtime: 'node',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres'],
      env: { POSTGRES_URL: '' },
      tags: ['database', 'postgresql', 'sql'],
    },
    {
      id: '@modelcontextprotocol/server-sqlite',
      name: 'SQLite',
      description: 'Query and manage SQLite databases',
      author: 'Anthropic',
      repository: 'https://github.com/modelcontextprotocol/servers',
      version: 'latest',
      featured: true,
      runtime: 'node',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sqlite'],
      tags: ['database', 'sqlite', 'sql'],
    },
    {
      id: '@modelcontextprotocol/server-slack',
      name: 'Slack',
      description: 'Send messages and interact with Slack workspaces',
      author: 'Anthropic',
      repository: 'https://github.com/modelcontextprotocol/servers',
      version: 'latest',
      runtime: 'node',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-slack'],
      env: { SLACK_BOT_TOKEN: '' },
      tags: ['slack', 'messaging', 'collaboration'],
    },
    {
      id: '@modelcontextprotocol/server-google-drive',
      name: 'Google Drive',
      description: 'Access and manage files in Google Drive',
      author: 'Anthropic',
      repository: 'https://github.com/modelcontextprotocol/servers',
      version: 'latest',
      runtime: 'node',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-google-drive'],
      tags: ['google-drive', 'storage', 'files'],
    },
    {
      id: '@modelcontextprotocol/server-puppeteer',
      name: 'Puppeteer',
      description: 'Automate web browsers and scrape web pages',
      author: 'Anthropic',
      repository: 'https://github.com/modelcontextprotocol/servers',
      version: 'latest',
      runtime: 'node',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-puppeteer'],
      tags: ['browser', 'automation', 'scraping'],
    },
    {
      id: '@modelcontextprotocol/server-memory',
      name: 'Memory',
      description: 'Persistent memory storage for AI conversations',
      author: 'Anthropic',
      repository: 'https://github.com/modelcontextprotocol/servers',
      version: 'latest',
      runtime: 'node',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
      tags: ['memory', 'storage', 'persistence'],
    },
  ];
}
