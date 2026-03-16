'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube, FileText, Shield, Info, Heart, Sparkles } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

const Footer = () => {
    const { isDark } = useTheme();
    const { t } = useLanguage();

    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { name: t.career, href: '/dashboard/career' },
            { name: t.business, href: '/dashboard/business' },
            { name: t.legal, href: '/dashboard/legal' },
            { name: t.innovative, href: '/dashboard/innovative' },
            { name: t.pricing, href: '/dashboard/pricing' },
        ],
        company: [
            { name: t.footerAboutUs, href: '/about' },
            { name: t.footerTeam, href: '/team' },
            { name: t.footerCareers, href: '/careers' },
            { name: t.footerBlog, href: '/blog' },
            { name: t.footerPress, href: '/press' },
        ],
        resources: [
            { name: t.footerResearch, href: '/research' },
            { name: t.footerDatabase, href: '/database' },
            { name: t.footerLegalAI, href: '/chat' },
            { name: t.footerOnboarding, href: '/onboarding' },
            { name: t.footerDocs, href: '/docs' },
            { name: t.footerAPI, href: '/api' },
            { name: t.footerCommunity, href: '/community' },
            { name: t.footerSupport, href: '/support' },
            { name: t.footerStatus, href: '/status' },
        ],
        legal: [
            { name: t.footerPrivacy, href: '/privacy' },
            { name: t.footerTerms, href: '/terms' },
            { name: t.footerCookies, href: '/cookies' },
            { name: t.footerGDPR, href: '/gdpr' },
            { name: t.footerLicense, href: '/license' },
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
        <footer className={`relative overflow-hidden border-t ${isDark
            ? 'bg-black/80 backdrop-blur-xl border-white/10'
            : 'bg-white/80 backdrop-blur-xl border-black/5'
            }`}>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
                    {/* Company Info */}
                    <div className="lg:col-span-2">
                        <div className={`inline-flex items-center gap-3 mb-6 p-3 rounded-2xl ${isDark
                            ? 'bg-white/5 border border-white/10'
                            : 'bg-black/5 border border-black/10'
                            }`}>
                            <Image src="/assets/LOGOS(9).svg" alt="Kimuntu Logo" width={48} height={48} />
                            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                Kimuntu
                            </span>
                        </div>
                        <p className={`text-sm mb-6 ${isDark ? 'text-white/70' : 'text-black/70'} leading-relaxed`}>
                            {t.footerTagline}
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            {contactInfo.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.href}
                                    className={`flex items-center gap-3 text-sm transition-all group ${isDark
                                        ? 'text-white/70 hover:text-white'
                                        : 'text-black/70 hover:text-black'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg transition-all ${isDark
                                        ? 'bg-white/5 group-hover:bg-white/10 border border-white/10'
                                        : 'bg-black/5 group-hover:bg-black/10 border border-black/10'
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
                            {t.footerProduct}
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className={`text-sm transition-all hover:translate-x-1 inline-block ${isDark
                                            ? 'text-white/70 hover:text-white'
                                            : 'text-black/70 hover:text-black'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.footerCompany}
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className={`text-sm transition-all hover:translate-x-1 inline-block ${isDark
                                            ? 'text-white/70 hover:text-white'
                                            : 'text-black/70 hover:text-black'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.footerResources}
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className={`text-sm transition-all hover:translate-x-1 inline-block ${isDark
                                            ? 'text-white/70 hover:text-white'
                                            : 'text-black/70 hover:text-black'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.footerLegal}
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className={`text-sm transition-all hover:translate-x-1 inline-block ${isDark
                                            ? 'text-white/70 hover:text-white'
                                            : 'text-black/70 hover:text-black'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className={`relative overflow-hidden border rounded-3xl py-10 px-8 mb-10 ${isDark
                    ? 'border-white/10 bg-white/5'
                    : 'border-black/10 bg-black/5'
                    }`}>
                    <div className="relative z-10 max-w-2xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <Mail className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} />
                            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                {t.footerStayUpdated}
                            </h3>
                        </div>
                        <p className={`text-sm mb-6 ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                            {t.footerNewsletter}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder={t.footerEnterEmail}
                                className={`flex-1 px-5 py-3 rounded-xl text-sm transition-all ${isDark
                                    ? 'bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/20 focus:border-white/40'
                                    : 'bg-white border border-black/20 text-black placeholder-black/40 focus:bg-white focus:border-black/40'
                                    } focus:outline-none focus:ring-2 focus:ring-white/20 shadow-lg`}
                            />
                            <button className={`px-8 py-3 text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 transform ${isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'}`}>
                                {t.footerSubscribe}
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
                                className={`p-3 rounded-xl transition-all transform hover:scale-110 ${isDark
                                    ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                                    : 'bg-black/5 hover:bg-black/10 border border-black/10 text-black'
                                    } shadow-lg hover:shadow-xl`}
                            >
                                <social.icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>

                    {/* Copyright */}
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} text-center md:text-right`}>
                        <p className="flex items-center justify-center md:justify-end gap-1.5 mb-1">
                            © {currentYear} KimuntuPro AI. {t.footerMadeWith} <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" /> {t.footerForInnovation}
                        </p>
                        <p className="text-xs flex items-center justify-center md:justify-end gap-1">
                            <Sparkles className="w-3 h-3" />
                            {t.footerBuiltWith}
                        </p>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className={`mt-8 pt-8 border-t flex flex-wrap justify-center gap-8 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark
                        ? 'bg-white/5 border border-white/10'
                        : 'bg-black/5 border border-black/10'
                        }`}>
                        <Shield className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t.footerSSL}
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark
                        ? 'bg-white/5 border border-white/10'
                        : 'bg-black/5 border border-black/10'
                        }`}>
                        <FileText className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t.footerGDPRCompliant}
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark
                        ? 'bg-white/5 border border-white/10'
                        : 'bg-black/5 border border-black/10'
                        }`}>
                        <Info className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t.footerSOC2}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
