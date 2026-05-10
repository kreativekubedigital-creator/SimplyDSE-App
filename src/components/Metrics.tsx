import Reveal from './ui/Reveal';
import { TrendingUp, Users, ShieldCheck, Activity, ArrowUpRight } from 'lucide-react';

const stats = [
  { 
    label: "Compliance Coverage", 
    value: "99.94%", 
    trend: "+0.12%",
    status: "Optimal",
    icon: ShieldCheck,
    color: "text-emerald-500",
    chart: [30, 40, 35, 50, 45, 60, 55, 70]
  },
  { 
    label: "Assessments Velocity", 
    value: "248k", 
    trend: "+12.4%",
    status: "Accelerated",
    icon: Activity,
    color: "text-brand-primary",
    chart: [20, 25, 40, 30, 45, 50, 65, 80]
  },
  { 
    label: "Org. Resilience", 
    value: "94.2", 
    trend: "+2.1",
    status: "Stable",
    icon: Users,
    color: "text-slate-900",
    chart: [50, 52, 48, 55, 58, 60, 62, 65]
  },
  { 
    label: "Global Uptime", 
    value: "100%", 
    trend: "Static",
    status: "Verified",
    icon: TrendingUp,
    color: "text-emerald-500",
    chart: [80, 80, 80, 80, 80, 80, 80, 80]
  }
];

const MiniChart = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d / max) * 100}`).join(' ');
  
  return (
    <svg className="w-full h-8 opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={color}
        points={points}
      />
    </svg>
  );
};

const Metrics = () => {
  return (
    <section className="bg-white border-y border-border-subtle py-24">
      <div className="section-container">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <Reveal delay={0.1}>
            <span className="badge-enterprise">Operational Intelligence</span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mt-6 tracking-tight">
              Real-time compliance <span className="text-slate-300">metrics.</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={0.1 * i} direction="up" hFull>
              <div className="card-enterprise h-full group">
                <div className="flex justify-between items-start mb-10">
                  <div className={`w-10 h-10 rounded-xl bg-slate-50 border border-border-subtle flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="label-secondary !text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.trend}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-4xl font-bold text-text-primary tracking-tighter">
                    {stat.value}
                  </p>
                  <p className="label-secondary">
                    {stat.label}
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-border-subtle space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="label-secondary">Status</span>
                    <span className="label-secondary !text-emerald-600">{stat.status}</span>
                  </div>
                  <div className="h-6 overflow-hidden">
                    <MiniChart data={stat.chart} color={stat.color} />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Metrics;
