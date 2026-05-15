'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from './ui/Reveal';
import { Plus, Minus } from 'lucide-react';

const FAQItem = ({ title, content, isOpen, onClick }: { title: string, content: string, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-b border-slate-800 last:border-0">
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between py-8 text-left group transition-all"
      >
        <span className={`text-xl md:text-2xl font-bold transition-colors ${isOpen ? 'text-brand-primary' : 'text-white group-hover:text-white/80'}`}>
          {title}
        </span>
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isOpen ? 'bg-brand-primary border-brand-primary text-white rotate-180' : 'border-slate-700 text-slate-400 group-hover:border-slate-500'}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-8 pr-12">
              <p className="text-lg text-white/90 leading-relaxed max-w-4xl">
                {content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqData = [
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
    <section id="faq" className="bg-black border-t border-slate-900">
      <div className="section-container">
        <div className="grid lg:grid-cols-12 gap-20">
          {/* Header Side */}
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <span className="badge-enterprise">Questions & Answers</span>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="text-5xl md:text-7xl font-bold text-white mt-8 tracking-tighter leading-[0.95]">
                Common <br />
                <span className="text-slate-300">Inquiries.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-xl text-white/90 mt-12 leading-relaxed max-w-md">
                Everything you need to know about our platform, security standards, and deployment process.
              </p>
            </Reveal>
          </div>

          {/* FAQ Side */}
          <div className="lg:col-span-7">
            <Reveal delay={0.4} direction="up">
              <div className="border-t border-slate-800">
                {faqData.map((item, index) => (
                  <FAQItem 
                    key={index}
                    title={item.title}
                    content={item.content}
                    isOpen={openIndex === index}
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
