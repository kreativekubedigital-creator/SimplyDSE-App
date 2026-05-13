import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getTenantContext } from '@/lib/tenant-context';

export function useComplianceData() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    assessments: [],
    risks: [],
    stats: {
      critical: 0,
      high: 0,
      completed: 0,
      pending: 0
    }
  });

  async function fetchData() {
    try {
      setLoading(true);
      const { organizationId } = await getTenantContext();

      if (!organizationId) {
        setLoading(false);
        return;
      }

      // Fetch all assessments for this org
      const { data: assessments, error } = await supabase
        .from('assessments')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedAssessments = assessments.map((rec: any) => ({
        id: rec.id.substring(0, 12).toUpperCase(),
        employee: rec.profiles?.full_name || rec.profiles?.email || 'Unnamed',
        department: 'General',
        status: rec.status === 'completed' ? 'Completed' : rec.status === 'in_progress' ? 'In Progress' : 'Pending',
        dueDate: rec.completed_at ? new Date(rec.completed_at).toLocaleDateString() : 'Pending',
        riskLevel: rec.risk_level === 'high' ? 'High' : rec.risk_level === 'medium' ? 'Medium' : 'Low',
        completion: rec.status === 'completed' ? 100 : rec.status === 'in_progress' ? 50 : 0,
      }));

      const riskIncidents = processedAssessments.filter((a: any) => a.riskLevel === 'High' || a.riskLevel === 'Medium');

      setData({
        assessments: processedAssessments,
        risks: riskIncidents,
        stats: {
          critical: riskIncidents.filter((i: any) => i.riskLevel === 'High').length,
          high: riskIncidents.filter((i: any) => i.riskLevel === 'Medium').length,
          completed: processedAssessments.filter((a: any) => a.status === 'Completed').length,
          pending: processedAssessments.filter((a: any) => a.status !== 'Completed').length,
        }
      });

    } catch (err) {
      console.error('Error fetching risk & compliance data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return { ...data, loading, refetch: fetchData };
}
