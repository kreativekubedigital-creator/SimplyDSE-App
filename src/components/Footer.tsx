import { Mail, Phone, MapPin, Globe, MessageSquare } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border-subtle pt-24 pb-12">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Column */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <img 
                src="/simplydselogo.webp" 
                alt="SimplyDSE Logo" 
                className="w-8 h-8"
              />
              <span className="text-2xl font-bold text-text-primary tracking-tighter">SimplyDSE</span>
            </div>
            <p className="text-text-secondary leading-relaxed max-w-xs text-sm">
              The premium enterprise operating system for workplace compliance and employee health.
            </p>
            <div className="flex items-center gap-4 text-text-muted">
              <a href="#" className="hover:text-brand-primary transition-colors duration-300">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-brand-primary transition-colors duration-300">
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-8">
            <h4 className="label-secondary">Platform</h4>
            <ul className="space-y-4">
              {['Features', 'Operational Workflow', 'Risk Intelligence', 'Enterprise Security'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-text-secondary hover:text-brand-primary transition-colors duration-300 font-medium">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-8">
            <h4 className="label-secondary">Resources</h4>
            <ul className="space-y-4">
              {[
                { name: 'About SimplyDSE', href: '/about' },
                { name: 'Clinical Framework', href: '#' },
                { name: 'Case Studies', href: '#' },
                { name: 'Compliance Blog', href: '/blog' }
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-text-secondary hover:text-brand-primary transition-colors duration-300 font-medium">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Info */}
          <div className="space-y-8">
            <h4 className="label-secondary">Support</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-text-secondary font-medium">
                <Mail className="w-4 h-4 mt-0.5 text-text-muted" />
                <span>support@simplydse.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-secondary font-medium">
                <Phone className="w-4 h-4 mt-0.5 text-text-muted" />
                <span>+44 (0) 20 1234 5678</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-secondary font-medium">
                <MapPin className="w-4 h-4 mt-0.5 text-text-muted" />
                <span>London Headquarters,<br />United Kingdom</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            © {currentYear} SimplyDSE Enterprise. Scalable Compliance.
          </p>
          <div className="flex gap-10">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((item) => (
              <a key={item} href="#" className="text-[10px] font-bold text-text-muted hover:text-text-primary uppercase tracking-widest transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

