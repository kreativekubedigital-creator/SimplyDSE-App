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

      // Fetch all assignments for this org
      const { data: assignments, error } = await supabase
        .from('assessment_assignments')
        .select(`
          *,
          profiles:employee_id(id, full_name, email, department, employee_id_official),
          template:assessment_template_id(id, name, version),
          assessment:submission_id(id, status, risk_level, score, completed_at, metadata, results_summary)
        `)
        .eq('organization_id', organizationId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      const processedItems = (assignments || []).map((rec: any) => {
        const isOverdue = rec.due_date && new Date(rec.due_date) < new Date() && rec.status !== 'completed';
        
        // Completion logic
        let completion = 0;
        if (rec.status === 'completed' || (rec.assessment && rec.assessment.status === 'completed')) {
          completion = 100;
        } else if (rec.status === 'in_progress' || (rec.assessment && rec.assessment.status === 'in_progress')) {
          // Estimate progress based on metadata if available, otherwise 50%
          const meta = rec.assessment?.metadata as any;
          if (meta?.current_category_index !== undefined) {
            completion = Math.round((meta.current_category_index / 21) * 100);
          } else {
            completion = 30; // Started but no progress record
          }
        }

        return {
          id: rec.id,
          employeeId: rec.employee_id,
          employeeIdOfficial: rec.profiles?.employee_id_official,
          employeeName: rec.profiles?.full_name || rec.profiles?.email || 'Unnamed Employee',
          employeeEmail: rec.profiles?.email,
          department: rec.profiles?.department || 'General',
          assessmentName: rec.template?.name || 'DSE Assessment',
          assessmentVersion: rec.template?.version || '1.0',
          assignedAt: rec.assigned_at,
          dueDate: rec.due_date,
          status: isOverdue ? 'Overdue' : rec.status.charAt(0).toUpperCase() + rec.status.slice(1).replace('_', ' '),
          rawStatus: rec.status,
          isOverdue,
          riskLevel: rec.assessment?.risk_level ? rec.assessment.risk_level.charAt(0).toUpperCase() + rec.assessment.risk_level.slice(1) : (rec.status === 'completed' ? 'Low' : 'Pending'),
          rawRisk: rec.assessment?.risk_level,
          score: rec.assessment?.score,
          completion,
          completedAt: rec.assessment?.completed_at,
          pdfUrl: rec.assessment?.metadata?.pdf_report_url || null,
          assessmentId: rec.submission_id,
          assessmentTemplateId: rec.assessment_template_id,
          assignedBy: rec.assigned_by
        };
      });

      const riskIncidents = processedItems.filter((a: any) => 
        a.rawRisk === 'high' || a.rawRisk === 'critical' || a.rawRisk === 'medium'
      );

      setData({
        assessments: processedItems,
        risks: riskIncidents,
        stats: {
          critical: processedItems.filter((i: any) => i.rawRisk === 'critical').length,
          high: processedItems.filter((i: any) => i.rawRisk === 'high').length,
          completed: processedItems.filter((a: any) => a.rawStatus === 'completed').length,
          pending: processedItems.filter((a: any) => a.rawStatus === 'assigned').length,
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
