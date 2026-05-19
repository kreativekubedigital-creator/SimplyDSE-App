import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getTenantContext } from '@/lib/tenant-context';

const parseValidDate = (value: any) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() <= 1970) return null;
  return date;
};

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

  async function fetchData(active: boolean, force = false) {
    try {
      setLoading(true);
      const { organizationId } = await getTenantContext({ forceRefresh: force });

      if (!active) return;

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
      if (!active) return;

      const processedItems = (assignments || []).map((rec: any) => {
        const dueDate = parseValidDate(rec.due_date);
        const isCompleted = rec.status === 'completed' || rec.assessment?.status === 'completed';
        const isOverdue = !!dueDate && dueDate < new Date() && !isCompleted;
        
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
          dueDate: dueDate?.toISOString() || null,
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

      // Calculate Department Stats
      const depts = Array.from(new Set(processedItems.map(i => i.department))).filter(Boolean);
      const departmentStats = depts.map(dept => {
        const deptItems = processedItems.filter(i => i.department === dept);
        const completed = deptItems.filter(i => i.rawStatus === 'completed').length;
        const compliance = Math.round((completed / deptItems.length) * 100);
        return { name: dept, compliance, risk: 100 - compliance };
      }).sort((a, b) => b.compliance - a.compliance);

      // Calculate Trend Stats (Last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const trendStats = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = months[date.getMonth()];
        const year = date.getFullYear();
        const month = date.getMonth();

        // Calculate compliance for assignments assigned up to this month
        const upToThisMonthItems = processedItems.filter(item => {
          const itemDate = parseValidDate(item.assignedAt);
          if (!itemDate) return false;
          return itemDate.getFullYear() < year || (itemDate.getFullYear() === year && itemDate.getMonth() <= month);
        });

        const score = upToThisMonthItems.length > 0 
          ? Math.round((upToThisMonthItems.filter(i => i.rawStatus === 'completed').length / upToThisMonthItems.length) * 100)
          : 0;

        trendStats.push({ month: monthLabel, score });
      }

      // Calculate trend percentage (current vs last month)
      let complianceTrend = "0%";
      if (trendStats.length >= 2) {
        const current = trendStats[trendStats.length - 1].score;
        const previous = trendStats[trendStats.length - 2].score;
        const diff = current - previous;
        complianceTrend = diff >= 0 ? `+${diff}%` : `${diff}%`;
      }

      setData({
        assessments: processedItems,
        risks: riskIncidents,
        departmentStats,
        trendStats,
        stats: {
          critical: processedItems.filter((i: any) => i.rawRisk === 'critical').length,
          high: processedItems.filter((i: any) => i.rawRisk === 'high').length,
          completed: processedItems.filter((a: any) => a.rawStatus === 'completed').length,
          pending: processedItems.filter((a: any) => a.rawStatus === 'assigned').length,
          inProgress: processedItems.filter((a: any) => a.rawStatus === 'in_progress').length,
          trend: complianceTrend
        }
      });

    } catch (err) {
      console.error('Error fetching risk & compliance data:', err);
    } finally {
      if (active) setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetchData(active);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active) {
        fetchData(active, true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { ...data, loading, refetch: () => fetchData(true) };
}
