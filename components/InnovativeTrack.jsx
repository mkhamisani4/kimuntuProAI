'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles, Lightbulb, Rocket, Brain, Zap, TrendingUp,
  Target, Users, Code, Database, Cloud, Shield,
  ChevronRight, Check, X, Plus, Save, Loader, AlertCircle, Home
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
  saveProject,
  getUserProjects,
  updateProject,
  deleteProject
} from '@/lib/services/innovativeTrackService';
import AIAssistantModal from '@/components/AIAssistantModal';


const InnovativeTrack = ({ user }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for new project
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'ai-ml',
    status: 'ideation',
    goals: '',
    challenges: '',
    resources: '',
  });

  useEffect(() => {
    if (user) {
      loadUserProjects();
    }
  }, [user]);

  const loadUserProjects = async () => {
    try {
      setLoading(true);
      const userProjects = await getUserProjects(user.uid);
      setProjects(userProjects);
    } catch (err) {
      setError('Failed to load projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!newProject.title || !newProject.description) {
      setError('Please fill in title and description');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await saveProject(user.uid, newProject);
      setSuccess('Project saved successfully!');
      setNewProject({
        title: '',
        description: '',
        category: 'ai-ml',
        status: 'ideation',
        goals: '',
        challenges: '',
        resources: '',
      });
      await loadUserProjects();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save project: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject?.title || !selectedProject?.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await updateProject(selectedProject.id, selectedProject);
      setSuccess('Project updated successfully!');
      setIsEditing(false);
      await loadUserProjects();
      setTimeout(() => {
        setSuccess('');
        setSelectedProject(null);
      }, 2000);
    } catch (err) {
      setError('Failed to update project: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        await loadUserProjects();
        setSuccess('Project deleted successfully');
        setSelectedProject(null);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete project: ' + err.message);
      }
    }
  };

  const features = [
    {
      icon: Brain,
      title: t.innovativeAIIdeation,
      description: t.innovativeAIIdeationDesc,
      color: 'from-purple-500 to-pink-500',
      textColor: isDark ? 'text-purple-400' : 'text-purple-600',
    },
    {
      icon: Rocket,
      title: t.innovativeRapidPrototyping,
      description: t.innovativeRapidPrototypingDesc,
      color: 'from-blue-500 to-cyan-500',
      textColor: isDark ? 'text-blue-400' : 'text-blue-600',
    },
    {
      icon: TrendingUp,
      title: t.innovativeMarketAnalysis,
      description: t.innovativeMarketAnalysisDesc,
      color: 'from-green-500 to-teal-500',
      textColor: isDark ? 'text-green-400' : 'text-green-600',
    },
    {
      icon: Users,
      title: t.innovativeTeamCollaboration,
      description: t.innovativeTeamCollaborationDesc,
      color: 'from-orange-500 to-red-500',
      textColor: isDark ? 'text-orange-400' : 'text-orange-600',
    },
    {
      icon: Database,
      title: t.innovativeDataAnalytics,
      description: t.innovativeDataAnalyticsDesc,
      color: 'from-indigo-500 to-purple-500',
      textColor: isDark ? 'text-indigo-400' : 'text-indigo-600',
    },
    {
      icon: Shield,
      title: t.innovativeIPProtection,
      description: t.innovativeIPProtectionDesc,
      color: 'from-pink-500 to-rose-500',
      textColor: isDark ? 'text-pink-400' : 'text-pink-600',
    },
  ];

  const categories = [
    { value: 'ai-ml', label: 'AI & Machine Learning', icon: Brain },
    { value: 'blockchain', label: 'Blockchain & Web3', icon: Database },
    { value: 'iot', label: 'IoT & Hardware', icon: Zap },
    { value: 'saas', label: 'SaaS & Cloud', icon: Cloud },
    { value: 'fintech', label: 'FinTech', icon: TrendingUp },
    { value: 'other', label: 'Other', icon: Sparkles },
  ];

  const statusOptions = [
    { value: 'ideation', label: 'Ideation', color: 'bg-yellow-500' },
    { value: 'planning', label: 'Planning', color: 'bg-blue-500' },
    { value: 'development', label: 'Development', color: 'bg-purple-500' },
    { value: 'testing', label: 'Testing', color: 'bg-orange-500' },
    { value: 'launch', label: 'Launch', color: 'bg-green-500' },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl p-8 ${isDark
        ? 'bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-blue-900/50'
        : 'bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100'
        }`}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t.innovativeTrack}
            </h2>
          </div>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t.innovativeTrackDesc}
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab('create')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t.innovativeStartProject}
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${isDark
                ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              {t.innovativeViewProjects} ({projects.length})
            </button>
          </div>
        </div>
        {/* Animated background circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
              className={`group relative rounded-2xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer ${isDark
              ? 'bg-gray-800/80 border border-gray-700 hover:bg-gray-700'
              : 'bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-2xl p-6 ${isDark
          ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30'
          : 'bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-300'
          }`}>
          <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            {projects.length}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.innovativeActiveProjects}
          </div>
        </div>
        <div className={`rounded-2xl p-6 ${isDark
          ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30'
          : 'bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-300'
          }`}>
          <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {projects.filter(p => p.status === 'development').length}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.innovativeInDevelopment}
          </div>
        </div>
        <div className={`rounded-2xl p-6 ${isDark
          ? 'bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/30'
          : 'bg-gradient-to-br from-green-100 to-teal-100 border border-green-300'
          }`}>
          <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            {projects.filter(p => p.status === 'launch').length}
          </div>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.innovativeLaunched}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreateProject = () => (
    <div className="max-w-4xl mx-auto">
        <div className={`rounded-2xl p-8 ${isDark
        ? 'bg-gray-900/80 border border-gray-800'
        : 'bg-white border border-gray-200'
        }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.innovativeCreateProject}
          </h2>
          <button
            onClick={() => setShowAIAssistant(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            {t.innovativeAIAssistant}
          </button>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${isDark
            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
            : 'bg-red-50 border border-red-300 text-red-700'
            }`}>
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${isDark
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-green-50 border border-green-300 text-green-700'
            }`}>
            <Check className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
              {t.innovativeProjectTitle} *
            </label>
            <input
              type="text"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              placeholder={t.innovativeProjectTitle}
              className={`w-full px-4 py-3 rounded-xl transition-all ${isDark
                ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
              {t.innovativeDescription} *
            </label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder={t.innovativeDescription}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl transition-all ${isDark
                ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            />
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
              {t.innovativeCategory}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setNewProject({ ...newProject, category: cat.value })}
                  className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${newProject.category === cat.value
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : isDark
                      ? 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
              {t.innovativeCurrentStatus}
            </label>
            <div className="flex flex-wrap gap-3">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setNewProject({ ...newProject, status: status.value })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${newProject.status === status.value
                    ? `${status.color} text-white`
                    : isDark
                      ? 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
              {t.innovativeProjectGoals}
            </label>
            <textarea
              value={newProject.goals}
              onChange={(e) => setNewProject({ ...newProject, goals: e.target.value })}
              placeholder={t.innovativeProjectGoals}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl transition-all ${isDark
                ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            />
          </div>

          {/* Challenges */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
              {t.innovativeChallengesRisks}
            </label>
            <textarea
              value={newProject.challenges}
              onChange={(e) => setNewProject({ ...newProject, challenges: e.target.value })}
              placeholder={t.innovativeChallengesRisks}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl transition-all ${isDark
                ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            />
          </div>

          {/* Resources */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
              {t.innovativeRequiredResources}
            </label>
            <textarea
              value={newProject.resources}
              onChange={(e) => setNewProject({ ...newProject, resources: e.target.value })}
              placeholder={t.innovativeRequiredResources}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl transition-all ${isDark
                ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50'
                : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              onClick={handleSaveProject}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  {t.innovativeSaving}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t.innovativeSaveProject}
                </>
              )}
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${isDark
                ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                }`}
            >
              {t.innovativeCancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t.innovativeMyProjects}
        </h2>
        <button
          onClick={() => setActiveTab('create')}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t.innovativeNewProject}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className={`w-8 h-8 animate-spin ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
        </div>
      ) : projects.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl ${isDark
          ? 'bg-white/5 border border-white/10'
          : 'bg-white/60 border border-gray-200'
          }`}>
          <Lightbulb className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.innovativeNoProjects}
          </p>
          <button
            onClick={() => setActiveTab('create')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
          >
            {t.innovativeCreateFirstProject}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => {
            const status = statusOptions.find(s => s.value === project.status);
            const category = categories.find(c => c.value === project.category);
            return (
              <div
                key={project.id}
                onClick={() => {
                  setSelectedProject(project);
                  setIsEditing(false);
                }}
                className={`rounded-2xl p-6 transition-all hover:scale-105 cursor-pointer ${isDark
                  ? 'bg-gray-800/80 border border-gray-700 hover:bg-gray-700'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {category && <category.icon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />}
                    <span className={`text-xs px-2 py-1 rounded-full ${isDark
                      ? 'bg-white/10 text-gray-400'
                      : 'bg-gray-100 text-gray-600'
                      }`}>
                      {category?.label}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {status && (
                      <span className={`text-xs px-3 py-1 rounded-full text-white ${status.color}`}>
                        {status.label}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      className={`p-1 rounded-lg transition-all ${isDark
                        ? 'hover:bg-red-500/20 text-red-400'
                        : 'hover:bg-red-100 text-red-600'
                        }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {project.title}
                </h3>
                <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {project.description}
                </p>
                {project.goals && (
                    <div className={`text-sm mt-3 pt-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'
                    }`}>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Goals: </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{project.goals}</span>
                  </div>
                )}
                <div className={`text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Created: {new Date(project.createdAt?.toDate()).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: t.overview, icon: Home },
    { id: 'create', label: t.innovativeCreateProjectTab, icon: Plus },
    { id: 'projects', label: t.innovativeMyProjects, icon: Target },
  ];

  const handleAISuggestion = (field, value) => {
    setNewProject(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div className={`flex gap-2 mb-8 p-2 rounded-2xl ${isDark
        ? 'bg-gray-800/80 border border-gray-700'
        : 'bg-white border border-gray-200'
        }`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : isDark
                ? 'text-gray-400 hover:bg-gray-800'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'create' && renderCreateProject()}
        {activeTab === 'projects' && renderProjects()}
      </div>

      {/* Project Detail/Edit Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl ${isDark
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200'
              } shadow-2xl`}
          >
            {/* Header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
              }`}>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {isEditing ? 'Edit Project' : 'Project Details'}
              </h2>
              <div className="flex gap-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text- rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Edit Project
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setIsEditing(false);
                  }}
                  className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${isDark
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                  : 'bg-red-50 border border-red-300 text-red-700'
                  }`}>
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${isDark
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                  : 'bg-green-50 border border-green-300 text-green-700'
                  }`}>
                  <Check className="w-5 h-5" />
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Project Title *
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={selectedProject.title}
                      onChange={(e) => setSelectedProject({ ...selectedProject, title: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg ${isDark
                        ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                    />
                  ) : (
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedProject.title}
                    </h3>
                  )}
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category
                    </label>
                    {isEditing ? (
                      <select
                        value={selectedProject.category}
                        onChange={(e) => setSelectedProject({ ...selectedProject, category: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg ${isDark
                          ? 'bg-white/5 border border-white/10 text-white'
                          : 'bg-white border border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    ) : (
                      <p className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                        {categories.find(c => c.value === selectedProject.category)?.label}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    {isEditing ? (
                      <select
                        value={selectedProject.status}
                        onChange={(e) => setSelectedProject({ ...selectedProject, status: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg ${isDark
                          ? 'bg-white/5 border border-white/10 text-white'
                          : 'bg-white border border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                      >
                        {statusOptions.map(stat => (
                          <option key={stat.value} value={stat.value}>{stat.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`inline-block px-4 py-2 rounded-lg text-white ${statusOptions.find(s => s.value === selectedProject.status)?.color
                        }`}>
                        {statusOptions.find(s => s.value === selectedProject.status)?.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description *
                  </label>
                  {isEditing ? (
                    <textarea
                      value={selectedProject.description}
                      onChange={(e) => setSelectedProject({ ...selectedProject, description: e.target.value })}
                      rows={4}
                      className={`w-full px-4 py-3 rounded-lg ${isDark
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                        : 'bg-white border border-gray border-gray-300 text-gray-900 placeholder-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                    />
                  ) : (
                    <p className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedProject.description}
                    </p>
                  )}
                </div>

                {/* Goals */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Goals
                  </label>
                  {isEditing ? (
                    <textarea
                      value={selectedProject.goals || ''}
                      onChange={(e) => setSelectedProject({ ...selectedProject, goals: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg ${isDark
                        ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                    />
                  ) : (
                    <p className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedProject.goals || 'No goals set'}
                    </p>
                  )}
                </div>

                {/* Challenges */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Challenges
                  </label>
                  {isEditing ? (
                    <textarea
                      value={selectedProject.challenges || ''}
                      onChange={(e) => setSelectedProject({ ...selectedProject, challenges: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg ${isDark
                        ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                    />
                  ) : (
                    <p className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedProject.challenges || 'No challenges identified'}
                    </p>
                  )}
                </div>

                {/* Resources */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Resources
                  </label>
                  {isEditing ? (
                    <textarea
                      value={selectedProject.resources || ''}
                      onChange={(e) => setSelectedProject({ ...selectedProject, resources: e.target.value })}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-lg ${isDark
                        ? 'bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                    />
                  ) : (
                    <p className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {selectedProject.resources || 'No resources listed'}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateProject}
                      disabled={saving}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        // Reset to original project data
                        const original = projects.find(p => p.id === selectedProject.id);
                        if (original) setSelectedProject(original);
                      }}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all ${isDark
                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                        : 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        currentProject={newProject}
        onApplySuggestion={handleAISuggestion}
      />
    </div>
  );
};

export default InnovativeTrack;

