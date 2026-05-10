import Reveal from './ui/Reveal';
import getAssetPath from '../utils/wp-integration';

const Trust = () => {
  const logos = [
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

  return (
    <section id="trust" className="bg-white border-b border-border-subtle overflow-hidden">
      <div className="section-container !py-20">
        <Reveal delay={0.1}>
          <div className="label-secondary mb-16 text-center tracking-[0.2em]">
            Trusted by Global Enterprise Leaders
          </div>
        </Reveal>

        <div className="relative">
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-12 grayscale opacity-30">
            {logos.map((logo, i) => (
              <Reveal key={i} delay={0.1} direction="up">
                <img 
                  src={getAssetPath(logo.src)} 
                  alt={logo.alt} 
                  className="h-7 w-auto object-contain"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Trust;
