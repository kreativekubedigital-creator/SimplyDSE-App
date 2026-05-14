import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useEmployeeData() {
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
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

      // Process assessments for UI
      const processedAssessments = records.map((rec: any) => ({
        id: rec.id,
        title: rec.type === 'dse_workstation' || rec.type === 'dse' ? 'DSE Assessment' : 'Workstation Review',
        subtitle: rec.results_summary || 'Self-assessment of your workstation',
        status: rec.status === 'completed' ? 'Completed' : rec.status === 'in_progress' ? 'In Progress' : 'Not Started',
        progress: rec.status === 'in_progress' ? 50 : rec.status === 'completed' ? 100 : 0,
        date: rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'Pending',
        dateLabel: rec.status === 'completed' ? 'Completed on' : 'Due date',
        risk: rec.risk_level || 'none',
        pdfUrl: rec.metadata?.pdf_report_url || null
      }));

      setAssessments(processedAssessments);

      // 2. Calculate stats
      const completed = records.filter((r: any) => r.status === 'completed');
      const pending = records.filter((r: any) => r.status !== 'completed');
      const compliance = records.length > 0 ? Math.round((completed.length / records.length) * 100) : 0;
      
      const latestRisk = records[0]?.risk_level || 'Low';
      
      setStats({
        compliance,
        completedCount: completed.length,
        totalCount: records.length,
        nextDue: 'TBD',
        dueInDays: 0,
        riskLevel: latestRisk.charAt(0).toUpperCase() + latestRisk.slice(1),
        pendingTasks: pending.length
      });

      // 3. Mock progress breakdown
      setProgressData([
        { name: 'Assessments', value: compliance, color: '#10B981' },
        { name: 'Ergonomics Training', value: 0, color: '#3B82F6' },
        { name: 'Recommendations', value: 0, color: '#8B5CF6' },
      ]);

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
    stats,
    progressData,
    activities,
    upcomingTasks,
    refresh: fetchEmployeeData
  };
}
