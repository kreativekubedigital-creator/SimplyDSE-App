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
import { getPosts } from "../services/wordpress";

const Home = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    getPosts().then((data) => {
      setPosts(data);
    });
  }, []);

  return (
    <main>
      {/* Section 1: Hero */}
      <div>
        <Hero />
      </div>
      
      {/* Section 2: Trust (White) */}
      <Trust />

      {/* Section 3: New Features Grid (Black) */}
      <FeaturesGrid />

      {/* Section 4: Workflow (Dark) */}
      <Workflow />

      {/* Section 5: Challenges (White) */}
      <Challenges />

      <Solutions />

      <HumanImpact />

      {/* Section 6: Dashboard Preview (Soft Gray/Blue Accent) */}
      <div className="bg-slate-50 border-y border-border-subtle">
        <DashboardPreview />
      </div>

      {/* Section 7: Security (Light Gray) */}
      <div className="bg-bg-light border-y border-border-subtle">
        <Security />
      </div>

      {/* Section 8: Testimonials (White) */}
      <Testimonials />

      <CTA />

      {/* Temporary WordPress Display */}
      <section className="py-20 bg-slate-50 border-t border-border-subtle">
        <div className="section-container">
          <h1 className="text-3xl font-bold mb-8">WordPress Posts</h1>
          <div className="grid gap-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 bg-white border border-border-subtle rounded-xl">
                <h2 className="text-xl font-bold text-text-primary" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
