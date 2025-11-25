import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube, FileText, Shield, Info, Heart, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Career Track', href: '#career' },
      { name: 'Business Track', href: '#business' },
      { name: 'Legal Track', href: '#legal' },
      { name: 'Innovative Track', href: '#innovative' },
      { name: 'Pricing', href: '#pricing' },
    ],
    company: [
      { name: 'About Us', href: '#/page/about' },
      { name: 'Our Team', href: '#/page/team' },
      { name: 'Careers', href: '#/page/careers' },
      { name: 'Blog', href: '#/page/blog' },
      { name: 'Press Kit', href: '#/page/press' },
    ],
    resources: [
      { name: 'Documentation', href: '#/page/docs' },
      { name: 'API Reference', href: '#/page/api' },
      { name: 'Community', href: '#/page/community' },
      { name: 'Support Center', href: '#/page/support' },
      { name: 'Status', href: '#/page/status' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#/page/privacy' },
      { name: 'Terms of Service', href: '#/page/terms' },
      { name: 'Cookie Policy', href: '#/page/cookies' },
      { name: 'GDPR Compliance', href: '#/page/gdpr' },
      { name: 'License', href: '#/page/license' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/kimuntupro', label: 'Facebook', color: 'hover:text-blue-500' },
    { icon: Twitter, href: 'https://twitter.com/kimuntupro', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Linkedin, href: 'https://linkedin.com/company/kimuntupro', label: 'LinkedIn', color: 'hover:text-blue-600' },
    { icon: Instagram, href: 'https://instagram.com/kimuntupro', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: Youtube, href: 'https://youtube.com/@kimuntupro', label: 'YouTube', color: 'hover:text-red-500' },
  ];

  const contactInfo = [
    { icon: Mail, text: 'contact@kimuntupro.com', href: 'mailto:contact@kimuntupro.com' },
    { icon: Phone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: MapPin, text: 'San Francisco, CA 94102', href: '#location' },
  ];

  return (
    <footer className={`relative overflow-hidden border-t backdrop-blur-3xl ${isDark
        ? 'bg-black/50 border-white/10'
        : 'bg-white/50 border-gray-200'
      }`}>
      {/* Animated Background Blur Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full filter blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-purple-500' : 'bg-purple-300'
          }`} style={{ animationDuration: '8s' }}></div>
        <div className={`absolute top-1/2 -right-40 w-80 h-80 rounded-full filter blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-pink-500' : 'bg-pink-300'
          }`} style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
        <div className={`absolute -bottom-40 left-1/3 w-72 h-72 rounded-full filter blur-3xl opacity-15 animate-pulse ${isDark ? 'bg-blue-500' : 'bg-blue-300'
          }`} style={{ animationDelay: '4s', animationDuration: '12s' }}></div>
        <div className={`absolute bottom-20 right-1/4 w-64 h-64 rounded-full filter blur-3xl opacity-10 animate-pulse ${isDark ? 'bg-indigo-500' : 'bg-indigo-300'
          }`} style={{ animationDelay: '6s', animationDuration: '14s' }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className={`absolute inset-0 ${isDark
          ? 'bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20'
          : 'bg-gradient-to-br from-purple-100/50 via-transparent to-pink-100/50'
        } pointer-events-none`}></div>

      {/* Glass effect overlay */}
      <div className={`absolute inset-0 ${isDark
          ? 'bg-gradient-to-br from-white/5 via-transparent to-transparent'
          : 'bg-gradient-to-br from-white/60 via-transparent to-transparent'
        } pointer-events-none`}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className={`inline-flex items-center gap-3 mb-6 p-3 rounded-2xl backdrop-blur-xl ${isDark
                ? 'bg-white/5 border border-white/10'
                : 'bg-white/60 border border-gray-200'
              }`}>
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg`}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 blur-xl opacity-50 animate-pulse"></div>
              </div>
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                KimuntuPro AI
              </span>
            </div>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              Empowering professionals with AI-driven solutions for career development, business growth, and legal assistance.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              {contactInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-3 text-sm transition-all group ${isDark
                      ? 'text-gray-300 hover:text-purple-400'
                      : 'text-gray-600 hover:text-purple-600'
                    }`}
                >
                  <div className={`p-2 rounded-lg transition-all ${isDark
                      ? 'bg-white/5 group-hover:bg-purple-500/20 border border-white/10'
                      : 'bg-white/60 group-hover:bg-purple-100 border border-gray-200'
                    }`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span>{item.text}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`text-sm transition-all hover:translate-x-1 inline-block ${isDark
                        ? 'text-gray-300 hover:text-purple-400'
                        : 'text-gray-600 hover:text-purple-600'
                      }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`text-sm transition-all hover:translate-x-1 inline-block ${isDark
                        ? 'text-gray-300 hover:text-purple-400'
                        : 'text-gray-600 hover:text-purple-600'
                      }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`text-sm transition-all hover:translate-x-1 inline-block ${isDark
                        ? 'text-gray-300 hover:text-purple-400'
                        : 'text-gray-600 hover:text-purple-600'
                      }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`text-sm transition-all hover:translate-x-1 inline-block ${isDark
                        ? 'text-gray-300 hover:text-purple-400'
                        : 'text-gray-600 hover:text-purple-600'
                      }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className={`relative overflow-hidden border rounded-3xl py-10 px-8 mb-10 backdrop-blur-2xl ${isDark
            ? 'border-white/10 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10'
            : 'border-gray-200 bg-gradient-to-br from-purple-100/50 via-pink-100/30 to-blue-100/50'
          }`}>
          {/* Background accent blur */}
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full filter blur-3xl opacity-30 ${isDark ? 'bg-purple-500' : 'bg-purple-300'
            }`}></div>
          <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full filter blur-3xl opacity-20 ${isDark ? 'bg-pink-500' : 'bg-pink-300'
            }`}></div>

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Mail className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Stay Updated
              </h3>
            </div>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Subscribe to our newsletter for the latest updates, features, and AI insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className={`flex-1 px-5 py-3 rounded-xl text-sm transition-all backdrop-blur-xl ${isDark
                    ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:bg-white/15 focus:border-purple-500/50'
                    : 'bg-white/70 border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/30 shadow-lg`}
              />
              <button className="px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white text-sm font-semibold rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className={`flex flex-col md:flex-row justify-between items-center gap-6 py-8 border-t border-b ${isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
          {/* Social Media Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={`p-3 rounded-xl transition-all transform hover:scale-110 backdrop-blur-xl ${isDark
                    ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300'
                    : 'bg-white/60 hover:bg-white border border-gray-200 text-gray-600'
                  } ${social.color} shadow-lg hover:shadow-xl`}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} text-center md:text-right`}>
            <p className="flex items-center justify-center md:justify-end gap-1.5 mb-1">
              © {currentYear} KimuntuPro AI. Made with <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> for Innovation
            </p>
            <p className="text-xs flex items-center justify-center md:justify-end gap-1">
              <Sparkles className="w-3 h-3" />
              Built with AI • Powered by Innovation
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className={`mt-8 pt-8 border-t flex flex-wrap justify-center gap-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl ${isDark
              ? 'bg-white/5 border border-white/10'
              : 'bg-white/60 border border-gray-200'
            }`}>
            <Shield className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              SSL Secured
            </span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl ${isDark
              ? 'bg-white/5 border border-white/10'
              : 'bg-white/60 border border-gray-200'
            }`}>
            <FileText className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              GDPR Compliant
            </span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl ${isDark
              ? 'bg-white/5 border border-white/10'
              : 'bg-white/60 border border-gray-200'
            }`}>
            <Info className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              SOC 2 Type II
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
