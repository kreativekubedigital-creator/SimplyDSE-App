import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getTenantContext } from '@/lib/tenant-context';

export function useWorkforceData() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    compliant: 0,
    highRisk: 0
  });

  async function fetchWorkforce() {
    try {
      setLoading(true);
      const { organizationId } = await getTenantContext();

      if (!organizationId) {
        setLoading(false);
        return;
      }

      const { data: emps, error } = await supabase
        .from('profiles')
        .select(`
          *,
          assessments(status, risk_level, score, completed_at)
        `)
        .eq('organization_id', organizationId)
        .order('full_name', { ascending: true });

      if (error) throw error;

      const processedEmps = emps.map((emp: any) => {
        const latestAssessment = emp.assessments?.sort((a: any, b: any) => 
          new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
        )[0];

        // Map database status safely to standard UI status options
        let mappedStatus = emp.status || 'active';
        if (mappedStatus === 'inactive') mappedStatus = 'pending_setup';

        return {
          id: emp.id,
          idShort: emp.id.substring(0, 8).toUpperCase(),
          name: emp.full_name || emp.email || 'Unnamed',
          email: emp.email,
          department: emp.department || 'General',
          jobTitle: emp.designation || 'Staff Member',
          role: emp.role || 'employee',
          complianceScore: latestAssessment?.score || 0,
          accountStatus: mappedStatus,
          assessmentStatus: latestAssessment 
            ? (latestAssessment.status === 'completed' 
                ? 'Up To Date' 
                : latestAssessment.status === 'in_progress' 
                  ? 'Pending' 
                  : 'Overdue')
            : 'Pending',
          riskLevel: latestAssessment?.risk_level === 'high' 
            ? 'High' 
            : latestAssessment?.risk_level === 'medium' 
              ? 'Medium' 
              : latestAssessment?.risk_level === 'low'
                ? 'Low'
                : 'Low',
          lastAssessment: latestAssessment ? new Date(latestAssessment.completed_at).toLocaleDateString() : 'Never',
          loginMethod: emp.login_method || 'SSO',
          phone: emp.phone_number || '',
          employmentType: emp.employment_type || 'Full-time',
          workLocation: emp.work_location || 'Office',
          managerId: emp.manager_id || '',
          managerName: emp.manager_id ? 'Assigned' : 'No Manager',
          accessibilityPrefs: emp.accessibility_prefs || {},
          notificationPrefs: emp.notification_prefs || {}
        };
      });

      setEmployees(processedEmps);
      
      const highRiskCount = processedEmps.filter((e: any) => e.riskLevel === 'High').length;
      const compliantCount = processedEmps.filter((e: any) => e.complianceScore > 80).length;

      setStats({
        total: processedEmps.length,
        compliant: compliantCount,
        highRisk: highRiskCount
      });

    } catch (err) {
      console.error('Error fetching workforce data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWorkforce();
  }, []);

  return { employees, loading, stats, refetch: fetchWorkforce };
}
