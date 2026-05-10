import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from '../services/wordpress';
import Reveal from '../components/ui/Reveal';
import { Calendar, User, ArrowLeft, Share2, Clock } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      getPostBySlug(slug).then((data) => {
        setPost(data);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-32">
        <h1 className="text-4xl font-bold text-text-primary mb-6">Post Not Found</h1>
        <Link to="/blog" className="inline-flex items-center gap-2 text-brand-primary font-bold hover:gap-3 transition-all">
          <ArrowLeft className="w-5 h-5" /> Back to Blog
        </Link>
      </div>
    );
  }

  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <main className="bg-white">
      {/* Header Section */}
      <section className="pt-40 pb-20 bg-slate-50 border-b border-border-subtle">
        <div className="section-container max-w-4xl">
          <Reveal>
            <Link to="/blog" className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary font-bold mb-12 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Blog
            </Link>
            
            <div className="flex items-center gap-6 mb-8">
              <span className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-widest">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                5 Min Read
              </span>
            </div>

            <h1 
              className="text-4xl md:text-6xl font-bold text-text-primary tracking-tight leading-[1.1] mb-12"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            <div className="flex items-center justify-between border-t border-border-subtle pt-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">SimplyDSE Editorial</p>
                  <p className="text-xs text-text-muted">Compliance Experts</p>
                </div>
              </div>
              
              <button className="p-3 rounded-full bg-white border border-border-subtle hover:border-brand-primary/30 hover:text-brand-primary transition-all shadow-sm">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured Image */}
      {featuredImage && (
        <section className="-mt-10 mb-20">
          <div className="section-container max-w-5xl">
            <Reveal delay={0.2}>
              <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20">
                <img 
                  src={featuredImage} 
                  alt={post.title.rendered}
                  className="w-full h-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="pb-32">
        <div className="section-container max-w-3xl">
          <Reveal delay={0.3}>
            <div 
              className="prose prose-lg prose-slate max-w-none 
                prose-headings:text-text-primary prose-headings:font-bold prose-headings:tracking-tight
                prose-p:text-text-secondary prose-p:leading-relaxed
                prose-strong:text-text-primary prose-strong:font-bold
                prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-3xl prose-img:shadow-lg
                prose-blockquote:border-l-brand-primary prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />
          </Reveal>

          {/* Tag Section */}
          <div className="mt-20 pt-10 border-t border-border-subtle">
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-slate-50 border border-border-subtle rounded-full text-xs font-bold text-text-muted hover:border-brand-primary/20 hover:text-brand-primary transition-all cursor-default">Compliance</span>
              <span className="px-4 py-2 bg-slate-50 border border-border-subtle rounded-full text-xs font-bold text-text-muted hover:border-brand-primary/20 hover:text-brand-primary transition-all cursor-default">Health & Safety</span>
              <span className="px-4 py-2 bg-slate-50 border border-border-subtle rounded-full text-xs font-bold text-text-muted hover:border-brand-primary/20 hover:text-brand-primary transition-all cursor-default">DSE Assessments</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BlogPost;
