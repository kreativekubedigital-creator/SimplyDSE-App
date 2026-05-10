import Reveal from '../components/ui/Reveal';
import { Mail, MessageSquare, Phone } from 'lucide-react';

const Contact = () => {
  return (
    <main className="pt-32">
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Content */}
            <div className="lg:w-1/2">
              <Reveal>
                <span className="badge-enterprise">Contact Us</span>
                <h1 className="text-5xl md:text-6xl font-bold text-text-primary mt-6 tracking-tight leading-[1.1]">
                  Let's talk about <br />
                  <span className="text-brand-primary">your compliance.</span>
                </h1>
                <p className="text-xl text-text-secondary mt-8 leading-relaxed font-medium">
                  Have questions about enterprise deployment, clinical oversight, or custom integrations? 
                  Our team of DSE experts is ready to help.
                </p>
              </Reveal>

              <div className="mt-12 space-y-6">
                {[
                  { icon: Mail, label: "Email Us", val: "hello@simplydse.com" },
                  { icon: Phone, label: "Call Us", val: "+44 (0) 20 1234 5678" },
                  { icon: MessageSquare, label: "Support", val: "24/7 Priority Ticket System" }
                ].map((item, i) => (
                  <Reveal key={i} delay={0.2 + i * 0.1}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-border-subtle flex items-center justify-center text-brand-primary">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{item.label}</p>
                        <p className="text-lg font-bold text-text-primary">{item.val}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Simple Form Placeholder */}
            <div className="lg:w-1/2">
              <Reveal delay={0.4}>
                <div className="card-enterprise p-10 bg-slate-50">
                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-text-muted">First Name</label>
                        <input type="text" className="w-full bg-white border border-border-strong rounded-xl px-4 py-3 outline-none focus:border-brand-primary transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-text-muted">Last Name</label>
                        <input type="text" className="w-full bg-white border border-border-strong rounded-xl px-4 py-3 outline-none focus:border-brand-primary transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted">Work Email</label>
                      <input type="email" className="w-full bg-white border border-border-strong rounded-xl px-4 py-3 outline-none focus:border-brand-primary transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted">Message</label>
                      <textarea rows={4} className="w-full bg-white border border-border-strong rounded-xl px-4 py-3 outline-none focus:border-brand-primary transition-colors" />
                    </div>
                    <button className="w-full btn-enterprise-primary py-4 rounded-xl font-bold">
                      Send Inquiry
                    </button>
                  </form>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
