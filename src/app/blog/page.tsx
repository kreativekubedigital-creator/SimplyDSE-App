'use client';

import { motion } from 'framer-motion';
import { Search, ArrowRight, Calendar, Clock, User, ChevronRight, Filter } from 'lucide-react';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import Footer from '@/components/Footer';

export default function BlogPage() {
  const categories = ["All Posts", "Compliance", "H&S Strategy", "Product Updates", "Well-being"];

  const posts = [
    {
      title: "The Future of Hybrid DSE Assessments in 2026",
      excerpt: "How remote work is reshaping the landscape of corporate health and safety compliance.",
      category: "Compliance",
      author: "Sarah Jenkins",
      date: "May 12, 2026",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=2031",
      isFeatured: true
    },
    {
      title: "5 Ergonomic Myths That Are Hurting Your Team",
      excerpt: "Common misconceptions about workplace setups and what the data actually shows.",
      category: "Well-being",
      author: "Dr. Robert Chen",
      date: "May 10, 2026",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=2071"
    },
    {
      title: "Automating Compliance: A Guide for HR Leaders",
      excerpt: "Transitioning from manual spreadsheets to automated risk management dashboards.",
      category: "H&S Strategy",
      author: "James Wilson",
      date: "May 8, 2026",
      readTime: "12 min read",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2026"
    },
    {
      title: "SimplyDSE Q2 Product Roadmap: What's New?",
      excerpt: "Announcing advanced AI risk detection and integrated mental health surveys.",
      category: "Product Updates",
      author: "Marcus Thorne",
      date: "May 5, 2026",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070"
    }
  ];

  return (
    <div className="simplydse-root min-h-screen bg-white text-text-primary selection:bg-brand-primary/10 selection:text-brand-primary overflow-x-hidden">
      <ClientLayoutWrapper>
        <main className="relative pt-32 pb-20">
          
          {/* Header Section */}
          <div className="max-w-[1200px] mx-auto px-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/5 border border-brand-primary/10 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-brand-primary">Knowledge Hub</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8 text-text-primary leading-[1.1]">
                Insights for the <span className="text-brand-primary italic">modern</span> workplace.
              </h1>
              <p className="text-xl text-text-secondary leading-relaxed mb-10">
                Deep dives into compliance, ergonomics, and health & safety strategy from industry leaders.
              </p>
            </motion.div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-y border-border-subtle">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
                {categories.map((cat, i) => (
                  <button 
                    key={i}
                    className={`whitespace-nowrap px-5 py-2 rounded-full text-[13px] font-bold transition-all ${
                      i === 0 ? 'bg-brand-primary text-white' : 'bg-slate-50 text-text-secondary hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search articles..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-border-strong rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto px-6">
            {/* Featured Post */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative group cursor-pointer mb-20"
            >
              <div className="absolute inset-0 bg-brand-primary/10 blur-[60px] rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative glass-card overflow-hidden grid lg:grid-cols-2 gap-0">
                <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
                  <img 
                    src={posts[0].image} 
                    alt={posts[0].title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[11px] font-bold tracking-widest uppercase">
                      {posts[0].category}
                    </span>
                    <span className="text-[12px] text-text-secondary flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {posts[0].date}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-text-primary tracking-tight leading-tight group-hover:text-brand-primary transition-colors">
                    {posts[0].title}
                  </h2>
                  <p className="text-lg text-text-secondary leading-relaxed mb-8">
                    {posts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-8 border-t border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div>
                        <p className="text-sm font-bold">{posts[0].author}</p>
                        <p className="text-[11px] text-text-secondary">{posts[0].readTime}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-brand-primary group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Posts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(1).map((post, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden mb-6">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-md text-brand-primary text-[11px] font-bold tracking-widest uppercase shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="flex items-center gap-3 text-[12px] text-text-secondary mb-4">
                      <Calendar className="w-3 h-3" /> {post.date}
                      <span className="w-1 h-1 rounded-full bg-border-strong" />
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-brand-primary transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-6 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-brand-primary font-bold text-sm">
                      Read Article <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-20 flex items-center justify-center gap-4">
              <button className="w-10 h-10 rounded-xl bg-slate-50 border border-border-subtle flex items-center justify-center text-text-secondary hover:border-brand-primary transition-colors">1</button>
              <button className="w-10 h-10 rounded-xl bg-white border border-border-subtle flex items-center justify-center text-text-secondary hover:border-brand-primary transition-colors">2</button>
              <button className="w-10 h-10 rounded-xl bg-white border border-border-subtle flex items-center justify-center text-text-secondary hover:border-brand-primary transition-colors">3</button>
              <span className="text-text-secondary">...</span>
              <button className="w-10 h-10 rounded-xl bg-white border border-border-subtle flex items-center justify-center text-text-secondary hover:border-brand-primary transition-colors">12</button>
              <button className="px-6 py-2 rounded-xl bg-slate-50 border border-border-subtle text-[13px] font-bold text-text-secondary hover:border-brand-primary transition-colors flex items-center gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </ClientLayoutWrapper>
      <Footer />
    </div>
  );
}
