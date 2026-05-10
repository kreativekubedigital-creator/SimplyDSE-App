import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Trust from '../components/Trust';
import FeaturesGrid from '../components/FeaturesGrid';
import Solutions from '../components/Solutions';
import Workflow from '../components/Workflow';
import DashboardPreview from '../components/DashboardPreview';
import Challenges from '../components/Challenges';
import Security from '../components/Security';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import HumanImpact from '../components/HumanImpact';
import { getPageBySlug } from "../services/wordpress";

const Home = () => {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming your homepage slug in WordPress is 'home'
    getPageBySlug('home').then((data) => {
      if (data) {
        setPageData(data.acf); // ACF fields are usually under the 'acf' key
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main>
      {/* Section 1: Hero */}
      <Hero data={pageData?.hero} />
      
      {/* Section 2: Trust (White) */}
      <Trust data={pageData?.trust} />

      {/* Section 3: New Features Grid (Black) */}
      <FeaturesGrid />

      {/* Section 4: Workflow (Dark) */}
      <Workflow />

      {/* Section 5: Challenges (White) */}
      <Challenges data={pageData?.challenges} />

      <Solutions />

      <HumanImpact data={pageData?.human_impact} />

      {/* Section 6: Dashboard Preview */}
      <div className="bg-slate-50 border-y border-border-subtle">
        <DashboardPreview />
      </div>

      {/* Section 7: Security */}
      <div className="bg-bg-light border-y border-border-subtle">
        <Security />
      </div>

      {/* Section 8: Testimonials */}
      <Testimonials />

      <CTA />
    </main>
  );
};


export default Home;
