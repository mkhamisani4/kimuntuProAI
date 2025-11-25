import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../context/ThemeContext';
import { Code2, Lock, Zap, Database } from 'lucide-react';

const API = () => {
    const { isDark } = useTheme();

    const endpoints = [
        {
            method: 'POST',
            path: '/api/v1/projects/create',
            description: 'Create a new project'
        },
        {
            method: 'GET',
            path: '/api/v1/projects/{id}',
            description: 'Get project details'
        },
        {
            method: 'PUT',
            path: '/api/v1/projects/{id}',
            description: 'Update a project'
        },
        {
            method: 'DELETE',
            path: '/api/v1/projects/{id}',
            description: 'Delete a project'
        }
    ];

    const features = [
        {
            icon: Lock,
            title: 'Secure Authentication',
            description: 'OAuth 2.0 and API key authentication'
        },
        {
            icon: Zap,
            title: 'High Performance',
            description: 'Fast response times with 99.9% uptime'
        },
        {
            icon: Database,
            title: 'Rich Data Access',
            description: 'Access all your platform data programmatically'
        },
        {
            icon: Code2,
            title: 'Developer Friendly',
            description: 'Well-documented RESTful API with SDKs'
        }
    ];

    return (
        <PageWrapper title="API Reference">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    API Reference
                </h2>
                <p className="text-lg mb-10">
                    Integrate KimuntuPro AI into your applications with our comprehensive API.
                </p>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        API Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`p-6 rounded-2xl border ${isDark
                                        ? 'bg-white/5 border-white/10'
                                        : 'bg-white/60 border-gray-200'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                    }`}>
                                    <feature.icon className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'
                                        }`} />
                                </div>
                                <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {feature.title}
                                </h4>
                                <p className="text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Getting Started
                    </h3>
                    <div className={`p-6 rounded-2xl border ${isDark
                            ? 'bg-white/5 border-white/10'
                            : 'bg-white/60 border-gray-200'
                        }`}>
                        <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            1. Get Your API Key
                        </h4>
                        <p className="mb-4">
                            Sign in to your account and navigate to Settings → API Keys to generate your API key.
                        </p>

                        <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            2. Make Your First Request
                        </h4>
                        <div className={`p-4 rounded-lg font-mono text-sm mb-4 ${isDark ? 'bg-black/40' : 'bg-gray-100'
                            }`}>
                            <code>
                                curl -H "Authorization: Bearer YOUR_API_KEY" \<br />
                                &nbsp;&nbsp;https://api.kimuntupro.com/v1/projects
                            </code>
                        </div>

                        <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            3. Explore the Documentation
                        </h4>
                        <p>
                            Check out our comprehensive API documentation for detailed endpoint information, request/response examples, and best practices.
                        </p>
                    </div>
                </section>

                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Common Endpoints
                    </h3>
                    <div className="space-y-3">
                        {endpoints.map((endpoint, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-xl border ${isDark
                                        ? 'bg-white/5 border-white/10'
                                        : 'bg-white/60 border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${endpoint.method === 'GET' ? 'bg-blue-500' :
                                            endpoint.method === 'POST' ? 'bg-green-500' :
                                                endpoint.method === 'PUT' ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                        } text-white`}>
                                        {endpoint.method}
                                    </span>
                                    <code className={`font-mono text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                        {endpoint.path}
                                    </code>
                                    <span className="ml-auto text-sm">{endpoint.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className={`p-8 rounded-2xl border ${isDark
                        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
                    }`}>
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Need Help with the API?
                    </h3>
                    <p className="mb-4">
                        Our developer support team is here to help you integrate successfully.
                    </p>
                    <p className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        api-support@kimuntupro.com
                    </p>
                </div>
            </div>
        </PageWrapper>
    );
};

export default API;
