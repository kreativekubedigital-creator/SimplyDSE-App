import Reveal from '../components/ui/Reveal';

const About = () => {
  return (
    <main className="pt-32">
      <section className="py-24 bg-white">
        <div className="section-container">
          <Reveal>
            <span className="badge-enterprise">Our Story</span>
            <h1 className="text-5xl md:text-7xl font-bold text-text-primary mt-6 tracking-tight leading-[1.1]">
              Redefining <span className="text-brand-primary">Workplace Compliance.</span>
            </h1>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mt-20">
            <Reveal delay={0.2}>
              <p className="text-xl text-text-secondary leading-relaxed font-medium">
                At SimplyDSE, we believe that health and safety shouldn't be a bureaucratic burden. 
                Our mission is to empower organisations with intelligent tools that protect their 
                most valuable asset: their people.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-xl text-text-secondary leading-relaxed font-medium">
                Born from the need for a more scalable and user-friendly approach to DSE assessments, 
                our platform combines clinical expertise with cutting-edge technology to deliver 
                measurable impact on employee wellbeing.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mission / Values */}
      <section className="py-24 bg-slate-50 border-y border-border-subtle">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Simplicity", desc: "Complex regulations made easy through intuitive design and automated workflows." },
              { title: "Integrity", desc: "Clinical oversight at the core of every assessment, ensuring true health outcomes." },
              { title: "Scale", desc: "Built for global enterprises, handling thousands of assessments with zero friction." }
            ].map((value, i) => (
              <Reveal key={i} delay={0.1 * i}>
                <div className="p-8 bg-white border border-border-subtle rounded-[2rem] shadow-sm">
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{value.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
