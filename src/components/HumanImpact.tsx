'use client';

import Reveal from './ui/Reveal';
import Image from 'next/image';

interface HumanImpactProps {
  badge?: string;
  headline?: string;
  items?: {
    src: string;
    title: string;
    desc: string;
  }[];
}

const HumanImpact = ({ badge, headline, items }: HumanImpactProps) => {
  const defaultImages = [
    {
      src: '/collaboration.png',
      title: "Collaborative Safety",
      desc: "Teams working together to ensure a safer workplace environment."
    },
    {
      src: '/operational_excellence.png',
      title: "Precision Execution",
      desc: "Methodical approach to compliance that leaves no room for error."
    },
    {
      src: '/compliance_officer.png',
      title: "Compliance Leadership",
      desc: "Empowering safety leaders with the data they need to drive change."
    },
    {
      src: '/support.png',
      title: "Expert Support",
      desc: "Clinical ergonomic experts available whenever your team needs them."
    }
  ];

  const images = items || defaultImages;

  return (
    <section className="bg-slate-50">
      <div className="section-container">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <Reveal delay={0.1}>
            <span className="badge-enterprise">{badge || "The Human Element"}</span>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="text-5xl md:text-6xl font-bold text-text-primary mt-6 tracking-tight leading-[1.05]"
                dangerouslySetInnerHTML={{ __html: headline || "Technology that <br class=\"hidden md:block\" /> <span class=\"text-brand-primary\">empowers people.</span>" }}
            />
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((img, i) => (
            <Reveal key={i} delay={0.2 + i * 0.1} direction="up" hFull>
              <div className="group relative rounded-[2rem] overflow-hidden border border-border-subtle aspect-[3/4] bg-bg-muted">
                <Image 
                  src={img.src} 
                  alt={img.title}
                  fill
                  className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2000ms]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <h3 className="text-xl font-bold mb-2 tracking-tight">{img.title}</h3>
                  <p className="text-sm text-white/95 leading-relaxed">{img.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HumanImpact;
