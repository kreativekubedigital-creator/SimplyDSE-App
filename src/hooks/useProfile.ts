'use client';

import { useState, useEffect } from 'react';
import { getTenantContext } from '@/lib/tenant-context';

export function useProfile() {
  const [profile, setProfile] = useState<{
    id: string | null;
    email: string | null;
    fullName: string | null;
    role: string | null;
    avatarUrl: string | null;
    designation: string | null;
    organizationId: string | null;
    organizationName: string | null;
    organizationLogoUrl: string | null;
    loading: boolean;
  }>({
    id: null,
    email: null,
    fullName: null,
    role: null,
    avatarUrl: null,
    designation: null,
    organizationId: null,
    organizationName: null,
    organizationLogoUrl: null,
    loading: true,
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const context = await getTenantContext();
        setProfile({
          id: context.user?.id || null,
          email: context.user?.email || null,
          fullName: context.fullName || 'User',
          role: context.role,
          avatarUrl: context.avatarUrl,
          designation: context.designation || null,
          organizationId: context.organizationId,
          organizationName: context.organizationName,
          organizationLogoUrl: context.organizationLogoUrl,
          loading: false,
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfile(prev => ({ ...prev, loading: false }));
      }
    }

    loadProfile();
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return 'User';
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'organization_admin':
      case 'org_admin': return 'HR Manager';
      case 'employee': return 'Employee';
      case 'user': return 'User';
      default: return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  return {
    ...profile,
    initials: getInitials(profile.fullName),
    roleLabel: getRoleLabel(profile.role),
  };
}
