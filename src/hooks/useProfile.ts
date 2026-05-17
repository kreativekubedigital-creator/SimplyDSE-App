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
    department: string | null;
    phoneNumber: string | null;
    preferredName: string | null;
    startDate: string | null;
    createdAt: string | null;
    mfaEnabled: boolean | null;
    employmentType: string | null;
    employeeIdOfficial: string | null;
    workLocation: string | null;
    managerName: string | null;
    organizationId: string | null;
    organizationName: string | null;
    organizationLogoUrl: string | null;
    authMethod: string | null;
    loading: boolean;
  }>({
    id: null,
    email: null,
    fullName: null,
    role: null,
    avatarUrl: null,
    designation: null,
    department: null,
    phoneNumber: null,
    preferredName: null,
    startDate: null,
    createdAt: null,
    mfaEnabled: null,
    employmentType: null,
    employeeIdOfficial: null,
    workLocation: null,
    managerName: null,
    organizationId: null,
    organizationName: null,
    organizationLogoUrl: null,
    authMethod: null,
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
          department: context.department || null,
          phoneNumber: context.phoneNumber || null,
          preferredName: context.preferredName || null,
          startDate: context.startDate || null,
          createdAt: context.createdAt || null,
          mfaEnabled: context.mfaEnabled ?? false,
          employmentType: context.employmentType || null,
          employeeIdOfficial: context.employeeIdOfficial || null,
          workLocation: context.workLocation || null,
          managerName: context.managerName || null,
          organizationId: context.organizationId,
          organizationName: context.organizationName,
          organizationLogoUrl: context.organizationLogoUrl,
          authMethod: context.authMethod || 'email',
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
    if (!name || name === 'User') return '??';
    return name
      .split(' ')
      .filter(n => n.length > 0)
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
