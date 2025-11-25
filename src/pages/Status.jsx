import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const Status = () => {
    const { isDark } = useTheme();

    const services = [
        {
            name: 'API Services',
            status: 'operational',
            uptime: '99.99%'
        },
        {
            name: 'Web Application',
            status: 'operational',
            uptime: '99.95%'
        },
        {
            name: 'AI Processing',
            status: 'operational',
            uptime: '99.92%'
        },
        {
            name: 'Database',
            status: 'operational',
            uptime: '100%'
        },
        {
            name: 'Authentication',
            status: 'operational',
            uptime: '99.98%'
        },
        {
            name: 'File Storage',
            status: 'operational',
            uptime: '99.94%'
        }
    ];

    const incidents = [
        {
            title: 'Scheduled Maintenance',
            date: 'November 25, 2024',
            status: 'scheduled',
            description: 'Routine database maintenance - expected downtime: 30 minutes'
        }
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'operational':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'degraded':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'outage':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'scheduled':
                return <Clock className="w-5 h-5 text-blue-500" />;
            default:
                return <CheckCircle className="w-5 h-5 text-green-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'operational':
                return 'Operational';
            case 'degraded':
                return 'Degraded Performance';
            case 'outage':
                return 'Service Outage';
            case 'scheduled':
                return 'Scheduled Maintenance';
            default:
                return 'Unknown';
        }
    };

    return (
        <PageWrapper title="System Status">
            <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    System Status
                </h2>

                {/* Overall Status */}
                <div className={`p-6 rounded-2xl border mb-10 ${isDark
                        ? 'bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/30'
                        : 'bg-gradient-to-br from-green-100 to-teal-100 border-green-300'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            All Systems Operational
                        </h3>
                    </div>
                    <p className="text-sm">
                        All services are running normally. Last updated: {new Date().toLocaleTimeString()}
                    </p>
                </div>

                {/* Service Status */}
                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Service Status
                    </h3>
                    <div className="space-y-3">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className={`p-5 rounded-xl border ${isDark
                                        ? 'bg-white/5 border-white/10'
                                        : 'bg-white/60 border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {getStatusIcon(service.status)}
                                        <div>
                                            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {service.name}
                                            </h4>
                                            <p className="text-sm">{getStatusText(service.status)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">Uptime</p>
                                        <p className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                            {service.uptime}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Incidents */}
                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Incidents & Maintenance
                    </h3>
                    {incidents.length > 0 ? (
                        <div className="space-y-4">
                            {incidents.map((incident, index) => (
                                <div
                                    key={index}
                                    className={`p-5 rounded-xl border ${isDark
                                            ? 'bg-white/5 border-white/10'
                                            : 'bg-white/60 border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-start gap-3 mb-2">
                                        {getStatusIcon(incident.status)}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {incident.title}
                                                </h4>
                                                <span className="text-sm">{incident.date}</span>
                                            </div>
                                            <p className="text-sm">{incident.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`p-8 rounded-xl border text-center ${isDark
                                ? 'bg-white/5 border-white/10'
                                : 'bg-white/60 border-gray-200'
                            }`}>
                            <CheckCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-green-400' : 'text-green-600'
                                }`} />
                            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                No incidents or maintenance scheduled
                            </p>
                        </div>
                    )}
                </section>

                {/* Performance Metrics */}
                <section className="mb-12">
                    <h3 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Performance Metrics (Last 30 Days)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`p-6 rounded-xl border ${isDark
                                ? 'bg-white/5 border-white/10'
                                : 'bg-white/60 border-gray-200'
                            }`}>
                            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Overall Uptime
                            </p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                99.96%
                            </p>
                        </div>
                        <div className={`p-6 rounded-xl border ${isDark
                                ? 'bg-white/5 border-white/10'
                                : 'bg-white/60 border-gray-200'
                            }`}>
                            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Avg Response Time
                            </p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                127ms
                            </p>
                        </div>
                        <div className={`p-6 rounded-xl border ${isDark
                                ? 'bg-white/5 border-white/10'
                                : 'bg-white/60 border-gray-200'
                            }`}>
                            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Incidents Resolved
                            </p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                                100%
                            </p>
                        </div>
                    </div>
                </section>

                <div className={`p-8 rounded-2xl border ${isDark
                        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300'
                    }`}>
                    <h3 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Subscribe to Updates
                    </h3>
                    <p className="mb-6">
                        Get notified about incidents and scheduled maintenance via email.
                    </p>
                    <div className="flex gap-3 max-w-md">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className={`flex-1 px-4 py-3 rounded-lg ${isDark
                                    ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400'
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                        />
                        <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Status;
