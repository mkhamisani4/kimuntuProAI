'use client';

import React from 'react';
import Link from 'next/link';
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
            ? 'bg-gray-900 border-gray-800'
            : 'bg-white border-gray-200'
            }`}>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
                    {/* Company Info */}
                    <div className="lg:col-span-2">
                        <div className={`inline-flex items-center gap-3 mb-6 p-3 rounded-2xl ${isDark
                            ? 'bg-gray-800/80 border border-gray-700'
                            : 'bg-white border border-gray-200'
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
                            {t.footerTagline}
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
                                        ? 'bg-gray-800 group-hover:bg-purple-500/20 border border-gray-700'
                                        : 'bg-gray-100 group-hover:bg-purple-100 border border-gray-200'
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
                                            ? 'text-gray-300 hover:text-purple-400'
                                            : 'text-gray-600 hover:text-purple-600'
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
                                            ? 'text-gray-300 hover:text-purple-400'
                                            : 'text-gray-600 hover:text-purple-600'
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
                                            ? 'text-gray-300 hover:text-purple-400'
                                            : 'text-gray-600 hover:text-purple-600'
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
                                            ? 'text-gray-300 hover:text-purple-400'
                                            : 'text-gray-600 hover:text-purple-600'
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
                    ? 'border-gray-800 bg-gray-800/80'
                    : 'border-gray-200 bg-gray-50'
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
                                {t.footerStayUpdated}
                            </h3>
                        </div>
                        <p className={`text-sm mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t.footerNewsletter}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder={t.footerEnterEmail}
                                className={`flex-1 px-5 py-3 rounded-xl text-sm transition-all ${isDark
                                    ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:bg-gray-600 focus:border-purple-500/50'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500'
                                    } focus:outline-none focus:ring-2 focus:ring-purple-500/30 shadow-lg`}
                            />
                            <button className="px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white text-sm font-semibold rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform">
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
                                    ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300'
                                    : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-600'
                                    } ${social.color} shadow-lg hover:shadow-xl`}
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
                        ? 'bg-gray-800/80 border border-gray-700'
                        : 'bg-white border border-gray-200'
                        }`}>
                        <Shield className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t.footerSSL}
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark
                        ? 'bg-gray-800/80 border border-gray-700'
                        : 'bg-white border border-gray-200'
                        }`}>
                        <FileText className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t.footerGDPRCompliant}
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark
                        ? 'bg-gray-800/80 border border-gray-700'
                        : 'bg-white border border-gray-200'
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
