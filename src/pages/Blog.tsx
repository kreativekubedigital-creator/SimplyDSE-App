import { useEffect, useState } from 'react';
import Reveal from '../components/ui/Reveal';
import { getPosts } from "../services/wordpress";
import { ArrowRight, Calendar, User } from 'lucide-react';

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className="pt-32">
      <section className="py-24 bg-white">
        <div className="section-container">
          <Reveal>
            <span className="badge-enterprise">Insights & Updates</span>
            <h1 className="text-5xl md:text-7xl font-bold text-text-primary mt-6 tracking-tight leading-[1.1]">
              Knowledge for the <br />
              <span className="text-brand-primary">Modern Workplace.</span>
            </h1>
          </Reveal>

          {loading ? (
            <div className="py-32 flex justify-center">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-24">
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={i * 0.1} direction="up" hFull>
                  <article className="group h-full flex flex-col bg-slate-50 border border-border-subtle rounded-[2rem] overflow-hidden hover:border-brand-primary/30 transition-all hover:shadow-xl hover:-translate-y-1">
                    {/* Placeholder for featured image if missing */}
                    <div className="aspect-[16/9] bg-slate-200 overflow-hidden relative">
                       {/* You could add a dynamic image here if available in post._embedded */}
                       <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent" />
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          By Admin
                        </span>
                      </div>

                      <h2 
                        className="text-2xl font-bold text-text-primary mb-4 leading-tight group-hover:text-brand-primary transition-colors"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }} 
                      />
                      
                      <div 
                        className="text-text-secondary text-sm leading-relaxed mb-8 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: post.excerpt?.rendered }} 
                      />

                      <div className="mt-auto pt-6 border-t border-border-subtle flex items-center justify-between">
                        <span className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition-colors">Read Article</span>
                        <div className="w-8 h-8 rounded-full bg-white border border-border-subtle flex items-center justify-center group-hover:bg-brand-primary group-hover:border-brand-primary group-hover:text-white transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Blog;
