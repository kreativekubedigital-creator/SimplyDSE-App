import { useState } from 'react';
import Section from './ui/Section';
import Heading from './ui/Heading';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Input from './ui/Input';
import Table, { TableRow, TableCell } from './ui/Table';
import Tabs from './ui/Tabs';
import Alert from './ui/Alert';
import Reveal from './ui/Reveal';
import { Shield, Zap, BarChart3, Search, Mail, ArrowRight } from 'lucide-react';

const DesignSystem = () => {
  const [activeTab, setActiveTab] = useState('components');

  const tabs = [
    { id: 'components', label: 'Core Components' },
    { id: 'data', label: 'Data Display' },
    { id: 'forms', label: 'Forms & Inputs' },
    { id: 'feedback', label: 'Feedback' },
  ];

  return (
    <div className="pt-24 bg-white min-h-screen">
      <Section>
        <Reveal delay={0.1}>
          <Badge variant="primary">Design System v2.0</Badge>
        </Reveal>
        <Reveal delay={0.2}>
          <Heading level={1} className="mt-8 mb-6 text-7xl font-bold tracking-tight">System <span className="text-brand-primary">Architecture.</span></Heading>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="text-text-secondary max-w-2xl text-xl font-medium leading-relaxed opacity-80">
            A high-fidelity library of operational UI components engineered for the SimplyDSE platform.
            Built on a foundation of calm intelligence and enterprise-grade scalability.
          </p>
        </Reveal>

        <div className="mt-16">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </Section>

      {activeTab === 'components' && (
        <>
          <Section className="pt-20">
            <div className="mb-12">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Actions</h3>
              <Heading level={2}>Buttons & Interactivity</Heading>
            </div>
            <div className="flex flex-wrap gap-6 items-center">
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="outline">Outline Style</Button>
              <Button variant="ghost">Ghost Style</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary">
                Icon Support <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Section>

          <Section className="pt-20">
            <div className="mb-12">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Surface</h3>
              <Heading level={2}>Enterprise Cards</Heading>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="card-enterprise">
                <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-brand-primary" />
                </div>
                <h4 className="text-xl font-bold mb-3 tracking-tight">Standard Card</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  The default container for information modules across the dashboard.
                </p>
              </Card>
              <Card className="card-enterprise-dark">
                <div className="w-12 h-12 rounded-xl bg-brand-primary flex items-center justify-center mb-6 text-white">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold mb-3 tracking-tight text-white">Dark Variant</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Used for high-priority features or distinct platform sections.
                </p>
              </Card>
              <div className="card-enterprise bg-slate-50 border-0">
                <div className="w-12 h-12 rounded-xl bg-white border border-border-subtle flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold mb-3 tracking-tight">Muted Card</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Lower contrast surface for secondary data or background content.
                </p>
              </div>
            </div>
          </Section>
        </>
      )}

      {activeTab === 'data' && (
        <Section className="pt-20">
          <div className="mb-12">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Data Visualization</h3>
            <Heading level={2}>Tables & Lists</Heading>
          </div>
          <Table headers={['User', 'Location', 'Status', 'Risk Score', '']}>
            {[
              { name: 'Sarah Jenkins', loc: 'London, UK', status: 'Optimal', score: '98.4%', variant: 'success' },
              { name: 'Marcus Miller', loc: 'Berlin, DE', status: 'Warning', score: '72.1%', variant: 'warning' },
              { name: 'Elena Rodriguez', loc: 'Madrid, ES', status: 'Optimal', score: '94.2%', variant: 'success' },
            ].map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-bold">{row.name}</TableCell>
                <TableCell className="text-text-muted">{row.loc}</TableCell>
                <TableCell>
                  <Badge variant={row.variant as any}>{row.status}</Badge>
                </TableCell>
                <TableCell className="font-mono">{row.score}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Section>
      )}

      {activeTab === 'forms' && (
        <Section className="pt-20">
          <div className="mb-12">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Inputs</h3>
            <Heading level={2}>Form Controls</Heading>
          </div>
          <div className="max-w-2xl space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <Input label="First Name" placeholder="Jane" />
              <Input label="Last Name" placeholder="Doe" />
            </div>
            <Input label="Email Address" type="email" placeholder="jane@enterprise.com" icon={Mail} />
            <Input label="Organisation ID" value="SD-942-X" error="Verification pending for this ID" />
            
            <div className="p-8 bg-slate-50 rounded-2xl border border-border-subtle space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted">Quick Search</h4>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  className="w-full bg-white border border-border-strong rounded-full px-12 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
                  placeholder="Search analytics, users, or reports..."
                />
                <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-border-subtle bg-slate-50 text-[10px] font-bold text-text-muted">⌘K</kbd>
              </div>
            </div>
          </div>
        </Section>
      )}

      {activeTab === 'feedback' && (
        <Section className="pt-20 pb-40">
          <div className="mb-12">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Communication</h3>
            <Heading level={2}>Alerts & Status</Heading>
          </div>
          <div className="grid gap-6 max-w-3xl">
            <Alert type="info" title="System Maintenance">
              Global assessment services will be offline for 15 minutes at 02:00 UTC for a scheduled intelligence update.
            </Alert>
            <Alert type="success" title="Verification Successful">
              All 1,240 workstations have been successfully synchronized with the SOC2 compliance layer.
            </Alert>
            <Alert type="warning" title="High Risk Detected">
              Automatic escalations have been triggered for 4 users in the North American region due to persistent ergonomic violations.
            </Alert>
          </div>
        </Section>
      )}
    </div>
  );
};

export default DesignSystem;
