import { ShieldCheck, Lock, Server, Eye } from 'lucide-react';
import Reveal from './ui/Reveal';

const Security = () => {
  const securityFeatures = [
    {
      title: "Data Sovereignty",
      description: "GDPR compliant by design. Data is stored in region-locked, encrypted environments with strict access controls.",
      icon: Lock
    },
    {
      title: "Enterprise Encryption",
      description: "AES-256 at rest and TLS 1.3 in transit. Your Organisational data is shielded by industry-leading standards.",
      icon: ShieldCheck
    },
    {
      title: "Operational Uptime",
      description: "Cloud-native architecture with 99.99% guaranteed uptime and redundant failover systems.",
      icon: Server
    },
    {
      title: "Full Auditability",
      description: "Detailed system logs and user access trails provide total transparency for internal or external audits.",
      icon: Eye
    }
  ];

  return (
    <section id="security" className="bg-bg-muted">
      <div className="section-container">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-2xl">
            <Reveal delay={0.1}>
              <span className="badge-enterprise">Security & Compliance</span>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mt-6 tracking-tight leading-tight text-balance">
                Built for the <span className="text-brand-primary">most regulated</span> environments.
              </h2>
            </Reveal>
          </div>
          
          <Reveal delay={0.3}>
            <div className="flex flex-wrap gap-4 items-center">
              {["SOC2 Type II", "GDPR", "ISO 27001", "HIPAA"].map((cert, i) => (
                <div key={i} className="px-4 py-2 bg-white border border-border-strong rounded-full text-[11px] font-bold text-text-muted tracking-widest uppercase">
                  {cert}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityFeatures.map((item, i) => (
            <Reveal key={i} delay={0.4 + i * 0.1} direction="up" hFull>
              <div className="card-enterprise h-full group bg-white/50 backdrop-blur-sm border-white">
                <div className="w-10 h-10 rounded-full bg-brand-primary/5 text-brand-primary flex items-center justify-center mb-8 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-text-secondary leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Security;
