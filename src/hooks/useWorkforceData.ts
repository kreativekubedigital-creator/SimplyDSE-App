import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getTenantContext } from '@/lib/tenant-context';

const parseValidDate = (value: any) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() <= 1970) return null;
  return date;
};

const getAssignmentStatus = (assignment: any, assessment: any) => {
  const rawStatus = assignment?.status || assessment?.status;
  if (rawStatus === 'completed') return 'Up To Date';
  const dueDate = parseValidDate(assignment?.due_date);
  if (dueDate && dueDate < new Date()) return 'Overdue';
  if (rawStatus === 'assigned' || rawStatus === 'in_progress' || rawStatus === 'pending') return 'Pending';
  return assessment ? 'Pending' : 'Not Assigned';
};

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
          assessments(status, risk_level, score, completed_at, created_at),
          assessment_assignments(status, due_date, assigned_at)
        `)
        .eq('organization_id', organizationId)
        .order('full_name', { ascending: true });

      if (error) throw error;

      const processedEmps = emps.map((emp: any) => {
        // Sort assessments by created_at descending to find the latest assignment
        const sortedAssessments = emp.assessments?.sort((a: any, b: any) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        ) || [];

        const latestAssessment = sortedAssessments[0];

        const sortedAssignments = emp.assessment_assignments?.sort((a: any, b: any) => {
          const bDate = parseValidDate(b.assigned_at)?.getTime() || 0;
          const aDate = parseValidDate(a.assigned_at)?.getTime() || 0;
          return bDate - aDate;
        }) || [];
        const latestAssignment = sortedAssignments[0];

        // Find the latest completed assessment for the last assessment completion date
        const latestCompletedAssessment = emp.assessments?.filter((a: any) => a.status === 'completed')
          .sort((a: any, b: any) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())[0];

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
          assessmentStatus: getAssignmentStatus(latestAssignment, latestAssessment),
          riskLevel: latestAssessment?.risk_level === 'high' 
            ? 'High' 
            : latestAssessment?.risk_level === 'medium' 
              ? 'Medium' 
              : latestAssessment?.risk_level === 'low'
                ? 'Low'
                : 'Low',
          lastAssessment: parseValidDate(latestCompletedAssessment?.completed_at)
            ? parseValidDate(latestCompletedAssessment.completed_at)!.toLocaleDateString()
            : 'Never',
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
