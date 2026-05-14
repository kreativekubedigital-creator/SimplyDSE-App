import dynamic from 'next/dynamic';
import Hero from '../components/Hero';
import Trust from '../components/Trust';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ClientLayoutWrapper from '../components/ClientLayoutWrapper';

// Below the fold components - Defer loading
const FeaturesGrid = dynamic(() => import('../components/FeaturesGrid'));
const Solutions = dynamic(() => import('../components/Solutions'));
const Workflow = dynamic(() => import('../components/Workflow'));
const DashboardPreview = dynamic(() => import('../components/DashboardPreview'));
const Challenges = dynamic(() => import('../components/Challenges'));
const Security = dynamic(() => import('../components/Security'));
const Testimonials = dynamic(() => import('../components/Testimonials'));
const CTA = dynamic(() => import('../components/CTA'));
const HumanImpact = dynamic(() => import('../components/HumanImpact'));
const FAQ = dynamic(() => import('../components/FAQ'));

export default function HomePage() {
  return (
    <div className="simplydse-root min-h-screen bg-white text-text-primary selection:bg-brand-primary/10 selection:text-brand-primary overflow-x-hidden">
      <ClientLayoutWrapper>
        <main>
          <Hero />
          <Trust />
          <FeaturesGrid />
          <div className="bg-slate-50 border-y border-border-subtle">
            <DashboardPreview />
          </div>
          <Workflow />
          <Challenges />
          <Solutions />
          <HumanImpact />
          <div className="bg-bg-light border-y border-border-subtle">
            <Security />
          </div>
          <Testimonials />
          <FAQ />
          <CTA />
        </main>
      </ClientLayoutWrapper>
      <Footer />
    </div>
  );
}
