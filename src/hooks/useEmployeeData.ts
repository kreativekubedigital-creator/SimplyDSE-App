import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchEmployeeAssignmentsForCurrentUser } from '@/app/actions/employee-assignment-actions';

const formatDate = (dateStr: any, fallback: string = 'N/A') => {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) return fallback;
  return d.toLocaleDateString();
};

const formatDateTime = (dateStr: any, fallback: string = 'Recent') => {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) return fallback;
  return d.toLocaleString();
};

const isActiveAssignment = (status: string | null | undefined) => {
  return status !== 'completed' && status !== 'cancelled' && status !== 'archived';
};

export function useEmployeeData() {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    compliance: 0,
    completedCount: 0,
    totalCount: 0,
    nextDue: 'N/A',
    dueInDays: 0,
    riskLevel: 'None',
    pendingTasks: 0
  });
  const [progressData, setProgressData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    healthScore: 0,
    healthTrend: '0%',
    isPositiveTrend: true,
    postureRating: 'Pending',
    breakAdherence: '0%',
    historicalData: [] as any[],
    categoryBreakdown: [] as any[]
  });

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      // Fetch assignments through a server action so pre-provisioned profile,
      // auth user, and employee table identifiers resolve to the same person.
      const assignmentResult = await fetchEmployeeAssignmentsForCurrentUser();
      if (!assignmentResult.success) throw new Error(assignmentResult.error);
      const assignmentRecords = assignmentResult.assignments || [];
      const employeeIds = assignmentResult.employeeIds?.length ? assignmentResult.employeeIds : [user.id];

      // 1. Fetch user's assessments with reports and assignments
      const { data: records, error } = await supabase
        .from('assessments')
        .select(`
          *,
          assessment_reports (
            id,
            email_status,
            report_status
          ),
          assessment_assignments (
            id,
            due_date,
            assigned_at,
            status
          )
        `)
        .in('user_id', employeeIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process assessments for UI
      const processedAssessments = records.map((rec: any) => {
        let displayTitle = rec.type;
        
        // Clean up titles
        if (rec.type === 'dse_workstation' || rec.type === 'dse') displayTitle = 'DSE Assessment';
        else if (rec.type === 'Hybrid DSE Assessment') displayTitle = 'DSE Hybrid Assessment';
        else if (rec.type.includes('_')) {
          displayTitle = rec.type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }

        // Parse results summary for better display
        let subtitle = 'Self-assessment of your workstation';
        if (rec.results_summary) {
          try {
            const summary = typeof rec.results_summary === 'string' ? JSON.parse(rec.results_summary) : rec.results_summary;
            if (summary.categories) {
              const totalScore = summary.score || rec.score || 0;
              const risk = rec.risk_level || 'low';
              subtitle = `Score: ${totalScore}/100 • ${risk.charAt(0).toUpperCase() + risk.slice(1)} Risk`;
            }
          } catch (e) {
            console.error('Error parsing results summary for subtitle:', e);
          }
        }

        const report = rec.assessment_reports?.[0];
        const assignment = rec.assessment_assignments?.[0] || (assignmentRecords || []).find((a: any) => a.submission_id === rec.id);

        // Determine correct date based on completion status
        let displayDate = 'Pending';
        if (rec.status === 'completed') {
          displayDate = rec.completed_at 
            ? formatDate(rec.completed_at, 'N/A') 
            : formatDate(rec.updated_at || rec.created_at, 'N/A');
        } else {
          displayDate = formatDate(assignment?.due_date, 'No due date');
        }

        return {
          id: rec.id,
          title: displayTitle,
          subtitle: subtitle,
          status: rec.status === 'completed' ? 'Completed' : rec.status === 'in_progress' ? 'In Progress' : 'Not Started',
          progress: rec.status === 'completed' ? 100 : rec.status === 'in_progress' ? Math.round(((rec.metadata?.current_category_index || 0) / 21) * 100) : 0,
          date: displayDate,
          dateLabel: rec.status === 'completed' ? 'Completed on' : 'Due date',
          risk: rec.risk_level || 'none',
          pdfUrl: rec.metadata?.pdf_report_url || null,
          reportStatus: report?.report_status || (rec.status === 'completed' ? 'ready' : 'pending'),
          emailStatus: report?.email_status || 'not_sent'
        };
      });

      setAssessments(processedAssessments);

      // Process assignments for UI
      const processedAssignments = (assignmentRecords || []).map((rec: any) => ({
        id: rec.id,
        templateId: rec.assessment_template_id,
        title: rec.assessment_templates?.name || 'Assigned Assessment',
        description: rec.assessment_templates?.description || '',
        status: rec.status,
        dueDate: formatDate(rec.due_date, 'No due date'),
        assignedAt: formatDate(rec.assigned_at, 'N/A'),
        submissionId: rec.submission_id,
        version: rec.assessment_templates?.version || '1.0'
      }));

      setAssignments(processedAssignments);

      // 2. Calculate stats
      const completed = records.filter((r: any) => r.status === 'completed');
      const pending = records.filter((r: any) => r.status !== 'completed');
      const activeAssignments = processedAssignments.filter(a => isActiveAssignment(a.status));
      const compliance = records.length > 0 ? Math.round((completed.length / records.length) * 100) : 0;
      
      const latestRisk = records[0]?.risk_level || 'Low';
      
      setStats({
        compliance,
        completedCount: completed.length,
        totalCount: records.length,
        nextDue: activeAssignments[0]?.dueDate || 'TBD',
        dueInDays: 0,
        riskLevel: latestRisk.charAt(0).toUpperCase() + latestRisk.slice(1),
        pendingTasks: activeAssignments.length || pending.length
      });

      // 3. Mock progress breakdown
      const mockProgress = [
        { name: 'Assessments', value: compliance, color: '#10B981' },
        { name: 'Ergonomics Training', value: 0, color: '#3B82F6' },
        { name: 'Recommendations', value: 0, color: '#8B5CF6' },
      ];
      setProgressData(mockProgress);

      // 4. Recent activity
      const recentActivities = records.slice(0, 4).map((rec: any) => ({
        text: `${rec.status === 'completed' ? 'Completed' : 'Updated'} ${rec.type.toUpperCase()} Assessment`,
        time: formatDateTime(rec.updated_at || rec.created_at, 'Recent'),
        type: rec.status === 'completed' ? 'success' : 'info'
      }));
      setActivities(recentActivities);

      // 5. Upcoming tasks
      const upcoming = records.filter((r: any) => r.status !== 'completed').map((r: any) => {
        const assignment = r.assessment_assignments?.[0] || (assignmentRecords || []).find((a: any) => a.submission_id === r.id);
        return {
          title: r.type === 'dse' || r.type === 'dse_workstation' ? 'DSE Assessment' : 'Workstation Review',
          date: assignment?.due_date ? formatDate(assignment.due_date, 'No due date') : formatDate(r.created_at, 'TBD'),
          due: 'Action Required',
          priority: r.risk_level === 'high' ? 'High' : 'Medium'
        };
      });
      setUpcomingTasks(upcoming);

      // 6. Analytics
      const latestCompleted = completed[0];
      const healthScore = latestCompleted?.score || 0;
      
      // Calculate Trend
      let healthTrend = '0%';
      let isPositiveTrend = true;
      if (completed.length > 1) {
        const prevScore = completed[1].score || 0;
        const diff = healthScore - prevScore;
        healthTrend = `${diff >= 0 ? '+' : ''}${diff}% this month`;
        isPositiveTrend = diff >= 0;
      }

      // Category Breakdown
      let catBreakdown: any[] = [];
      if (latestCompleted?.results_summary) {
        try {
          const summary = typeof latestCompleted.results_summary === 'string' 
            ? JSON.parse(latestCompleted.results_summary) 
            : latestCompleted.results_summary;
          
          if (summary.categories) {
            catBreakdown = summary.categories.map((c: any) => ({
              name: c.name,
              value: Math.round((c.score / 20) * 100), // Assuming max cat score is 20 for scaling
              color: c.riskLevel === 'critical' ? '#EF4444' : c.riskLevel === 'high' ? '#F59E0B' : '#10B981'
            }));
          }
        } catch (e) {
          console.error('Error parsing results summary:', e);
        }
      }

      // Posture Rating
      const postureRating = healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Good' : healthScore > 40 ? 'Fair' : 'Needs Attention';

      // Historical Data
      const historical = completed.slice(0, 5).reverse().map((r: any) => {
        const d = new Date(r.created_at);
        return {
          month: r.created_at && !isNaN(d.getTime()) && d.getFullYear() > 1970
            ? d.toLocaleDateString('en-GB', { month: 'short' })
            : 'N/A',
          score: r.score,
          avg: 70
        };
      });

      setAnalytics({
        healthScore,
        healthTrend,
        isPositiveTrend,
        postureRating,
        breakAdherence: `${Math.min(95, healthScore + 5)}%`,
        historicalData: historical,
        categoryBreakdown: catBreakdown.length > 0 ? catBreakdown : mockProgress
      });

    } catch (err) {
      console.error('Error fetching employee dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  return {
    loading,
    assessments,
    assignments,
    stats,
    progressData,
    activities,
    upcomingTasks,
    analytics,
    refresh: fetchEmployeeData,
    exportData: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        const { data: records } = await supabase
          .from('assessments')
          .select('*, assessment_responses(*)')
          .eq('user_id', user.id);

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", `simplydse_data_export_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      } catch (err) {
        console.error('Error exporting data:', err);
      }
    }
  };
}
