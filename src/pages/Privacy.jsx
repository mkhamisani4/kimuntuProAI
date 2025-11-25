import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../context/ThemeContext';

const Privacy = () => {
    const { isDark } = useTheme();

    return (
        <PageWrapper title="Privacy Policy">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Privacy Policy
                </h2>
                <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        1. Information We Collect
                    </h3>
                    <p className="mb-4">
                        At KimuntuPro AI, we collect information that you provide directly to us, including:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Account information (email address, name)</li>
                        <li>Project data and documents you create</li>
                        <li>Usage data and preferences</li>
                        <li>Communication and support interactions</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        2. How We Use Your Information
                    </h3>
                    <p className="mb-4">
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process your transactions and send related information</li>
                        <li>Send you technical notices and support messages</li>
                        <li>Respond to your comments and questions</li>
                        <li>Develop new features and services</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        3. Data Security
                    </h3>
                    <p className="mb-4">
                        We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. Your data is encrypted in transit and at rest.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        4. Data Sharing
                    </h3>
                    <p className="mb-4">
                        We do not sell your personal information. We may share your information only in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>With your consent</li>
                        <li>With service providers who assist in our operations</li>
                        <li>To comply with legal obligations</li>
                        <li>To protect our rights and prevent fraud</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        5. Your Rights
                    </h3>
                    <p className="mb-4">
                        You have the right to:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Access your personal data</li>
                        <li>Correct inaccurate data</li>
                        <li>Request deletion of your data</li>
                        <li>Object to processing of your data</li>
                        <li>Export your data</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        6. Cookies
                    </h3>
                    <p className="mb-4">
                        We use cookies and similar technologies to provide and improve our services. See our Cookie Policy for more information.
                    </p>
                </section>

                <section className="mb-8">
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        7. Contact Us
                    </h3>
                    <p className="mb-4">
                        If you have questions about this Privacy Policy, please contact us at:
                    </p>
                    <p className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        privacy@kimuntupro.com
                    </p>
                </section>
            </div>
        </PageWrapper>
    );
};

export default Privacy;
