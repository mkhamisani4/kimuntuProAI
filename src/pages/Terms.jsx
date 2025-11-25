import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../context/ThemeContext';

const Terms = () => {
    const { isDark } = useTheme();

    return (
        <PageWrapper title="Terms of Service">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Terms of Service
                </h2>
                <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        1. Acceptance of Terms
                    </h3>
                    <p className="mb-4">
                        By accessing and using KimuntuPro AI, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        2. Use License
                    </h3>
                    <p className="mb-4">
                        Permission is granted to temporarily access and use the KimuntuPro AI platform for personal or commercial purposes. This license shall automatically terminate if you violate any of these restrictions.
                    </p>
                    <p className="mb-4">You agree not to:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Modify or copy the materials</li>
                        <li>Use the materials for commercial purposes without authorization</li>
                        <li>Attempt to reverse engineer any software on the platform</li>
                        <li>Remove any copyright or proprietary notations</li>
                        <li>Transfer the materials to another person or "mirror" the materials</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        3. User Accounts
                    </h3>
                    <p className="mb-4">
                        You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        4. User Content
                    </h3>
                    <p className="mb-4">
                        You retain all rights to the content you create using our platform. By using our AI services, you grant us a license to process your content to provide our services.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        5. Disclaimer
                    </h3>
                    <p className="mb-4">
                        The materials on KimuntuPro AI are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        6. Limitations
                    </h3>
                    <p className="mb-4">
                        In no event shall KimuntuPro AI or its suppliers be liable for any damages arising out of the use or inability to use the materials on the platform.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        7. Termination
                    </h3>
                    <p className="mb-4">
                        We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        8. Changes to Terms
                    </h3>
                    <p className="mb-4">
                        We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the platform.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        9. Contact Information
                    </h3>
                    <p className="mb-4">
                        For questions about these Terms, contact us at:
                    </p>
                    <p className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        legal@kimuntupro.com
                    </p>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Terms;
