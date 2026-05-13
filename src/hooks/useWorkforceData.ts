import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const { data: emps, error } = await supabase
        .from('profiles')
        .select(`
          *,
          assessments(status, risk_level, score, completed_at)
        `)
        .eq('organization_id', profile.organization_id)
        .order('full_name', { ascending: true });

      if (error) throw error;

      const processedEmps = emps.map((emp: any) => {
        const latestAssessment = emp.assessments?.sort((a: any, b: any) => 
          new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
        )[0];

        return {
          id: emp.id.substring(0, 8).toUpperCase(),
          name: emp.full_name || emp.email || 'Unnamed',
          email: emp.email,
          department: 'General',
          complianceScore: latestAssessment?.score || 0,
          status: latestAssessment ? (latestAssessment.status === 'completed' ? 'Active' : 'In Progress') : 'Not Started',
          riskLevel: latestAssessment?.risk_level === 'high' ? 'High' : latestAssessment?.risk_level === 'medium' ? 'Medium' : 'Low',
          lastAssessment: latestAssessment ? new Date(latestAssessment.completed_at).toLocaleDateString() : 'Never'
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
