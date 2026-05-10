export interface TenantConfig {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  isValid: boolean;
}

export function getTenantInfo(): TenantConfig {
  if (typeof window === 'undefined') {
    return { id: '', name: 'SimplyDSE', isValid: false };
  }

  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // Logic for local development (e.g. company.localhost:4321)
  // Or production (company.simplydse.com)
  let tenantId = '';
  
  if (parts.length > 2) {
    // If we have at least 3 parts (subdomain.domain.tld)
    tenantId = parts[0];
  } else if (hostname.includes('localhost') && parts.length > 1) {
    // Handle company.localhost
    tenantId = parts[0];
  }

  // For now, if no tenant is found, we assume the main portal
  if (!tenantId || tenantId === 'www' || tenantId === 'simplydse') {
    return {
      id: 'main',
      name: 'SimplyDSE',
      isValid: true,
    };
  }

  // In a real app, you would fetch this config from your backend/WordPress
  // For now, we'll return a mock config based on the subdomain
  return {
    id: tenantId,
    name: tenantId.charAt(0).toUpperCase() + tenantId.slice(1),
    isValid: true, // We'll assume any subdomain is valid for UI demo purposes
  };
}
