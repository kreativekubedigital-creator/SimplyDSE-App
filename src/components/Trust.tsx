'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from './ui/Reveal';
import Image from 'next/image';

interface TrustProps {
  headline?: string;
}

const Trust = ({ headline }: TrustProps) => {
  const allLogos = [
    { src: '/011%20(1).png', alt: 'AdvT' },
    { src: '/011%20(2).png', alt: 'Senedd Cymru Welsh Parliament' },
    { src: '/011%20(3).png', alt: 'Virtusa' },
    { src: '/011%20(4).png', alt: 'Vidett' },
    { src: '/011%20(5).png', alt: "Lloyd's List Intelligence" },
    { src: '/011%20(6).png', alt: 'Elliptic' },
    { src: '/011%20(7).png', alt: 'Barnett Waddingham' },
    { src: '/011%20(8).png', alt: 'Banking Circle' },
    { src: '/011%20(9).png', alt: 'Alstom' },
    { src: '/011%20(10).png', alt: 'SO Energy' },
  ];

  const [index, setIndex] = useState(0);
  const rows = [
    allLogos.slice(0, 5),
    allLogos.slice(5, 10)
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % rows.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [rows.length]);

  return (
    <section id="trust" className="bg-white border-b border-border-subtle overflow-hidden">
      <div className="section-container !py-10">
        <Reveal delay={0.1} width="100%">
          <div className="text-center mb-10">
            <span className="label-secondary tracking-[0.3em] opacity-80">
              {headline || "Trusted by Global Enterprise Leaders"}
            </span>
          </div>
        </Reveal>

        <div className="relative h-20 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="flex justify-center items-center w-full grayscale opacity-60 px-4 gap-12 md:gap-24"
            >
              {rows[index].map((logo, i) => (
                <div key={i} className="flex-none relative h-10 md:h-12 w-32">
                  <Image 
                    src={logo.src} 
                    alt={logo.alt} 
                    fill
                    className="object-contain hover:opacity-100 transition-opacity"
                    sizes="128px"
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Trust;
