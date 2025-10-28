import React from 'react';
import { FileText, Target, Zap, BookOpen, TrendingUp, Scale, Briefcase, Users, ChevronRight } from 'lucide-react';

const Overview = ({ t }) => {
  const stats = [
    { label: t.documentsCreated, value: '12', icon: FileText, color: 'bg-blue-500' },
    { label: t.jobMatches, value: '48', icon: Target, color: 'bg-emerald-500' },
    { label: t.aiQueries, value: '156', icon: Zap, color: 'bg-purple-500' },
  ];

  const actions = [
    { title: t.createCvResume, desc: t.cvResumeDesc, icon: FileText, bg: 'bg-emerald-500/20', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    { title: t.businessPlan, desc: t.businessPlanDesc, icon: TrendingUp, bg: 'bg-blue-500/20', border: 'border-blue-500/20', text: 'text-blue-400' },
    { title: t.legalAssistant, desc: t.legalAssistantDesc, icon: Scale, bg: 'bg-purple-500/20', border: 'border-purple-500/20', text: 'text-purple-400' },
    { title: t.jobMatching, desc: t.jobMatchingDesc, icon: Briefcase, bg: 'bg-orange-500/20', border: 'border-orange-500/20', text: 'text-orange-400' },
    { title: t.interviewPrep, desc: t.interviewPrepDesc, icon: Users, bg: 'bg-pink-500/20', border: 'border-pink-500/20', text: 'text-pink-400' },
    { title: t.documentReview, desc: t.documentReviewDesc, icon: BookOpen, bg: 'bg-indigo-500/20', border: 'border-indigo-500/20', text: 'text-indigo-400' },
  ];

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-8">{t.dashboardOverview}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur border border-gray-800 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-emerald-400 opacity-50" />
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                <div className={`${stat.color} h-full w-3/4`}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {actions.map((action, i) => (
            <div
              key={i}
              className={`group ${action.bg} backdrop-blur border ${action.border} rounded-2xl p-6 text-left hover:bg-white/10 transition-all duration-300 cursor-pointer`}
            >
              <div className={`w-12 h-12 ${action.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-6 h-6 ${action.text}`} />
              </div>
              <h3 className="text-white font-semibold mb-2">{action.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{action.desc}</p>
              <div className="flex items-center text-emerald-400 text-sm font-medium">
                {t.getStarted} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;

