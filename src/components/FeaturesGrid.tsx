import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from './ui/Reveal';
import { Plus, Minus, ArrowRight } from 'lucide-react';

const AccordionItem = ({ title, content, isOpen, onClick }: { title: string, content: string, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="mb-4">
      <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 ${isOpen ? 'bg-white text-slate-900 shadow-md' : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'}`}
      >
        <span className="text-[15px] font-bold text-left">{title}</span>
        {isOpen ? <Minus className="w-4 h-4 shrink-0" /> : <Plus className="w-4 h-4 shrink-0" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-6 mt-2 bg-white rounded-2xl border border-slate-100 shadow-lg flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-1">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
              <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                {content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FeaturesGrid = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const accordionData = [
    {
      title: "What is a DSE Assessment?",
      content: "A Display Screen Equipment (DSE) assessment evaluates how employees interact with their workstations, identifying risks related to posture, equipment, and environment. It helps prevent issues such as musculoskeletal disorders and ensures compliance with workplace health and safety regulations."
    },
    {
      title: "Who is SimplyDSE for?",
      content: "SimplyDSE is built for organisations of all sizes, including HR teams, compliance managers, and business owners who need a structured way to manage employee assessments across multiple teams or locations."
    },
    {
      title: "How does SimplyDSE ensure data security?",
      content: "The platform uses a secure multi-Workspace architecture where each company's data is isolated. Access is role-based, ensuring only authorised users can view or manage relevant information within their organisation."
    },
    {
      title: "Can SimplyDSE support remote and hybrid teams?",
      content: "Yes. SimplyDSE is designed to support office-based, remote, and hybrid work environments. Employees can complete assessments from anywhere, ensuring consistent compliance regardless of location."
    }
  ];

  return (
    <section className="bg-black text-white py-32 overflow-hidden">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-24">
          <Reveal>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              Simplifying DSE Assessment
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              SimplyDSE is a web-based platform designed to help organisations manage 
              Display Screen Equipment (DSE) assessments efficiently, securely, and at scale.
            </p>
          </Reveal>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]">
          
          {/* Left Column - Smart Assessment & Notifications */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Smart Assessment */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 flex flex-col h-full hover:border-white/20 transition-colors">
              <h3 className="text-2xl font-bold mb-4">Smart Assessment System</h3>
              <p className="text-white/60 text-[15px] leading-relaxed mb-8">
                Structured questionnaires with automated scoring and clear risk classification, 
                helping organisations quickly identify and address potential ergonomic issues.
              </p>
              <div className="mt-auto rounded-2xl overflow-hidden aspect-[4/3] bg-white/5">
                <img 
                  src="/features-1.png" 
                  alt="Modern office" 
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>

            {/* Automated Notifications */}
            <div className="bg-[#F1F5F9] rounded-[2.5rem] p-8 text-slate-900 shadow-xl">
              <h3 className="text-2xl font-bold mb-4">Automated Notifications</h3>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                Send assessment invitations, reminders, and follow-ups automatically, 
                reducing manual effort and ensuring higher completion rates across organisations.
              </p>
            </div>
          </div>

          {/* Center Column - Interactive Accordion */}
          <div className="md:col-span-4">
            <div className="h-full rounded-[2.5rem] p-8 bg-[#111827] border border-white/10 flex flex-col shadow-2xl relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 blur-[100px]" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-8 text-white">Understanding the Platform</h3>
                
                <div className="space-y-4">
                  {accordionData.map((item, index) => (
                    <AccordionItem 
                      key={index}
                      title={item.title}
                      content={item.content}
                      isOpen={openIndex === index}
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mt-auto pt-8 border-t border-white/5 relative z-10">
                <p className="text-xs text-white/40 font-medium italic">
                  Interactive knowledge base for enterprise deployment.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard & Secure Access */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Dashboard & Reporting */}
            <div className="bg-[#F1F5F9] rounded-[2.5rem] p-8 text-slate-900 shadow-xl">
              <h3 className="text-2xl font-bold mb-4">Dashboard & Reporting</h3>
              <p className="text-slate-600 text-[15px] leading-relaxed">
                Monitor assessment progress, track completion rates, and view risk insights in 
                real time with easy-to-export reports for compliance and decision-making.
              </p>
            </div>

            {/* Secure User Access */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 flex flex-col h-full hover:border-white/20 transition-colors">
              <h3 className="text-2xl font-bold mb-4">Secure User Access</h3>
              <p className="text-white/60 text-[15px] leading-relaxed mb-8">
                Role-based access control ensures HR teams and staff only access relevant data, 
                maintaining privacy, security, and proper organisational boundaries.
              </p>
              <div className="mt-auto rounded-2xl overflow-hidden aspect-[4/3] bg-white/5">
                <img 
                  src="/features-3.png" 
                  alt="Data security" 
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
