export interface WorkspaceConfig {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  isValid: boolean;
}

export function getWorkspaceInfo(): WorkspaceConfig {
  if (typeof window === 'undefined') {
    return { id: '', name: 'SimplyDSE', isValid: false };
  }

  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // Logic for local development (e.g. company.localhost:4321)
  // Or production (company.simplydse.com)
  let WorkspaceId = '';
  
  if (parts.length > 2) {
    // If we have at least 3 parts (subdomain.domain.tld)
    WorkspaceId = parts[0];
  } else if (hostname.includes('localhost') && parts.length > 1) {
    // Handle company.localhost
    WorkspaceId = parts[0];
  }

  // For now, if no Workspace is found, we assume the main portal
  if (!WorkspaceId || WorkspaceId === 'www' || WorkspaceId === 'simplydse') {
    return {
      id: 'main',
      name: 'SimplyDSE',
      isValid: true,
    };
  }

  // In a real app, you would fetch this config from your backend/WordPress
  // For now, we'll return a mock config based on the subdomain
  return {
    id: WorkspaceId,
    name: WorkspaceId.charAt(0).toUpperCase() + WorkspaceId.slice(1),
    isValid: true, // We'll assume any subdomain is valid for UI demo purposes
  };
}
