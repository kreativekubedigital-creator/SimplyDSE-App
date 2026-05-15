import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch user's assessments
      const { data: records, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 1b. Fetch user's assignments
      const { data: assignmentRecords, error: assignError } = await supabase
        .from('assessment_assignments')
        .select(`
          *,
          assessment_templates (
            name,
            description,
            version
          )
        `)
        .eq('employee_id', user.id)
        .order('assigned_at', { ascending: false });

      if (assignError) throw assignError;

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

        return {
          id: rec.id,
          title: displayTitle,
          subtitle: subtitle,
          status: rec.status === 'completed' ? 'Completed' : rec.status === 'in_progress' ? 'In Progress' : 'Not Started',
          progress: rec.status === 'completed' ? 100 : rec.status === 'in_progress' ? Math.round(((rec.metadata?.current_category_index || 0) / 21) * 100) : 0,
          date: rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'Pending',
          dateLabel: rec.status === 'completed' ? 'Completed on' : 'Due date',
          risk: rec.risk_level || 'none',
          pdfUrl: rec.metadata?.pdf_report_url || null
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
        dueDate: rec.due_date ? new Date(rec.due_date).toLocaleDateString() : 'No due date',
        assignedAt: new Date(rec.assigned_at).toLocaleDateString(),
        submissionId: rec.submission_id,
        version: rec.assessment_templates?.version || '1.0'
      }));

      setAssignments(processedAssignments);

      // 2. Calculate stats
      const completed = records.filter((r: any) => r.status === 'completed');
      const pending = records.filter((r: any) => r.status !== 'completed');
      const activeAssignments = processedAssignments.filter(a => a.status !== 'completed');
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
        time: new Date(rec.updated_at || rec.created_at).toLocaleString(),
        type: rec.status === 'completed' ? 'success' : 'info'
      }));
      setActivities(recentActivities);

      // 5. Upcoming tasks
      const upcoming = records.filter((r: any) => r.status !== 'completed').map((r: any) => ({
        title: r.type === 'dse' ? 'DSE Assessment' : 'Workstation Review',
        date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'TBD',
        due: 'Action Required',
        priority: r.risk_level === 'high' ? 'High' : 'Medium'
      }));
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
      const historical = completed.slice(0, 5).reverse().map((r: any) => ({
        month: new Date(r.created_at).toLocaleDateString('en-GB', { month: 'short' }),
        score: r.score,
        avg: 70
      }));

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
        const { data: { user } } = await supabase.auth.getUser();
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
